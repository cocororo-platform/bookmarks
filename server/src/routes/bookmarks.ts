import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/bookmarks
router.get("/", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const bookmarks = await prisma.bookmark.findMany({
    skip: (page - 1) * 20,
    take: 20,
    orderBy: { createdAt: "desc" },
  });
  res.json(bookmarks);
});

// POST /api/bookmarks
router.post("/", async (req: Request, res: Response) => {
  const data = req.body as any;

  // URL validation
  if (!data.url || typeof data.url !== "string") {
    res.status(400).json({ error: "url is required" });
    return;
  }
  if (!data.url.startsWith("http://") && !data.url.startsWith("https://")) {
    res.status(400).json({ error: "url must start with http:// or https://" });
    return;
  }
  if (!data.title || typeof data.title !== "string") {
    res.status(400).json({ error: "title is required" });
    return;
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      url: data.url,
      title: data.title,
      description: data.description || null,
      tags: JSON.stringify(data.tags || []),
    },
  });
  res.status(201).json(bookmark);
});

// PUT /api/bookmarks/:id
router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body as any;

  // URL validation (duplicated from POST)
  if (!data.url || typeof data.url !== "string") {
    res.status(400).json({ error: "url is required" });
    return;
  }
  if (!data.url.startsWith("http://") && !data.url.startsWith("https://")) {
    res.status(400).json({ error: "url must start with http:// or https://" });
    return;
  }
  if (!data.title || typeof data.title !== "string") {
    res.status(400).json({ error: "title is required" });
    return;
  }

  const bookmark = await prisma.bookmark.update({
    where: { id },
    data: {
      url: data.url,
      title: data.title,
      description: data.description || null,
      tags: JSON.stringify(data.tags || []),
    },
  });
  res.json(bookmark);
});

// DELETE /api/bookmarks/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.bookmark.delete({ where: { id } });
  res.json({ message: "Deleted" });
});

export { router as bookmarkRouter };
