import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware: parse and validate numeric :id param
app.param("id", (req: Request, res: Response, next: NextFunction, value: string) => {
  const id = Number(value);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Bookmark not found" });
    return;
  }
  res.locals.id = id;
  next();
});

// GET /api/bookmarks
app.get("/api/bookmarks", async (req, res) => {
  const tagsParam = req.query.tags as string | undefined;
  const where = tagsParam
    ? {
        OR: tagsParam.split(",").map((tag) => ({
          tags: { contains: `"${tag.trim()}"` },
        })),
      }
    : undefined;
  const bookmarks = await prisma.bookmark.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json(bookmarks);
});

// GET /api/bookmarks/:id
app.get("/api/bookmarks/:id", async (req, res) => {
  const id = res.locals.id as number;
  const bookmark = await prisma.bookmark.findUnique({ where: { id } });
  if (!bookmark) {
    res.status(404).json({ error: "Bookmark not found" });
    return;
  }
  res.json(bookmark);
});

// POST /api/bookmarks
app.post("/api/bookmarks", async (req, res) => {
  const { url, title, description, tags, favorite } = req.body;
  if (!url || !title) {
    res.status(400).json({ error: "url and title are required" });
    return;
  }
  if (tags !== undefined) {
    try {
      const parsed = JSON.parse(tags);
      if (!Array.isArray(parsed) || !parsed.every((t: unknown) => typeof t === "string")) {
        res.status(400).json({ error: "tags must be a JSON array of strings" });
        return;
      }
    } catch {
      res.status(400).json({ error: "tags must be valid JSON" });
      return;
    }
  }
  try {
    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title,
        description,
        tags: tags ?? "[]",
        favorite: favorite ?? false,
      },
    });
    res.status(201).json(bookmark);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      res.status(409).json({ error: "A bookmark with this URL already exists" });
      return;
    }
    throw e;
  }
});

// PUT /api/bookmarks/:id
app.put("/api/bookmarks/:id", async (req, res) => {
  const id = res.locals.id as number;
  const { url, title, description, tags, favorite } = req.body;
  try {
    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: { url, title, description, tags, favorite },
    });
    res.json(bookmark);
  } catch {
    res.status(404).json({ error: "Bookmark not found" });
  }
});

// DELETE /api/bookmarks/:id
app.delete("/api/bookmarks/:id", async (req, res) => {
  const id = res.locals.id as number;
  try {
    await prisma.bookmark.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Bookmark not found" });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app, prisma };
