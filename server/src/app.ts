import { toNodeHandler } from "better-auth/node";
import express from "express";
import morgan from "morgan";

import { auth } from "@/lib/auth";
import { CorsMiddleware } from "@/middleware/cors.middleware";
import { handleError } from "@/middleware/error.handler";
import { apiRateLimiter } from "@/middleware/rate-limit.middleware";
import { eventRoutes } from "@/routes";

const app = express();

app.use(CorsMiddleware);
// Mount Better Auth handler (handles its own body parsing)
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimiter);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Real-Time Event Dashboard & API is running...",
  });
});

// API routes
app.use("/api/events", eventRoutes);

app.use(handleError);

export default app;
