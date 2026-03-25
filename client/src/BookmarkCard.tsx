import type { Bookmark } from "./api";

interface Props {
  bookmark: Bookmark;
  onDelete: (id: number) => void;
}

export default function BookmarkCard({ bookmark, onDelete }: Props) {
  const tags: string[] = JSON.parse(bookmark.tags);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-snug">{bookmark.title}</h3>
          {bookmark.favorite && <span className="text-yellow-500 text-lg shrink-0">★</span>}
        </div>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline break-all mt-1 block"
        >
          {bookmark.url}
        </a>
        {bookmark.description && (
          <p className="text-sm text-gray-500 mt-2">{bookmark.description}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <span className="text-xs text-gray-400">
          {new Date(bookmark.createdAt).toLocaleDateString("ko-KR")}
        </span>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="px-3 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
