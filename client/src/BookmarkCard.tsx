import type { Bookmark } from "./api";
import { parseTags } from "./utils";

interface Props {
  bookmark: Bookmark;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export default function BookmarkCard({ bookmark, onDelete, onToggleFavorite }: Props) {
  const tags = parseTags(bookmark.tags);

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 hover:underline"
          >
            {bookmark.title}
          </a>
          <p className="text-sm text-gray-400 truncate">{bookmark.url}</p>
          {bookmark.description && (
            <p className="text-sm text-gray-600 mt-1">{bookmark.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={() => onToggleFavorite(bookmark.id)}
            className="text-xl leading-none"
            aria-label={bookmark.favorite ? `Remove favorite ${bookmark.title}` : `Add favorite ${bookmark.title}`}
          >
            {bookmark.favorite ? "\u2B50" : "\u2606"}
          </button>
          <button
            onClick={() => onDelete(bookmark.id)}
            className="text-red-400 hover:text-red-600 text-sm"
            aria-label={`Delete ${bookmark.title}`}
          >
            Delete
          </button>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
