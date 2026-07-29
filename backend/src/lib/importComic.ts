import sharp from "sharp";
import { db } from "../db.js";
import { putObject, deletePrefix } from "../storage.js";
import { readArchive } from "./archiveReader.js";
import { parseComicInfo } from "./comicInfo.js";

const PAGE_MAX_WIDTH = 2000;
const PAGE_WEBP_QUALITY = 82;
const COVER_WIDTH = 480;

/**
 * Runs the full import pipeline for a comic that's already been created in
 * the DB with status "processing". Fire-and-forget from the upload route —
 * this can take anywhere from a few seconds to a couple minutes depending
 * on page count, so the client polls GET /api/comics/:id for status instead
 * of the upload request blocking on it.
 *
 * Failure mode: if the process crashes mid-import, the comic is left stuck
 * in "processing" forever. Fine for a single-user app you're watching while
 * it runs; if that becomes annoying, the fix is a small "sweep stale
 * processing rows on boot" job — not a full queue system.
 */
export async function importComic(
  comicId: string,
  archiveBuffer: Buffer,
  format: "cbz" | "cbr",
  originalFileName: string
): Promise<void> {
  try {
    const { pages, comicInfoXml } = await readArchive(archiveBuffer, format);
    const info = comicInfoXml ? parseComicInfo(comicInfoXml) : {};

    let coverKey: string | undefined;

    for (let index = 0; index < pages.length; index++) {
      const page = pages[index]!;
      const image = sharp(page.data).rotate(); // .rotate() with no args auto-orients from EXIF
      const metadata = await image.metadata();

      const resized = image.resize({ width: PAGE_MAX_WIDTH, withoutEnlargement: true });
      const webpBuffer = await resized.webp({ quality: PAGE_WEBP_QUALITY }).toBuffer();

      const imageKey = `pages/${comicId}/${String(index).padStart(4, "0")}.webp`;
      await putObject(imageKey, webpBuffer, "image/webp");

      await db.page.create({
        data: {
          comicId,
          index,
          imageKey,
          width: metadata.width ?? null,
          height: metadata.height ?? null,
        },
      });

      if (index === 0) {
        const coverBuffer = await sharp(page.data)
          .rotate()
          .resize({ width: COVER_WIDTH, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        coverKey = `covers/${comicId}.webp`;
        await putObject(coverKey, coverBuffer, "image/webp");
      }
    }

    const derivedTitle = info.title ?? info.series ?? stripExtension(originalFileName);

    await db.comic.update({
      where: { id: comicId },
      data: {
        status: "ready",
        pageCount: pages.length,
        coverKey,
        title: derivedTitle,
        series: info.series ?? null,
        number: info.number ?? null,
        writer: info.writer ?? null,
        penciller: info.penciller ?? null,
        year: info.year ?? null,
        summary: info.summary ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown import error";
    await db.comic.update({
      where: { id: comicId },
      data: { status: "error", errorMessage: message },
    });
    // Best-effort cleanup of any pages that made it to storage before the failure.
    await deletePrefix(`pages/${comicId}/`).catch(() => undefined);
  }
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./]+$/, "");
}
