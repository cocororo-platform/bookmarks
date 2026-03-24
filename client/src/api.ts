const API_BASE = "/api/bookmarks";

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

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const res = await fetch(API_BASE);
  return res.json();
}

export async function createBookmark(data: {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
}): Promise<Bookmark> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create bookmark");
  }
  return res.json();
}

export async function deleteBookmark(id: number): Promise<void> {
  await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
}
