import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const bookmarks = [
  {
    url: "https://developer.mozilla.org",
    title: "MDN Web Docs",
    description: "웹 개발 레퍼런스 문서",
    tags: JSON.stringify(["docs", "web"]),
    favorite: true,
  },
  {
    url: "https://github.com",
    title: "GitHub",
    description: "코드 호스팅 플랫폼",
    tags: JSON.stringify(["dev", "git"]),
    favorite: true,
  },
  {
    url: "https://stackoverflow.com",
    title: "Stack Overflow",
    description: "개발자 Q&A 커뮤니티",
    tags: JSON.stringify(["community", "qa"]),
    favorite: false,
  },
  {
    url: "https://www.typescriptlang.org",
    title: "TypeScript",
    description: "타입스크립트 공식 사이트",
    tags: JSON.stringify(["typescript", "docs"]),
    favorite: false,
  },
  {
    url: "https://prisma.io",
    title: "Prisma",
    description: "Node.js ORM",
    tags: JSON.stringify(["orm", "database"]),
    favorite: true,
  },
];

async function main() {
  console.log("시드 데이터 삽입 중...");
  for (const data of bookmarks) {
    await prisma.bookmark.create({ data });
  }
  console.log(`${bookmarks.length}개의 북마크가 삽입되었습니다.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
