// 워크숍 Part 3에서 이 파일을 Express 서버로 교체합니다.
// 지금은 scaffold 상태를 확인하기 위한 최소 서버입니다.

import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/api/health", (_req, res) => {
  res.json({ status: "scaffold", message: "Part 3에서 CRUD API를 구현합니다." });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Scaffold server running on http://localhost:${PORT}`);
    console.log("Part 3에서 이 파일을 CRUD API로 교체합니다.");
  });
}

export { app };
