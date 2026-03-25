import { Router } from "express";
import { prisma } from "../prisma";
import { parseId, validateBookmarkBody } from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/bookmarks - 전체 조회 (태그, 즐겨찾기 필터링 지원)
router.get("/", async (req, res, next) => {
  try {
    const tagsParam = req.query.tags as string | undefined;
    const favoriteParam = req.query.favorite as string | undefined;

    const conditions: object[] = [];

    if (tagsParam) {
      conditions.push({
        OR: tagsParam.split(",").map((tag) => ({
          tags: { contains: `"${tag.trim()}"` },
        })),
      });
    }

    if (favoriteParam === "true") {
      conditions.push({ favorite: true });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const bookmarks = await prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
});

// POST /api/bookmarks - 생성
router.post("/", async (req, res, next) => {
  try {
    const result = validateBookmarkBody(req.body);
    if (!result.valid) {
      throw new AppError(400, result.error);
    }
    const bookmark = await prisma.bookmark.create({ data: result.data });
    res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
});

// PUT /api/bookmarks/:id - 수정
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) throw new AppError(400, "Invalid bookmark ID");

    const result = validateBookmarkBody(req.body);
    if (!result.valid) {
      throw new AppError(400, result.error);
    }

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: result.data,
    });
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookmarks/:id/favorite - 즐겨찾기 토글
router.patch("/:id/favorite", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) throw new AppError(400, "Invalid bookmark ID");

    const bookmark = await prisma.bookmark.findUniqueOrThrow({
      where: { id },
    });
    const updated = await prisma.bookmark.update({
      where: { id },
      data: { favorite: !bookmark.favorite },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookmarks/:id - 삭제
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) throw new AppError(400, "Invalid bookmark ID");

    await prisma.bookmark.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export { router as bookmarkRouter };
