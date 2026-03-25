import { useState, useEffect, useCallback } from "react";
import { fetchBookmarks, createBookmark, deleteBookmark } from "./api";
import type { Bookmark, CreateBookmarkInput } from "./api";
import BookmarkCard from "./BookmarkCard";
import AddBookmarkForm from "./AddBookmarkForm";

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBookmarks(await fetchBookmarks());
    } catch {
      /* 에러 시 빈 목록 유지 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (input: CreateBookmarkInput) => {
    await createBookmark(input);
    await load();
  };

  const handleDelete = async (id: number) => {
    await deleteBookmark(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Bookmark Manager</h1>
          <span className="text-sm text-gray-400">{bookmarks.length} bookmarks</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Add Form */}
        <AddBookmarkForm onAdd={handleAdd} />

        {/* Bookmark List */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Bookmarks
          </h2>

          {loading ? (
            <p className="text-center text-gray-400 py-12">Loading...</p>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <p className="text-gray-400 text-lg">No bookmarks yet</p>
              <p className="text-gray-300 text-sm mt-1">Add your first bookmark above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map((b) => (
                <BookmarkCard key={b.id} bookmark={b} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
