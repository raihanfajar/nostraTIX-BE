import express from "express";
import { ApiErrorHandler } from "./middlewares/ApiErrorHandler";
import mainRouter from "./routers/index.route";

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json()); // !Middleware to parse incoming requests with JSON payloads
app.use(ApiErrorHandler); // !Custom Error Handler Middleware
app.use(mainRouter); // !Main Router

app.listen(PORT, () => {
  console.log(`  ➜ [API] Server runs on port ${PORT}:   http://localhost:${PORT}/`);
});