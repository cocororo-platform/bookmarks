import request from "supertest";
import { app, prisma } from "./index";

beforeAll(async () => {
  // DB 연결 초기화
  await prisma.$connect();
});

beforeEach(async () => {
  // 각 테스트 전 DB 초기화
  await prisma.bookmark.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/bookmarks", () => {
  it("빈 배열을 반환한다 (데이터 없을 때)", async () => {
    const res = await request(app).get("/api/bookmarks");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("생성된 북마크를 모두 반환한다", async () => {
    await prisma.bookmark.createMany({
      data: [
        { url: "https://a.com", title: "A" },
        { url: "https://b.com", title: "B" },
      ],
    });

    const res = await request(app).get("/api/bookmarks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("최신순으로 정렬된다", async () => {
    await prisma.bookmark.create({
      data: { url: "https://first.com", title: "First", createdAt: new Date("2024-01-01") },
    });
    await prisma.bookmark.create({
      data: { url: "https://second.com", title: "Second", createdAt: new Date("2024-01-02") },
    });

    const res = await request(app).get("/api/bookmarks");

    expect(res.body[0].title).toBe("Second");
    expect(res.body[1].title).toBe("First");
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
      tags: "[]",
    });
    expect(res.body.id).toBeDefined();
  });

  it("description, tags, favorite를 포함하여 생성한다", async () => {
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Example",
      description: "A test bookmark",
      tags: '["test"]',
      favorite: true,
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      description: "A test bookmark",
      tags: '["test"]',
      favorite: true,
    });
  });

  it("url이 없으면 400을 반환한다", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ title: "No URL" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("url and title are required");
  });

  it("title이 없으면 400을 반환한다", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ url: "https://example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("url and title are required");
  });
});

describe("PUT /api/bookmarks/:id", () => {
  it("북마크를 수정한다", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://old.com", title: "Old" },
    });

    const res = await request(app)
      .put(`/api/bookmarks/${created.id}`)
      .send({ title: "Updated", favorite: true });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
    expect(res.body.favorite).toBe(true);
    expect(res.body.url).toBe("https://old.com"); // 변경하지 않은 필드 유지
  });

  it("존재하지 않는 id에 대해 404를 반환한다", async () => {
    const res = await request(app)
      .put("/api/bookmarks/9999")
      .send({ title: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Bookmark not found");
  });
});

describe("DELETE /api/bookmarks/:id", () => {
  it("북마크를 삭제한다", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://delete.me", title: "Delete Me" },
    });

    const res = await request(app).delete(`/api/bookmarks/${created.id}`);
    expect(res.status).toBe(204);

    // DB에서 실제로 삭제되었는지 확인
    const found = await prisma.bookmark.findUnique({ where: { id: created.id } });
    expect(found).toBeNull();
  });

  it("존재하지 않는 id에 대해 404를 반환한다", async () => {
    const res = await request(app).delete("/api/bookmarks/9999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Bookmark not found");
  });
});

describe("PATCH /api/bookmarks/:id/favorite", () => {
  it("즐겨찾기를 토글한다 (false → true)", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://fav.com", title: "Fav" },
    });

    const res = await request(app).patch(`/api/bookmarks/${created.id}/favorite`);

    expect(res.status).toBe(200);
    expect(res.body.favorite).toBe(true);
  });

  it("즐겨찾기를 토글한다 (true → false)", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://fav.com", title: "Fav", favorite: true },
    });

    const res = await request(app).patch(`/api/bookmarks/${created.id}/favorite`);

    expect(res.status).toBe(200);
    expect(res.body.favorite).toBe(false);
  });

  it("존재하지 않는 id에 대해 404를 반환한다", async () => {
    const res = await request(app).patch("/api/bookmarks/9999/favorite");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Bookmark not found");
  });
});

describe("GET /api/bookmarks?tags= 필터링", () => {
  beforeEach(async () => {
    await prisma.bookmark.createMany({
      data: [
        { url: "https://work.com", title: "Work", tags: '["work"]' },
        { url: "https://dev.com", title: "Dev", tags: '["dev"]' },
        { url: "https://personal.com", title: "Personal", tags: '["personal"]' },
      ],
    });
  });

  it("단일 태그로 필터링한다", async () => {
    const res = await request(app).get("/api/bookmarks?tags=work");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Work");
  });

  it("다중 태그로 OR 필터링한다", async () => {
    const res = await request(app).get("/api/bookmarks?tags=work,dev");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const titles = res.body.map((b: { title: string }) => b.title);
    expect(titles).toContain("Work");
    expect(titles).toContain("Dev");
  });

  it("태그 파라미터가 없으면 전체를 반환한다", async () => {
    const res = await request(app).get("/api/bookmarks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
});
