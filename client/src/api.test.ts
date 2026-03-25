import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBookmarks, createBookmark, deleteBookmark, toggleFavorite } from "./api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchBookmarks", () => {
  it("returns bookmarks on success", async () => {
    const data = [{ id: 1, title: "Test", url: "https://test.com" }];
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });

    const result = await fetchBookmarks();
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith("/api/bookmarks");
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchBookmarks()).rejects.toThrow("Failed to fetch bookmarks");
  });
});

describe("createBookmark", () => {
  it("sends POST and returns created bookmark", async () => {
    const created = { id: 1, url: "https://a.com", title: "A" };
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(created) });

    const result = await createBookmark({ url: "https://a.com", title: "A" });
    expect(result).toEqual(created);
    expect(mockFetch).toHaveBeenCalledWith("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://a.com", title: "A" }),
    });
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(createBookmark({ url: "https://a.com", title: "A" })).rejects.toThrow(
      "Failed to create bookmark"
    );
  });
});

describe("toggleFavorite", () => {
  it("sends PATCH and returns updated bookmark", async () => {
    const updated = { id: 1, url: "https://a.com", title: "A", favorite: true };
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(updated) });

    const result = await toggleFavorite(1);
    expect(result).toEqual(updated);
    expect(mockFetch).toHaveBeenCalledWith("/api/bookmarks/1/favorite", { method: "PATCH" });
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(toggleFavorite(1)).rejects.toThrow("Failed to toggle favorite");
  });
});

describe("deleteBookmark", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    await deleteBookmark(1);
    expect(mockFetch).toHaveBeenCalledWith("/api/bookmarks/1", { method: "DELETE" });
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(deleteBookmark(1)).rejects.toThrow("Failed to delete bookmark");
  });
});
