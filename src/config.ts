// src/config.ts
import { PrismaClient } from "./generated/prisma";

// Hanya untuk dev lokal: file .env.*
// Di Railway, variabel datang dari dashboard, tidak perlu file .env
if (process.env.NODE_ENV !== "production") {
  // optional: load file .env.* bila kamu butuh di lokal
  // import('dotenv/config');   // atau uncomment jika mau otomatis
}

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const prisma = new PrismaClient({
  datasourceUrl: DATABASE_URL,
  // log: ["query", "error", "warn"],
});

export default prisma;
