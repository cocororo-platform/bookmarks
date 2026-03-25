export function parseId(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

interface ValidatedBookmarkData {
  url: string;
  title: string;
  description: string | null;
  tags: string;
  favorite: boolean;
}

type ValidationResult =
  | { valid: true; data: ValidatedBookmarkData }
  | { valid: false; error: string };

export function validateBookmarkBody(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const { url, title, description, tags, favorite } = body as Record<string, unknown>;

  if (!url || typeof url !== "string" || !url.trim()) {
    return { valid: false, error: "url is required" };
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    return { valid: false, error: "title is required" };
  }

  return {
    valid: true,
    data: {
      url,
      title,
      description: typeof description === "string" ? description : null,
      tags: Array.isArray(tags) ? JSON.stringify(tags) : "[]",
      favorite: typeof favorite === "boolean" ? favorite : false,
    },
  };
}
