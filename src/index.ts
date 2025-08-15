import 'dotenv/config';
import express from "express";
import cors from "cors";
import mainRouter from "./routers/index.route";
import { ApiErrorHandler } from "./middlewares/ApiErrorHandler";
import { expiryTransactionSchedule } from "./jobs/cornJobs"; // kalau memang perlu jalan saat boot

const PORT = process.env.PORT || 8000;
const app = express();

const allowList = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowList.length ? allowList : true, // kalau kosong, reflect origin (valid utk credentials)
  credentials: true,
}));

app.use(express.json());

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// routes utama
app.use(mainRouter);

// ERROR HANDLER HARUS PALING AKHIR
app.use(ApiErrorHandler);

// penting: bind 0.0.0.0 untuk platform hosting
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`➜ API running on port ${PORT}`);

  // Jalankan scheduler SETELAH server hidup
  try {
    if (process.env.ENABLE_JOBS !== "false") {
      expiryTransactionSchedule?.(); // pastikan fungsi ini idempotent
      console.log("✓ scheduler started");
    }
  } catch (err) {
    console.error("scheduler failed to start:", err);
  }
});