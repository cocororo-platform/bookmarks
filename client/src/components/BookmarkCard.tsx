import { parseTags } from "../api";
import type { Bookmark } from "../api";

interface Props {
  bookmark: Bookmark;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export default function BookmarkCard({ bookmark, onDelete, onToggleFavorite }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 hover:underline break-words"
          >
            {bookmark.title}
          </a>
          <p className="text-sm text-gray-400 truncate">{bookmark.url}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleFavorite(bookmark.id)}
            className={`text-xl px-1 py-0.5 rounded transition-colors ${
              bookmark.favorite
                ? "text-yellow-400 hover:text-yellow-500"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            title={bookmark.favorite ? "즐겨찾기 해제" : "즐겨찾기"}
          >
            {bookmark.favorite ? "★" : "☆"}
          </button>
          <button
            onClick={() => onDelete(bookmark.id)}
            className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
      {bookmark.description && (
        <p className="mt-2 text-gray-600 text-sm">{bookmark.description}</p>
      )}
      {parseTags(bookmark.tags).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {parseTags(bookmark.tags).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
