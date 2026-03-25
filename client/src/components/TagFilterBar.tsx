interface Props {
  allTags: string[];
  selectedTags: string[];
  showFavoritesOnly: boolean;
  onToggleTag: (tag: string) => void;
  onToggleFavoritesFilter: () => void;
}

export default function TagFilterBar({
  allTags,
  selectedTags,
  showFavoritesOnly,
  onToggleTag,
  onToggleFavoritesFilter,
}: Props) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToggleFavoritesFilter}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            showFavoritesOnly
              ? "bg-amber-400 text-white"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          ★ 즐겨찾기
        </button>
      </div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
