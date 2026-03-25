import { useBookmarks } from "./hooks/useBookmarks";
import BookmarkForm from "./components/BookmarkForm";
import TagFilterBar from "./components/TagFilterBar";
import BookmarkList from "./components/BookmarkList";

export default function App() {
  const {
    bookmarks,
    allTags,
    selectedTags,
    showFavoritesOnly,
    toggleTag,
    toggleFavoritesFilter,
    handleCreate,
    handleEdit,
    handleDelete,
    handleToggleFavorite,
  } = useBookmarks();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookmark Manager</h1>
        <BookmarkForm onSubmit={handleCreate} submitLabel="추가" />
        <TagFilterBar
          allTags={allTags}
          selectedTags={selectedTags}
          showFavoritesOnly={showFavoritesOnly}
          onToggleTag={toggleTag}
          onToggleFavoritesFilter={toggleFavoritesFilter}
        />
        <h2 className="text-lg font-semibold text-gray-700">
          북마크 목록 ({bookmarks.length})
        </h2>
        <BookmarkList
          bookmarks={bookmarks}
          onToggleFavorite={handleToggleFavorite}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
