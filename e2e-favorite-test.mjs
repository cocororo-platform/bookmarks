import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// 1. 페이지 열기
await page.goto("http://localhost:5173");
await page.waitForLoadState("networkidle");

// 2. 즐겨찾기 토글 전 스크린샷
await page.screenshot({ path: "screenshot-favorite-before.png", fullPage: true });
console.log("✅ screenshot-favorite-before.png 저장됨");

// 3. 첫 번째 북마크의 별 버튼 클릭 (즐겨찾기 토글)
const starButton = page.locator("button[title='즐겨찾기 추가'], button[title='즐겨찾기 해제']").first();
await starButton.click();
await page.waitForTimeout(500);

// 4. 즐겨찾기 토글 후 스크린샷
await page.screenshot({ path: "screenshot-favorite-after-toggle.png", fullPage: true });
console.log("✅ screenshot-favorite-after-toggle.png 저장됨");

// 5. 즐겨찾기 필터 버튼 클릭
await page.click("text=★ 즐겨찾기");
await page.waitForTimeout(500);

// 6. 즐겨찾기 필터 적용 후 스크린샷
await page.screenshot({ path: "screenshot-favorite-filtered.png", fullPage: true });
console.log("✅ screenshot-favorite-filtered.png 저장됨");

await browser.close();
