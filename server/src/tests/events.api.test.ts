import { describe, expect, it, mock } from "bun:test";
import { handleError } from "@/middleware/error.handler";
import { AppError } from "@/lib/errors";
import { validate, validateQuery } from "@/middleware/validate.middleware";
import { createEventSchema, getEventsQuerySchema } from "@/schemas/event.schema";
import type { Request, Response } from "express";

describe("API Error Handler & Validation Pipeline", () => {
  const createMockResponse = () => {
    const res: any = {
      statusCode: 200,
      jsonData: null,
      status: mock(function (code: number) {
        res.statusCode = code;
        return res;
      }),
      json: mock(function (data: any) {
        res.jsonData = data;
        return res;
      }),
    };
    return res as Response & { statusCode: number; jsonData: any };
  };

  describe("handleError Middleware", () => {
    it("should format AppError correctly with status code and message", () => {
      const res = createMockResponse();
      const err = new AppError("Invalid event parameters", 422);

      handleError(err, {} as Request, res, () => {});

      expect(res.statusCode).toBe(422);
      expect(res.jsonData).toEqual({
        success: false,
        message: "Invalid event parameters",
      });
    });

    it("should handle body-parser SyntaxError for malformed JSON", () => {
      const res = createMockResponse();
      const syntaxError: any = new SyntaxError("Unexpected token in JSON");
      syntaxError.status = 400;
      syntaxError.body = "{ invalid";

      handleError(syntaxError, { path: "/api/events" } as Request, res, () => {});

      expect(res.statusCode).toBe(400);
      expect(res.jsonData.success).toBe(false);
      expect(res.jsonData.message).toBe("Malformed JSON payload in request body");
    });

    it("should handle Database ECONNREFUSED with 503 Service Unavailable", () => {
      const res = createMockResponse();
      const dbErr = { code: "ECONNREFUSED", message: "connect ECONNREFUSED 127.0.0.1:5432" };

      handleError(dbErr, { path: "/api/events" } as Request, res, () => {});

      expect(res.statusCode).toBe(503);
      expect(res.jsonData.success).toBe(false);
      expect(res.jsonData.message).toContain("Database service unavailable");
    });

    it("should handle Postgres unique violation 23505 with 409 Conflict", () => {
      const res = createMockResponse();
      const dbErr = { code: "23505", message: "duplicate key value violates unique constraint" };

      handleError(dbErr, { path: "/api/events" } as Request, res, () => {});

      expect(res.statusCode).toBe(409);
      expect(res.jsonData.success).toBe(false);
      expect(res.jsonData.message).toContain("already exists");
    });
  });

  describe("Validation Middleware Integration with Schemas", () => {
    it("should validate and reject invalid event ingestion payload", () => {
      const middleware = validate(createEventSchema);
      const req = {
        body: {
          id: "invalid-id",
          user_id: "",
        },
      } as Request;
      const res = createMockResponse();
      let nextError: any = null;

      middleware(req, res, (err) => {
        nextError = err;
      });

      expect(nextError).toBeInstanceOf(AppError);
      expect(nextError.statusCode).toBe(400);
      expect(nextError.message).toContain("id must be a valid UUID");
    });

    it("should validate and accept valid event ingestion payload", () => {
      const middleware = validate(createEventSchema);
      const req = {
        body: {
          id: "e44146a8-208b-4fc6-b8cb-4e963ee3e8e1",
          user_id: "usr_99",
          event_type: "click",
          payload: { tab: "analytics" },
          timestamp: "2026-10-02T10:00:00.000Z",
        },
      } as Request;
      const res = createMockResponse();
      let nextError: any = null;

      middleware(req, res, (err) => {
        nextError = err;
      });

      expect(nextError).toBeUndefined();
      expect(req.body.user_id).toBe("usr_99");
    });

    it("should coerce query parameters in validateQuery", () => {
      const middleware = validateQuery(getEventsQuerySchema);
      const req = {
        query: {
          page: "2",
          limit: "20",
          event_type: "page_view",
        } as any,
      } as Request;
      const res = createMockResponse();
      let nextError: any = null;

      middleware(req, res, (err) => {
        nextError = err;
      });

      expect(nextError).toBeUndefined();
      const parsedQuery = req.query as Record<string, unknown>;
      expect(parsedQuery.page).toBe(2);
      expect(parsedQuery.limit).toBe(20);
      expect(parsedQuery.event_type).toBe("page_view");
    });
  });
});
