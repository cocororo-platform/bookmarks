import type { Bookmark } from "../api";
import { parseTags } from "../utils";

interface Props {
  bookmark: Bookmark;
  onToggleFavorite: (id: number) => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

export default function BookmarkDisplay({
  bookmark,
  onToggleFavorite,
  onEdit,
  onDelete,
}: Props) {
  const tags = parseTags(bookmark.tags);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(bookmark.id)}
              className="text-lg transition-colors hover:scale-110"
              title={bookmark.favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              {bookmark.favorite ? (
                <span className="text-amber-400">★</span>
              ) : (
                <span className="text-gray-300">☆</span>
              )}
            </button>
            <h3 className="font-semibold text-gray-900 truncate">
              {bookmark.title}
            </h3>
          </div>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline truncate block"
          >
            {bookmark.url}
          </a>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(bookmark.id)}
            className="px-3 py-1 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {bookmark.description && (
        <p className="text-sm text-gray-500">{bookmark.description}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
