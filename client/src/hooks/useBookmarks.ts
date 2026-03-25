import { useEffect, useState, useCallback } from "react";
import {
  fetchBookmarks,
  createBookmark,
  updateBookmark,
  toggleFavorite,
  deleteBookmark,
} from "../api";
import type { Bookmark, BookmarkFormData } from "../api";
import { extractAllTags } from "../utils";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const reload = useCallback(async () => {
    try {
      const hasFilter = selectedTags.length > 0 || showFavoritesOnly;

      if (hasFilter) {
        const opts: { tags?: string[]; favorite?: boolean } = {};
        if (selectedTags.length > 0) opts.tags = selectedTags;
        if (showFavoritesOnly) opts.favorite = true;

        const [allData, filtered] = await Promise.all([
          fetchBookmarks(),
          fetchBookmarks(opts),
        ]);
        setAllTags(extractAllTags(allData));
        setBookmarks(filtered);
      } else {
        const allData = await fetchBookmarks();
        setAllTags(extractAllTags(allData));
        setBookmarks(allData);
      }
    } catch (e) {
      console.error("Failed to load bookmarks:", e);
    }
  }, [selectedTags, showFavoritesOnly]);

  useEffect(() => {
    reload();
  }, [reload]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function toggleFavoritesFilter() {
    setShowFavoritesOnly((prev) => !prev);
  }

  async function handleCreate(data: BookmarkFormData) {
    try {
      await createBookmark(data);
      await reload();
    } catch (e) {
      console.error("Failed to create bookmark:", e);
    }
  }

  async function handleEdit(id: number, data: BookmarkFormData) {
    try {
      await updateBookmark(id, data);
      await reload();
    } catch (e) {
      console.error("Failed to update bookmark:", e);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteBookmark(id);
      await reload();
    } catch (e) {
      console.error("Failed to delete bookmark:", e);
    }
  }

  async function handleToggleFavorite(id: number) {
    try {
      await toggleFavorite(id);
      await reload();
    } catch (e) {
      console.error("Failed to toggle favorite:", e);
    }
  }

  return {
    bookmarks,
    allTags,
    selectedTags,
    showFavoritesOnly,
    toggleTag,
    toggleFavoritesFilter,
    handleCreate,
    handleEdit,
    handleDelete,
    handleToggleFavorite,
  };
}
