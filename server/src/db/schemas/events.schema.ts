import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const eventsTable = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: varchar("user_id", { length: 255 }).notNull(),
    event_type: varchar("event_type", { length: 100 }).notNull(),
    payload: text("payload").notNull(), // stored as JSON string
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("events_event_type_idx").on(table.event_type),
    index("events_timestamp_idx").on(table.timestamp),
    index("events_user_id_idx").on(table.user_id),
  ],
);

export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;
