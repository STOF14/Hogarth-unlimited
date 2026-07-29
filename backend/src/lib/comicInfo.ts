import { XMLParser } from "fast-xml-parser";

export interface ComicInfo {
  title?: string;
  series?: string;
  number?: string;
  writer?: string;
  penciller?: string;
  year?: string;
  summary?: string;
}

const parser = new XMLParser({ ignoreAttributes: true, trimValues: true });

/**
 * Parses a ComicInfo.xml buffer (the de-facto metadata standard used by
 * most comic-archiving tools). Returns an empty object — never throws — if
 * the file is missing or malformed, since metadata is a nice-to-have and
 * should never block an import.
 */
export function parseComicInfo(xml: Buffer | string): ComicInfo {
  try {
    const parsed = parser.parse(xml.toString("utf-8"));
    const info = parsed?.ComicInfo ?? {};
    return {
      title: stringOrUndefined(info.Title),
      series: stringOrUndefined(info.Series),
      number: stringOrUndefined(info.Number),
      writer: stringOrUndefined(info.Writer),
      penciller: stringOrUndefined(info.Penciller),
      year: stringOrUndefined(info.Year),
      summary: stringOrUndefined(info.Summary),
    };
  } catch {
    return {};
  }
}

function stringOrUndefined(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  return str.length > 0 ? str : undefined;
}
