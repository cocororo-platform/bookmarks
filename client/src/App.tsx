import { useCallback, useEffect, useState } from "react";
import type { Bookmark } from "./api";
import { fetchBookmarks, createBookmark, deleteBookmark, toggleFavorite } from "./api";
import BookmarkCard from "./BookmarkCard";
import AddBookmarkForm from "./AddBookmarkForm";
import { parseTags } from "./utils";

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const extractTags = (items: Bookmark[]): string[] => {
    const tagSet = new Set<string>();
    items.forEach((b) => parseTags(b.tags).forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  };

  const load = useCallback(async (tags?: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBookmarks(tags);
      setBookmarks(data);
      if (!tags || tags.length === 0) {
        setAllTags(extractTags(data));
      }
    } catch {
      setError("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selectedTags.length > 0 ? selectedTags : undefined);
  }, [selectedTags, load]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAdd = async (data: {
    url: string;
    title: string;
    description?: string;
    tags?: string;
  }) => {
    try {
      setError(null);
      const created = await createBookmark(data);
      setBookmarks((prev) => [created, ...prev]);
      const newTags = parseTags(created.tags);
      setAllTags((prev) => {
        const merged = new Set([...prev, ...newTags]);
        return Array.from(merged).sort();
      });
    } catch {
      setError("Failed to create bookmark");
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      setError(null);
      const updated = await toggleFavorite(id);
      setBookmarks((prev) =>
        prev.map((b) => (b.id === id ? updated : b))
      );
    } catch {
      setError("Failed to toggle favorite");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError("Failed to delete bookmark");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bookmark Manager</h1>
      <AddBookmarkForm onAdd={handleAdd} />
      {allTags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <p className="text-gray-400">No bookmarks yet.</p>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b) => (
            <BookmarkCard key={b.id} bookmark={b} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
