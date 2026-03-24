import { Bookmark } from "../api";
import BookmarkCard from "./BookmarkCard";

interface Props {
  bookmarks: Bookmark[];
  onDelete: (id: number) => void;
}

export default function BookmarkList({ bookmarks, onDelete }: Props) {
  if (bookmarks.length === 0) {
    return <p className="text-gray-500 mt-4">북마크가 없습니다.</p>;
  }

  return (
    <div className="mt-4">
      {bookmarks.map((b) => (
        <BookmarkCard key={b.id} bookmark={b} onDelete={onDelete} />
      ))}
    </div>
  );
}
