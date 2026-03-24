import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const bookmarks = [
  { url: "https://github.com", title: "GitHub", tags: '["dev","tool"]', favorite: false },
  { url: "https://claude.ai", title: "Claude AI", tags: '["ai","tool"]', favorite: false },
  { url: "https://tailwindcss.com", title: "Tailwind CSS", tags: '["dev","design"]', favorite: false },
  { url: "https://prisma.io", title: "Prisma ORM", tags: '["dev","db"]', favorite: false },
  { url: "https://react.dev", title: "React Docs", tags: '["dev","frontend"]', favorite: false },
  { url: "https://news.ycombinator.com", title: "Hacker News", tags: '["news"]', favorite: false },
];

async function main() {
  console.log("Seeding database...");
  await prisma.bookmark.deleteMany();

  for (const b of bookmarks) {
    await prisma.bookmark.create({ data: b });
  }

  console.log(`Seeded ${bookmarks.length} bookmarks.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
