import { useState } from "react";

interface Props {
  onAdd: (data: { url: string; title: string; description?: string; tags?: string }) => void;
}

export default function AddBookmarkForm({ onAdd }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) {
      setFormError("URL and Title are required");
      return;
    }
    setFormError(null);
    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onAdd({
      url: url.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      tags: JSON.stringify(tagsArray),
    });
    setUrl("");
    setTitle("");
    setDescription("");
    setTags("");
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-6 space-y-3 bg-gray-50">
      <h2 className="font-semibold text-lg">Add Bookmark</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="url"
          placeholder="URL *"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="border rounded px-3 py-2 text-sm w-full"
        />
        <input
          type="text"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border rounded px-3 py-2 text-sm w-full"
        />
      </div>
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      <input
        type="text"
        placeholder="Tags (comma separated, e.g. dev, tool)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      {formError && (
        <p className="text-red-500 text-sm">{formError}</p>
      )}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
      >
        Add
      </button>
    </form>
  );
}
