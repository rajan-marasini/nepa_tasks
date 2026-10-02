import { describe, expect, it } from "bun:test";
import {
  createEventSchema,
  getEventAnalyticsQuerySchema,
  getEventsQuerySchema,
} from "@/schemas/event.schema";

describe("Event Validation Schemas", () => {
  describe("createEventSchema", () => {
    it("should accept a valid event payload with object payload", () => {
      const input = {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        user_id: "user_123",
        event_type: "page_view",
        payload: { path: "/dashboard", referrer: "google.com" },
        timestamp: "2026-10-02T12:00:00.000Z",
      };

      const result = createEventSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept primitive and null payload values", () => {
      const inputs = [
        {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          user_id: "user_123",
          event_type: "click",
          payload: "button_submit",
          timestamp: "2026-10-02T12:00:00.000Z",
        },
        {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          user_id: "user_123",
          event_type: "score",
          payload: 100,
          timestamp: "2026-10-02T12:00:00.000Z",
        },
        {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          user_id: "user_123",
          event_type: "heartbeat",
          payload: null,
          timestamp: "2026-10-02T12:00:00.000Z",
        },
      ];

      for (const input of inputs) {
        const result = createEventSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it("should reject an invalid UUID format", () => {
      const input = {
        id: "not-a-valid-uuid",
        user_id: "user_123",
        event_type: "page_view",
        payload: {},
        timestamp: "2026-10-02T12:00:00.000Z",
      };

      const result = createEventSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "id must be a valid UUID",
        );
      }
    });

    it("should reject an invalid ISO timestamp", () => {
      const input = {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        user_id: "user_123",
        event_type: "page_view",
        payload: {},
        timestamp: "invalid-date",
      };

      const result = createEventSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("ISO 8601");
      }
    });

    it("should reject missing required fields", () => {
      const input = {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      };

      const result = createEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("getEventsQuerySchema", () => {
    it("should provide default pagination values (page: 1, limit: 10)", () => {
      const result = getEventsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should coerce string numbers for page and limit", () => {
      const result = getEventsQuerySchema.safeParse({ page: "3", limit: "25" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(25);
      }
    });

    it("should reject limit exceeding max limit 100", () => {
      const result = getEventsQuerySchema.safeParse({ limit: "150" });
      expect(result.success).toBe(false);
    });

    it("should reject page less than 1", () => {
      const result = getEventsQuerySchema.safeParse({ page: "0" });
      expect(result.success).toBe(false);
    });
  });

  describe("getEventAnalyticsQuerySchema", () => {
    it("should validate and coerce hours parameter", () => {
      const result = getEventAnalyticsQuerySchema.safeParse({ hours: "48" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hours).toBe(48);
      }
    });

    it("should reject negative or zero hours", () => {
      const result = getEventAnalyticsQuerySchema.safeParse({ hours: "0" });
      expect(result.success).toBe(false);
    });
  });
});
