import { useEffect, useMemo, useState } from "react";
import { fetchBookmarks, createBookmark, deleteBookmark, toggleFavorite, parseTags } from "./api";
import type { Bookmark } from "./api";
import AddBookmarkForm from "./components/AddBookmarkForm";
import BookmarkList from "./components/BookmarkList";

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setBookmarks(await fetchBookmarks());
        setError(null);
      } catch {
        setError("북마크를 불러오지 못했습니다.");
      }
    };
    load();
  }, []);

  const allTags = useMemo(() => {
    const tags = bookmarks.flatMap((b) => parseTags(b.tags));
    return [...new Set(tags)];
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    if (selectedTags.length === 0) return bookmarks;
    return bookmarks.filter((b) =>
      parseTags(b.tags).some((t) => selectedTags.includes(t))
    );
  }, [bookmarks, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAdd = async (data: { url: string; title: string; description: string }) => {
    try {
      const created = await createBookmark(data);
      setBookmarks((prev) => [created, ...prev]);
      setError(null);
    } catch {
      setError("북마크 추가에 실패했습니다.");
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const updated = await toggleFavorite(id);
      setBookmarks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setError(null);
    } catch {
      setError("즐겨찾기 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      setError(null);
    } catch {
      setError("북마크 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Bookmark Manager</h1>
      <AddBookmarkForm onAdd={handleAdd} />
      {allTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
      )}
      <div className="mt-6">
        <BookmarkList bookmarks={filteredBookmarks} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />
      </div>
    </div>
  );
}
