import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./index";
import { prisma } from "./prisma";

beforeAll(async () => {
  await prisma.bookmark.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/health", () => {
  it("status ok를 반환한다", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/bookmarks", () => {
  it("새 북마크를 생성한다", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ url: "https://example.com", title: "Example" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      url: "https://example.com",
      title: "Example",
      favorite: false,
    });
    expect(res.body.id).toBeDefined();
  });

  it("url이 없으면 400을 반환한다", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ title: "No URL" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("title이 없으면 400을 반환한다", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ url: "https://example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe("GET /api/bookmarks", () => {
  beforeEach(async () => {
    await prisma.bookmark.deleteMany();
    await prisma.bookmark.create({
      data: { url: "https://a.com", title: "A", createdAt: new Date("2024-01-01") },
    });
    await prisma.bookmark.create({
      data: { url: "https://b.com", title: "B", createdAt: new Date("2024-01-02") },
    });
  });

  it("전체 북마크 목록을 반환한다", async () => {
    const res = await request(app).get("/api/bookmarks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("최신순으로 정렬된다", async () => {
    const res = await request(app).get("/api/bookmarks");

    expect(res.body[0].title).toBe("B");
    expect(res.body[1].title).toBe("A");
  });
});

describe("PUT /api/bookmarks/:id", () => {
  let bookmarkId: number;

  beforeEach(async () => {
    await prisma.bookmark.deleteMany();
    const bookmark = await prisma.bookmark.create({
      data: { url: "https://old.com", title: "Old" },
    });
    bookmarkId = bookmark.id;
  });

  it("북마크를 수정한다", async () => {
    const res = await request(app)
      .put(`/api/bookmarks/${bookmarkId}`)
      .send({ title: "Updated", favorite: true });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
    expect(res.body.favorite).toBe(true);
  });

  it("존재하지 않는 id에 404를 반환한다", async () => {
    const res = await request(app)
      .put("/api/bookmarks/99999")
      .send({ title: "Nope" });

    expect(res.status).toBe(404);
  });

  it("유효하지 않은 id에 400을 반환한다", async () => {
    const res = await request(app)
      .put("/api/bookmarks/abc")
      .send({ title: "Nope" });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/bookmarks/:id", () => {
  let bookmarkId: number;

  beforeEach(async () => {
    await prisma.bookmark.deleteMany();
    const bookmark = await prisma.bookmark.create({
      data: { url: "https://del.com", title: "Delete Me" },
    });
    bookmarkId = bookmark.id;
  });

  it("북마크를 삭제한다", async () => {
    const res = await request(app).delete(`/api/bookmarks/${bookmarkId}`);

    expect(res.status).toBe(204);

    const count = await prisma.bookmark.count();
    expect(count).toBe(0);
  });

  it("존재하지 않는 id에 404를 반환한다", async () => {
    const res = await request(app).delete("/api/bookmarks/99999");

    expect(res.status).toBe(404);
  });

  it("유효하지 않은 id에 400을 반환한다", async () => {
    const res = await request(app).delete("/api/bookmarks/abc");

    expect(res.status).toBe(400);
  });
});
