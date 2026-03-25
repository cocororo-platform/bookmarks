import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "./prisma";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// GET /api/bookmarks - 북마크 조회 (선택적 태그 필터)
app.get("/api/bookmarks", async (req, res) => {
  try {
    const tagsParam = req.query.tags as string | undefined;
    const where = tagsParam
      ? {
          OR: tagsParam
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tag) => ({ tags: { contains: `"${tag}"` } })),
        }
      : undefined;
    const bookmarks = await prisma.bookmark.findMany({
      where,
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

// POST /api/seed - test-seed.json으로 DB 리셋
app.post("/api/seed", async (_req, res) => {
  try {
    const seedPath = resolve(__dirname, "../test-seed.json");
    const data = JSON.parse(readFileSync(seedPath, "utf-8"));

    await prisma.bookmark.deleteMany();
    for (const b of data) {
      await prisma.bookmark.create({ data: b });
    }

    res.json({ message: `Seeded ${data.length} bookmarks.` });
  } catch (error) {
    res.status(500).json({ error: "시드 데이터를 로드할 수 없습니다." });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app };
