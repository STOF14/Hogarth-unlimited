import yauzl from "yauzl";
import { createExtractorFromData } from "node-unrar-js";
import { naturalCompare } from "./naturalSort.js";

export interface RawEntry {
  name: string;
  data: Buffer;
}

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

/** Reads every entry out of a CBZ (zip) archive into memory. */
async function readZip(buffer: Buffer): Promise<RawEntry[]> {
  return new Promise((resolve, reject) => {
    const entries: RawEntry[] = [];
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
      if (err || !zipFile) return reject(err ?? new Error("Failed to open zip"));

      zipFile.readEntry();
      zipFile.on("entry", (entry) => {
        // Directory entries end with '/' — skip them.
        if (/\/$/.test(entry.fileName)) {
          zipFile.readEntry();
          return;
        }
        zipFile.openReadStream(entry, (streamErr, stream) => {
          if (streamErr || !stream) return reject(streamErr ?? new Error("Failed to read entry"));
          const chunks: Buffer[] = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => {
            entries.push({ name: entry.fileName, data: Buffer.concat(chunks) });
            zipFile.readEntry();
          });
          stream.on("error", reject);
        });
      });
      zipFile.on("end", () => resolve(entries));
      zipFile.on("error", reject);
    });
  });
}

/** Reads every entry out of a CBR (rar) archive into memory. */
async function readRar(buffer: Buffer): Promise<RawEntry[]> {
  // Copy into a fresh, plain ArrayBuffer — buffer.buffer can technically be
  // a SharedArrayBuffer per Node's lib types, which node-unrar-js doesn't accept.
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);
  const extractor = await createExtractorFromData({ data: arrayBuffer });

  const list = extractor.getFileList();
  const fileNames = [...list.fileHeaders]
    .filter((header) => !header.flags.directory)
    .map((header) => header.name);

  const extracted = extractor.extract({ files: fileNames });
  const entries: RawEntry[] = [];
  for (const file of extracted.files) {
    if (!file.extraction) continue;
    entries.push({ name: file.fileHeader.name, data: Buffer.from(file.extraction) });
  }
  return entries;
}

export interface ParsedArchive {
  /** Image pages, in natural reading order. */
  pages: RawEntry[];
  /** Raw ComicInfo.xml contents, if the archive included one. */
  comicInfoXml?: Buffer;
}

export async function readArchive(buffer: Buffer, format: "cbz" | "cbr"): Promise<ParsedArchive> {
  const entries = format === "cbz" ? await readZip(buffer) : await readRar(buffer);

  const comicInfoEntry = entries.find((e) => /(^|\/)comicinfo\.xml$/i.test(e.name));
  const pages = entries
    .filter((e) => IMAGE_EXTENSIONS.has(extensionOf(e.name)))
    .sort((a, b) => naturalCompare(a.name, b.name));

  if (pages.length === 0) {
    throw new Error("No image pages found in archive");
  }

  return { pages, comicInfoXml: comicInfoEntry?.data };
}
