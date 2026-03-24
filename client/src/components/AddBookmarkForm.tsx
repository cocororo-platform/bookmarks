import { useState } from "react";
import { createBookmark } from "../api";

interface Props {
  onAdd: () => void;
}

export default function AddBookmarkForm({ onAdd }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createBookmark({ url, title });
      setUrl("");
      setTitle("");
      onAdd();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-3 rounded mb-4">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border px-2 py-1 rounded flex-1 text-sm"
        />
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-2 py-1 rounded flex-1 text-sm"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          추가
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
