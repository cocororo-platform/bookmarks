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

export interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  tags?: string;
}

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const res = await fetch("/api/bookmarks");
  if (!res.ok) throw new Error("북마크 목록을 가져올 수 없습니다.");
  return res.json();
}

export async function createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
  const res = await fetch("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "북마크를 생성할 수 없습니다.");
  }
  return res.json();
}

export async function deleteBookmark(id: number): Promise<void> {
  const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("북마크를 삭제할 수 없습니다.");
}
