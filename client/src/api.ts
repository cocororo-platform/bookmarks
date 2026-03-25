export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string | null;
  tags: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

const BASE = "/api/bookmarks";

export async function fetchBookmarks(tags?: string[]): Promise<Bookmark[]> {
  const url = tags && tags.length > 0
    ? `${BASE}?tags=${tags.join(",")}`
    : BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
}

export async function createBookmark(data: {
  url: string;
  title: string;
  description?: string;
  tags?: string;
}): Promise<Bookmark> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bookmark");
  return res.json();
}

export async function toggleFavorite(id: number): Promise<Bookmark> {
  const res = await fetch(`${BASE}/${id}/favorite`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  return res.json();
}

export async function deleteBookmark(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete bookmark");
}
