export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string | null;
  tags: string;
  favorite: boolean;
  createdAt: string;
}

export function parseTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const res = await fetch("/api/bookmarks");
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
}

export async function createBookmark(
  data: Pick<Bookmark, "url" | "title" | "description">
): Promise<Bookmark> {
  const res = await fetch("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bookmark");
  return res.json();
}

export async function toggleFavorite(id: number): Promise<Bookmark> {
  const res = await fetch(`/api/bookmarks/${id}/favorite`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  return res.json();
}

export async function deleteBookmark(id: number): Promise<void> {
  const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete bookmark");
}
