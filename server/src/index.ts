import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// GET /api/bookmarks — 전체 북마크 조회 (태그 필터: ?tags=work,dev)
app.get("/api/bookmarks", async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      orderBy: { createdAt: "desc" },
    });

    const tagsParam = req.query.tags;
    if (typeof tagsParam === "string" && tagsParam.length > 0) {
      const filterTags = tagsParam.split(",").map((t) => t.trim().toLowerCase());
      const filtered = bookmarks.filter((b) => {
        try {
          const bookmarkTags: string[] = JSON.parse(b.tags);
          return bookmarkTags.some((bt) => filterTags.includes(bt.toLowerCase()));
        } catch {
          return false;
        }
      });
      res.json(filtered);
      return;
    }

    res.json(bookmarks);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookmarks — 북마크 생성
app.post("/api/bookmarks", async (req, res) => {
  try {
    const { url, title, description, tags, favorite } = req.body;

    if (!url || !title) {
      res.status(400).json({ error: "url and title are required" });
      return;
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title,
        description: description ?? null,
        tags: tags ?? "[]",
        favorite: favorite ?? false,
      },
    });
    res.status(201).json(bookmark);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/bookmarks/:id — 북마크 수정
app.put("/api/bookmarks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const { url, title, description, tags, favorite } = req.body;

    const existing = await prisma.bookmark.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        ...(url !== undefined && { url }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(favorite !== undefined && { favorite }),
      },
    });
    res.json(bookmark);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/bookmarks/:id/favorite — 즐겨찾기 토글
app.patch("/api/bookmarks/:id/favorite", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const bookmark = await prisma.bookmark.findUnique({ where: { id } });
    if (!bookmark) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }

    const updated = await prisma.bookmark.update({
      where: { id },
      data: { favorite: !bookmark.favorite },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/bookmarks/:id — 북마크 삭제
app.delete("/api/bookmarks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const existing = await prisma.bookmark.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }

    await prisma.bookmark.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app, prisma };
