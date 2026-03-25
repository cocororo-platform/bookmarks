import type { Bookmark } from "../api";
import BookmarkCard from "./BookmarkCard";

interface Props {
  bookmarks: Bookmark[];
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export default function BookmarkList({ bookmarks, onDelete, onToggleFavorite }: Props) {
  if (bookmarks.length === 0) {
    return (
      <p className="text-center text-gray-400 py-12">
        북마크가 없습니다. 위 폼에서 추가해 보세요!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((b) => (
        <BookmarkCard key={b.id} bookmark={b} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  );
}
