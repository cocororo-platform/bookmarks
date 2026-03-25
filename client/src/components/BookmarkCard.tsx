import { useState } from "react";
import type { Bookmark, BookmarkFormData } from "../api";
import { parseTags } from "../utils";
import BookmarkForm from "./BookmarkForm";
import BookmarkDisplay from "./BookmarkDisplay";

interface Props {
  bookmark: Bookmark;
  onToggleFavorite: (id: number) => void;
  onEdit: (id: number, data: BookmarkFormData) => void;
  onDelete: (id: number) => void;
}

export default function BookmarkCard({
  bookmark,
  onToggleFavorite,
  onEdit,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <BookmarkForm
        initialData={{
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description ?? undefined,
          tags: parseTags(bookmark.tags),
          favorite: bookmark.favorite,
        }}
        onSubmit={(data) => {
          onEdit(bookmark.id, data);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
        submitLabel="저장"
      />
    );
  }

  return (
    <BookmarkDisplay
      bookmark={bookmark}
      onToggleFavorite={onToggleFavorite}
      onEdit={() => setEditing(true)}
      onDelete={onDelete}
    />
  );
}
