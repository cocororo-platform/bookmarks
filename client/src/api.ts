const API = "/api/bookmarks";

export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string | null;
  tags: string; // JSON string
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkFormData {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  favorite?: boolean;
}

export interface FetchOptions {
  tags?: string[];
  favorite?: boolean;
}

export async function fetchBookmarks(options?: FetchOptions): Promise<Bookmark[]> {
  const params = new URLSearchParams();
  if (options?.tags && options.tags.length > 0) {
    params.set("tags", options.tags.join(","));
  }
  if (options?.favorite) {
    params.set("favorite", "true");
  }
  const query = params.toString();
  const url = query ? `${API}?${query}` : API;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
}

export async function createBookmark(data: BookmarkFormData): Promise<Bookmark> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bookmark");
  return res.json();
}

export async function updateBookmark(
  id: number,
  data: BookmarkFormData,
): Promise<Bookmark> {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update bookmark");
  return res.json();
}

export async function toggleFavorite(id: number): Promise<Bookmark> {
  const res = await fetch(`${API}/${id}/favorite`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  return res.json();
}

export async function deleteBookmark(id: number): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete bookmark");
}
