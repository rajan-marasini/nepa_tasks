import {
  createEvent,
  getEventAnalytics,
  getEvents,
} from "@/controllers/event.controller";
import { validate, validateQuery } from "@/middleware/validate.middleware";
import {
  createEventSchema,
  getEventAnalyticsQuerySchema,
  getEventsQuerySchema,
} from "@/schemas/event.schema";
import express from "express";

const router = express.Router();

router.post("/", validate(createEventSchema), createEvent);

router.get(
  "/analytics",
  validateQuery(getEventAnalyticsQuerySchema),
  getEventAnalytics,
);

router.get("/", validateQuery(getEventsQuerySchema), getEvents);

export default router;
