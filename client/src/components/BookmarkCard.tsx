import { Bookmark } from "../api";

interface Props {
  bookmark: Bookmark;
  onDelete: (id: number) => void;
}

export default function BookmarkCard({ bookmark, onDelete }: Props) {
  const tags: string[] = JSON.parse(bookmark.tags || "[]");

  return (
    <div className="border p-3 rounded mb-2">
      <div className="flex justify-between items-start">
        <div>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:underline"
          >
            {bookmark.title}
          </a>
          <p className="text-sm text-gray-500">{bookmark.url}</p>
          {bookmark.description && (
            <p className="text-sm text-gray-600 mt-1">{bookmark.description}</p>
          )}
          {tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-200 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="text-red-500 text-sm hover:text-red-700"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
