import express from "express";
import cors from "cors";
import { prisma } from "./prisma";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// GET /api/bookmarks - 전체 북마크 조회
app.get("/api/bookmarks", async (_req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: "북마크 목록을 가져올 수 없습니다." });
  }
});

// POST /api/bookmarks - 북마크 생성
app.post("/api/bookmarks", async (req, res) => {
  const { url, title, description, tags, favorite } = req.body;

  if (!url || !title) {
    res.status(400).json({ error: "url과 title은 필수입니다." });
    return;
  }

  try {
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
  } catch (error) {
    res.status(500).json({ error: "북마크를 생성할 수 없습니다." });
  }
});

// PUT /api/bookmarks/:id - 북마크 수정
app.put("/api/bookmarks/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "유효하지 않은 id입니다." });
    return;
  }

  try {
    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: req.body,
    });
    res.json(bookmark);
  } catch (error) {
    res.status(404).json({ error: "북마크를 찾을 수 없습니다." });
  }
});

// DELETE /api/bookmarks/:id - 북마크 삭제
app.delete("/api/bookmarks/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "유효하지 않은 id입니다." });
    return;
  }

  try {
    await prisma.bookmark.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "북마크를 찾을 수 없습니다." });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app };
