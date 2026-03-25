import type { Bookmark } from "./api";

export function parseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string");
  } catch {
    return [];
  }
}

export function extractAllTags(bookmarks: Bookmark[]): string[] {
  const tags = new Set<string>();
  bookmarks.forEach((b) => parseTags(b.tags).forEach((t) => tags.add(t)));
  return [...tags].sort();
}

export function splitTagInput(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
