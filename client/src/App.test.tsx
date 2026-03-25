import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as api from "./api";

vi.mock("./api");

const mockBookmarks: api.Bookmark[] = [
  {
    id: 1,
    url: "https://github.com",
    title: "GitHub",
    description: null,
    tags: '["dev"]',
    favorite: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    url: "https://claude.ai",
    title: "Claude AI",
    description: "AI assistant",
    tags: '["ai"]',
    favorite: false,
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
];

beforeEach(() => {
  vi.mocked(api.fetchBookmarks).mockResolvedValue(mockBookmarks);
  vi.mocked(api.createBookmark).mockImplementation(async (data) => ({
    id: 99,
    url: data.url,
    title: data.title,
    description: data.description ?? null,
    tags: data.tags ?? "[]",
    favorite: false,
    createdAt: "2026-01-03T00:00:00Z",
    updatedAt: "2026-01-03T00:00:00Z",
  }));
  vi.mocked(api.deleteBookmark).mockResolvedValue(undefined);
  vi.mocked(api.toggleFavorite).mockImplementation(async (id) => {
    const found = mockBookmarks.find((b) => b.id === id)!;
    return { ...found, favorite: !found.favorite };
  });
});

describe("App", () => {
  it("renders bookmarks from API", async () => {
    render(<App />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("GitHub")).toBeInTheDocument();
      expect(screen.getByText("Claude AI")).toBeInTheDocument();
    });
  });

  it("shows empty state when no bookmarks", async () => {
    vi.mocked(api.fetchBookmarks).mockResolvedValue([]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("No bookmarks yet.")).toBeInTheDocument();
    });
  });

  it("adds a bookmark via form", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText("GitHub")).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText("URL *"), "https://new.com");
    await user.type(screen.getByPlaceholderText("Title *"), "New Site");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(api.createBookmark).toHaveBeenCalledWith({
        url: "https://new.com",
        title: "New Site",
        description: undefined,
        tags: "[]",
      });
      expect(screen.getByText("New Site")).toBeInTheDocument();
    });
  });

  it("deletes a bookmark", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText("GitHub")).toBeInTheDocument());

    await user.click(screen.getByLabelText("Delete GitHub"));

    await waitFor(() => {
      expect(api.deleteBookmark).toHaveBeenCalledWith(1);
      expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
    });
  });

  it("toggles favorite when star button is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText("GitHub")).toBeInTheDocument());

    expect(screen.getByLabelText("Add favorite GitHub")).toHaveTextContent("\u2606");

    await user.click(screen.getByLabelText("Add favorite GitHub"));

    await waitFor(() => {
      expect(api.toggleFavorite).toHaveBeenCalledWith(1);
      expect(screen.getByLabelText("Remove favorite GitHub")).toHaveTextContent("\u2B50");
    });
  });

  it("shows error when fetch fails", async () => {
    vi.mocked(api.fetchBookmarks).mockRejectedValue(new Error("fail"));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load bookmarks")).toBeInTheDocument();
    });
  });

  it("displays tags as badges", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getAllByText("dev").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("ai").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("displays description when present", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("AI assistant")).toBeInTheDocument();
    });
  });

  it("renders tag filter chips", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "ai" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "dev" })).toBeInTheDocument();
    });
  });

  it("filters bookmarks when a tag chip is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchBookmarks).mockResolvedValue(mockBookmarks);
    render(<App />);
    await waitFor(() => expect(screen.getByText("GitHub")).toBeInTheDocument());

    vi.mocked(api.fetchBookmarks).mockResolvedValue([mockBookmarks[0]]);
    await user.click(screen.getByRole("button", { name: "dev" }));

    await waitFor(() => {
      expect(api.fetchBookmarks).toHaveBeenCalledWith(["dev"]);
      expect(screen.getByText("GitHub")).toBeInTheDocument();
      expect(screen.queryByText("Claude AI")).not.toBeInTheDocument();
    });
  });

  it("clears error after a successful mutation", async () => {
    const user = userEvent.setup();
    vi.mocked(api.deleteBookmark).mockRejectedValueOnce(new Error("fail"));
    render(<App />);
    await waitFor(() => expect(screen.getByText("GitHub")).toBeInTheDocument());

    await user.click(screen.getByLabelText("Delete GitHub"));
    await waitFor(() => {
      expect(screen.getByText("Failed to delete bookmark")).toBeInTheDocument();
    });

    vi.mocked(api.deleteBookmark).mockResolvedValueOnce(undefined);
    await user.click(screen.getByLabelText("Delete Claude AI"));
    await waitFor(() => {
      expect(screen.queryByText("Failed to delete bookmark")).not.toBeInTheDocument();
    });
  });

  it("shows form validation error when submitting with whitespace-only fields", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText("GitHub")).toBeInTheDocument());

    const titleInput = screen.getByPlaceholderText("Title *");
    await user.type(titleInput, " ");

    const form = screen.getByText("Add Bookmark").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("URL and Title are required")).toBeInTheDocument();
    });
  });

  it("shows all bookmarks when tag chip is deselected", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchBookmarks).mockResolvedValue(mockBookmarks);
    render(<App />);
    await waitFor(() => expect(screen.getByText("GitHub")).toBeInTheDocument());

    vi.mocked(api.fetchBookmarks).mockResolvedValue([mockBookmarks[0]]);
    await user.click(screen.getByRole("button", { name: "dev" }));
    await waitFor(() => expect(screen.queryByText("Claude AI")).not.toBeInTheDocument());

    vi.mocked(api.fetchBookmarks).mockResolvedValue(mockBookmarks);
    await user.click(screen.getByRole("button", { name: "dev" }));
    await waitFor(() => {
      expect(screen.getByText("GitHub")).toBeInTheDocument();
      expect(screen.getByText("Claude AI")).toBeInTheDocument();
    });
  });
});
