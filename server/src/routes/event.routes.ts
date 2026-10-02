import { createEvent, getEvents } from "@/controllers/event.controller";
import { validate, validateQuery } from "@/middleware/validate.middleware";
import {
  createEventSchema,
  getEventsQuerySchema,
} from "@/schemas/event.schema";
import express from "express";

const router = express.Router();

/**
 * POST /api/events
 * 1. validate   — checks & coerces req.body against createEventSchema
 * 2. createEvent — persists the event to the database
 */
router.post("/", validate(createEventSchema), createEvent);

/**
 * GET /api/events
 * 1. validateQuery — checks & coerces req.query against getEventsQuerySchema
 * 2. getEvents     — queries the database with pagination + filters
 */
router.get("/", validateQuery(getEventsQuerySchema), getEvents);

export default router;
