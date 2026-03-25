import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "./index";
import { prisma } from "./prisma";

beforeEach(async () => {
  await prisma.bookmark.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/bookmarks", () => {
  it("전체 북마크를 조회한다", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A" } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B" } });

    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("최신순으로 정렬된다", async () => {
    await prisma.bookmark.create({ data: { url: "https://first.com", title: "First", createdAt: new Date("2024-01-01") } });
    await prisma.bookmark.create({ data: { url: "https://second.com", title: "Second", createdAt: new Date("2024-01-02") } });

    const res = await request(app).get("/api/bookmarks");
    expect(res.body[0].title).toBe("Second");
    expect(res.body[1].title).toBe("First");
  });

  it("북마크가 없으면 빈 배열을 반환한다", async () => {
    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /api/bookmarks?tags=", () => {
  it("1개 태그로 필터링한다", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", tags: JSON.stringify(["dev", "docs"]) } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B", tags: JSON.stringify(["design"]) } });

    const res = await request(app).get("/api/bookmarks?tags=dev");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("A");
  });

  it("다중 태그로 필터링한다 (OR 조건)", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", tags: JSON.stringify(["dev"]) } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B", tags: JSON.stringify(["design"]) } });
    await prisma.bookmark.create({ data: { url: "https://c.com", title: "C", tags: JSON.stringify(["other"]) } });

    const res = await request(app).get("/api/bookmarks?tags=dev,design");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const titles = res.body.map((b: { title: string }) => b.title);
    expect(titles).toContain("A");
    expect(titles).toContain("B");
  });

  it("태그 파라미터가 없으면 전체를 반환한다", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", tags: JSON.stringify(["dev"]) } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B", tags: JSON.stringify(["design"]) } });

    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("PATCH /api/bookmarks/:id/favorite", () => {
  it("즐겨찾기를 토글한다 (false → true)", async () => {
    const bm = await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", favorite: false } });
    const res = await request(app).patch(`/api/bookmarks/${bm.id}/favorite`);
    expect(res.status).toBe(200);
    expect(res.body.favorite).toBe(true);
  });

  it("즐겨찾기를 토글한다 (true → false)", async () => {
    const bm = await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", favorite: true } });
    const res = await request(app).patch(`/api/bookmarks/${bm.id}/favorite`);
    expect(res.status).toBe(200);
    expect(res.body.favorite).toBe(false);
  });

  it("존재하지 않는 북마크면 404", async () => {
    const res = await request(app).patch("/api/bookmarks/9999/favorite");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/bookmarks?favorite=true", () => {
  it("즐겨찾기 북마크만 필터링한다", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", favorite: true } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B", favorite: false } });

    const res = await request(app).get("/api/bookmarks?favorite=true");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("A");
  });

  it("favorite 파라미터가 없으면 전체를 반환한다", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", favorite: true } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B", favorite: false } });

    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /api/bookmarks", () => {
  it("북마크를 생성한다", async () => {
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Example",
      description: "An example site",
      tags: ["test"],
    });
    expect(res.status).toBe(201);
    expect(res.body.url).toBe("https://example.com");
    expect(res.body.title).toBe("Example");
    expect(res.body.description).toBe("An example site");
    expect(res.body.tags).toBe(JSON.stringify(["test"]));
    expect(res.body.favorite).toBe(false);
  });

  it("url이 없으면 400", async () => {
    const res = await request(app).post("/api/bookmarks").send({ title: "No URL" });
    expect(res.status).toBe(400);
  });

  it("title이 없으면 400", async () => {
    const res = await request(app).post("/api/bookmarks").send({ url: "https://example.com" });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/bookmarks/:id", () => {
  it("북마크를 수정한다", async () => {
    const bm = await prisma.bookmark.create({ data: { url: "https://a.com", title: "A" } });
    const res = await request(app).put(`/api/bookmarks/${bm.id}`).send({
      url: "https://updated.com",
      title: "Updated",
      favorite: true,
      tags: ["updated"],
    });
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://updated.com");
    expect(res.body.title).toBe("Updated");
    expect(res.body.favorite).toBe(true);
  });

  it("url이 없으면 400", async () => {
    const bm = await prisma.bookmark.create({ data: { url: "https://a.com", title: "A" } });
    const res = await request(app).put(`/api/bookmarks/${bm.id}`).send({ title: "No URL" });
    expect(res.status).toBe(400);
  });

  it("존재하지 않는 북마크면 404", async () => {
    const res = await request(app).put("/api/bookmarks/9999").send({
      url: "https://x.com",
      title: "X",
    });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/bookmarks/:id", () => {
  it("북마크를 삭제한다", async () => {
    const bm = await prisma.bookmark.create({ data: { url: "https://a.com", title: "A" } });
    const res = await request(app).delete(`/api/bookmarks/${bm.id}`);
    expect(res.status).toBe(204);

    const count = await prisma.bookmark.count();
    expect(count).toBe(0);
  });

  it("존재하지 않는 북마크면 404", async () => {
    const res = await request(app).delete("/api/bookmarks/9999");
    expect(res.status).toBe(404);
  });
});
