import express from "express";

import { CorsMiddleware } from "@/middleware/cors.middleware";
import { handleError } from "@/middleware/error.handler";
import { eventRoutes } from "@/routes";

const app = express();

app.use(express.json());
app.use(CorsMiddleware);
app.use(express.urlencoded({ extended: true }));

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
