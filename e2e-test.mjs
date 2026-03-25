import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// 1. 페이지 열기
await page.goto("http://localhost:5173");
await page.waitForLoadState("networkidle");

// 2. 북마크 추가
await page.fill('input[placeholder="https://example.com"]', "https://github.com");
await page.fill('input[placeholder="사이트 이름"]', "GitHub");
await page.fill('textarea[placeholder="설명 (선택)"]', "개발자 협업 플랫폼");
await page.fill('input[placeholder="dev, docs, web"]', "dev, git, code");
await page.check('input[type="checkbox"]');
await page.click('button[type="submit"]');

// 목록에 반영될 때까지 대기
await page.waitForSelector("text=GitHub");
await page.waitForTimeout(500);

// 3. 추가 후 스크린샷
await page.screenshot({ path: "screenshot-after-add.png", fullPage: true });
console.log("✅ screenshot-after-add.png 저장됨");

// 4. 삭제 버튼 클릭
await page.click("text=삭제");
await page.waitForTimeout(500);

// 5. 삭제 후 스크린샷
await page.screenshot({ path: "screenshot-after-delete.png", fullPage: true });
console.log("✅ screenshot-after-delete.png 저장됨");

await browser.close();
