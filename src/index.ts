import express from "express";
import cors from "cors";
import mainRouter from "./routers/index.route";
import { ApiErrorHandler } from "./middlewares/ApiErrorHandler";
import { expiryTransactionSchedule } from "./jobs/cornJobs"; // kalau memang perlu jalan saat boot

const PORT = process.env.PORT || 8000;
const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN?.split(",") || "*",
		credentials: true,
	})
);
app.use(express.json());

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// job scheduler (opsional, pastikan idempotent)
expiryTransactionSchedule?.();

// routes utama
app.use(mainRouter);

// ERROR HANDLER HARUS PALING AKHIR
app.use(ApiErrorHandler);

// penting: bind 0.0.0.0 untuk platform hosting
app.listen(Number(PORT), "0.0.0.0", () => {
	console.log(`➜ API running on port ${PORT}`);
});
