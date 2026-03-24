import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.bookmark.deleteMany();
});

describe("GET /api/bookmarks", () => {
  it("should return all bookmarks", async () => {
    await prisma.bookmark.create({
      data: { url: "https://example.com", title: "Example", tags: "[]" },
    });

    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Example");
  });
});

describe("POST /api/bookmarks", () => {
  it("should create a bookmark with valid data", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ url: "https://github.com", title: "GitHub" });

    expect(res.status).toBe(201);
    expect(res.body.url).toBe("https://github.com");
    expect(res.body.title).toBe("GitHub");
  });

  it("should return 400 when url is missing", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .send({ title: "No URL" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("url");
  });
});

describe("DELETE /api/bookmarks/:id", () => {
  it("should delete an existing bookmark", async () => {
    const bookmark = await prisma.bookmark.create({
      data: { url: "https://delete-me.com", title: "Delete Me", tags: "[]" },
    });

    const res = await request(app).delete(`/api/bookmarks/${bookmark.id}`);
    expect(res.status).toBe(200);

    const count = await prisma.bookmark.count();
    expect(count).toBe(0);
  });
});
