import { z } from "zod/v4";

export const createEventSchema = z.object({
  id: z.uuid("id must be a valid UUID"),
  user_id: z
    .string({ error: "user_id must be a string" })
    .min(1, "user_id is required")
    .max(255, "user_id must not exceed 255 characters"),
  event_type: z
    .string({ error: "event_type must be a string" })
    .min(1, "event_type is required")
    .max(100, "event_type must not exceed 100 characters"),
  payload: z
    .record(z.string(), z.unknown())
    .or(z.array(z.unknown()))
    .or(z.string())
    .or(z.number())
    .or(z.boolean())
    .or(z.null()),
  timestamp: z.string({ error: "timestamp must be a string" }).datetime({
    offset: true,
    message: "timestamp must be a valid ISO 8601 datetime string",
  }),
});

export const getEventsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1, "page must be at least 1")),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1).max(100, "limit must not exceed 100")),
  event_type: z.string().optional(),
  date_from: z
    .string()
    .datetime({
      offset: true,
      message: "date_from must be a valid ISO 8601 datetime string",
    })
    .optional(),
  date_to: z
    .string()
    .datetime({
      offset: true,
      message: "date_to must be a valid ISO 8601 datetime string",
    })
    .optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type GetEventsQuery = z.infer<typeof getEventsQuerySchema>;
