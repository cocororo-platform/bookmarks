import type { Bookmark, BookmarkFormData } from "../api";
import BookmarkCard from "./BookmarkCard";

interface Props {
  bookmarks: Bookmark[];
  onToggleFavorite: (id: number) => void;
  onEdit: (id: number, data: BookmarkFormData) => void;
  onDelete: (id: number) => void;
}

export default function BookmarkList({
  bookmarks,
  onToggleFavorite,
  onEdit,
  onDelete,
}: Props) {
  if (bookmarks.length === 0) {
    return (
      <p className="text-center text-gray-400 py-12">북마크가 없습니다.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bookmarks.map((b) => (
        <BookmarkCard
          key={b.id}
          bookmark={b}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
