export function parseTags(tags: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(tags || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
