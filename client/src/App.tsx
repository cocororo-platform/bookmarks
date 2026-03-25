import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchBookmarks, createBookmark, deleteBookmark } from "./api";
import type { Bookmark, CreateBookmarkInput } from "./api";
import BookmarkCard from "./BookmarkCard";
import AddBookmarkForm from "./AddBookmarkForm";
import ApiTester from "./ApiTester";

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };
  return { path, navigate };
}

function BookmarkApp() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBookmarks(await fetchBookmarks());
    } catch {
      /* keep empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (input: CreateBookmarkInput) => {
    await createBookmark(input);
    await load();
  };

  const handleDelete = async (id: number) => {
    await deleteBookmark(id);
    await load();
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    bookmarks.forEach((b) => {
      try { (JSON.parse(b.tags) as string[]).forEach((t) => tagSet.add(t)); } catch { /* skip */ }
    });
    return Array.from(tagSet).sort();
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    if (selectedTags.length === 0) return bookmarks;
    return bookmarks.filter((b) => {
      try {
        const tags = JSON.parse(b.tags) as string[];
        return selectedTags.some((t) => tags.includes(t));
      } catch { return false; }
    });
  }, [bookmarks, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Bookmark Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{bookmarks.length} bookmarks</span>
            <a href="/tester" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/tester"); window.dispatchEvent(new PopStateEvent("popstate")); }} className="text-sm text-blue-600 hover:underline">API Tester</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <AddBookmarkForm onAdd={handleAdd} />

        {allTags.length > 0 && (
          <section className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tags</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-3 py-1 text-sm text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Bookmarks{selectedTags.length > 0 && ` (${filteredBookmarks.length}/${bookmarks.length})`}
          </h2>
          {loading ? (
            <p className="text-center text-gray-400 py-12">Loading...</p>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <p className="text-gray-400 text-lg">{bookmarks.length === 0 ? "No bookmarks yet" : "No bookmarks match selected tags"}</p>
              <p className="text-gray-300 text-sm mt-1">{bookmarks.length === 0 ? "Add your first bookmark above" : "Try selecting different tags or clear the filter"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookmarks.map((b) => (
                <BookmarkCard key={b.id} bookmark={b} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const { path } = usePath();
  return path === "/tester" ? <ApiTester /> : <BookmarkApp />;
}
