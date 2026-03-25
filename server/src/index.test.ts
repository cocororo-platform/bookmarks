import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, prisma } from "./index";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.bookmark.deleteMany();
});

describe("POST /api/bookmarks", () => {
  it("creates a bookmark", async () => {
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Example",
    });
    expect(res.status).toBe(201);
    expect(res.body.url).toBe("https://example.com");
    expect(res.body.title).toBe("Example");
    expect(res.body.id).toBeDefined();
  });

  it("returns 400 when url is missing", async () => {
    const res = await request(app).post("/api/bookmarks").send({ title: "No URL" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app).post("/api/bookmarks").send({ url: "https://example.com" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app).post("/api/bookmarks").send({});
    expect(res.status).toBe(400);
  });

  it("returns 400 when tags is invalid JSON", async () => {
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Bad Tags",
      tags: "not-json",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("tags must be valid JSON");
  });

  it("returns 400 when tags is not an array of strings", async () => {
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Bad Tags",
      tags: '{"not":"array"}',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("tags must be a JSON array of strings");
  });

  it("returns 409 when URL already exists", async () => {
    await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "First",
    });
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Duplicate",
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("A bookmark with this URL already exists");
  });

  it("creates with optional fields (description, tags, favorite)", async () => {
    const res = await request(app).post("/api/bookmarks").send({
      url: "https://example.com",
      title: "Full",
      description: "A description",
      tags: '["tag1","tag2"]',
      favorite: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe("A description");
    expect(res.body.tags).toBe('["tag1","tag2"]');
    expect(res.body.favorite).toBe(true);
  });
});

describe("GET /api/bookmarks", () => {
  it("returns all bookmarks", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A" } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B" } });

    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("returns empty array when no bookmarks", async () => {
    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("filters by a single tag", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", tags: '["work","dev"]' } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B", tags: '["dev","ai"]' } });
    await prisma.bookmark.create({ data: { url: "https://c.com", title: "C", tags: '["design"]' } });

    const res = await request(app).get("/api/bookmarks?tags=design");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("C");
  });

  it("filters by multiple tags with OR condition", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", tags: '["work","dev"]' } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B", tags: '["dev","ai"]' } });
    await prisma.bookmark.create({ data: { url: "https://c.com", title: "C", tags: '["design"]' } });

    const res = await request(app).get("/api/bookmarks?tags=work,ai");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const titles = res.body.map((b: { title: string }) => b.title).sort();
    expect(titles).toEqual(["A", "B"]);
  });

  it("returns all bookmarks when no tags param", async () => {
    await prisma.bookmark.create({ data: { url: "https://a.com", title: "A", tags: '["work"]' } });
    await prisma.bookmark.create({ data: { url: "https://b.com", title: "B", tags: '["dev"]' } });
    await prisma.bookmark.create({ data: { url: "https://c.com", title: "C", tags: '["design"]' } });

    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
});

describe("GET /api/bookmarks/:id", () => {
  it("returns a bookmark by id", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://a.com", title: "A" },
    });
    const res = await request(app).get(`/api/bookmarks/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("A");
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).get("/api/bookmarks/99999");
    expect(res.status).toBe(404);
  });

  it("returns 404 for invalid (non-numeric) id", async () => {
    const res = await request(app).get("/api/bookmarks/abc");
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/bookmarks/:id", () => {
  it("updates a bookmark", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://a.com", title: "A" },
    });
    const res = await request(app)
      .put(`/api/bookmarks/${created.id}`)
      .send({ title: "Updated", favorite: true });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
    expect(res.body.favorite).toBe(true);
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).put("/api/bookmarks/99999").send({ title: "X" });
    expect(res.status).toBe(404);
  });

  it("partially updates (only specified fields change)", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://a.com", title: "A", description: "Original" },
    });
    const res = await request(app)
      .put(`/api/bookmarks/${created.id}`)
      .send({ favorite: true });
    expect(res.status).toBe(200);
    expect(res.body.favorite).toBe(true);
    expect(res.body.title).toBe("A");
    expect(res.body.description).toBe("Original");
  });
});

describe("DELETE /api/bookmarks/:id", () => {
  it("deletes a bookmark", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://a.com", title: "A" },
    });
    const res = await request(app).delete(`/api/bookmarks/${created.id}`);
    expect(res.status).toBe(204);

    const check = await prisma.bookmark.findUnique({ where: { id: created.id } });
    expect(check).toBeNull();
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).delete("/api/bookmarks/99999");
    expect(res.status).toBe(404);
  });

  it("double delete returns 404", async () => {
    const created = await prisma.bookmark.create({
      data: { url: "https://a.com", title: "A" },
    });
    await request(app).delete(`/api/bookmarks/${created.id}`);
    const res = await request(app).delete(`/api/bookmarks/${created.id}`);
    expect(res.status).toBe(404);
  });
});
