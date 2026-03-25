import { useState } from "react";
import type { BookmarkFormData } from "../api";
import { splitTagInput } from "../utils";

interface Props {
  initialData?: BookmarkFormData;
  onSubmit: (data: BookmarkFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function BookmarkForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "저장",
}: Props) {
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") ?? "");
  const [favorite, setFavorite] = useState(initialData?.favorite ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    onSubmit({
      url: url.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags ? splitTagInput(tags) : [],
      favorite,
    });

    if (!initialData) {
      setUrl("");
      setTitle("");
      setDescription("");
      setTags("");
      setFavorite(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm">
      {!initialData && (
        <h2 className="text-lg font-semibold mb-4">새 북마크 추가</h2>
      )}

      <label className="block text-sm font-medium text-gray-600 mb-1">
        URL *
      </label>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label className="block text-sm font-medium text-gray-600 mb-1">
        Title *
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="사이트 이름"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label className="block text-sm font-medium text-gray-600 mb-1">
        Description
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="설명 (선택)"
        rows={2}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label className="block text-sm font-medium text-gray-600 mb-1">
        Tags (쉼표로 구분)
      </label>
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="dev, docs, web"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={favorite}
          onChange={(e) => setFavorite(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm text-gray-600">즐겨찾기</span>
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
