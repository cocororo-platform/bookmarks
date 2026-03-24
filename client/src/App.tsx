import { useState, useEffect } from "react";
import { fetchBookmarks, deleteBookmark, Bookmark } from "./api";
import BookmarkList from "./components/BookmarkList";
import AddBookmarkForm from "./components/AddBookmarkForm";

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const load = async () => {
    const data = await fetchBookmarks();
    setBookmarks(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteBookmark(id);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bookmark Manager</h1>
      <AddBookmarkForm onAdd={load} />
      <BookmarkList bookmarks={bookmarks} onDelete={handleDelete} />
    </div>
  );
}
