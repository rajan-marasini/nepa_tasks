import { describe, expect, it, mock } from "bun:test";
import { AppError } from "@/lib/errors";
import { validate, validateQuery } from "@/middleware/validate.middleware";
import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

describe("Validation Middleware", () => {
  const schema = z.object({
    name: z.string().min(2),
    count: z.number().min(1),
  });

  it("should pass valid body to next() and update req.body", () => {
    const middleware = validate(schema);
    const req = { body: { name: "Antigravity", count: 5 } } as Request;
    const res = {} as Response;
    let nextCalled = false;
    let passedError: unknown = null;

    const next: NextFunction = (err?: unknown) => {
      nextCalled = true;
      passedError = err;
    };

    middleware(req, res, next);

    expect(nextCalled).toBe(true);
    expect(passedError).toBeUndefined();
    expect(req.body).toEqual({ name: "Antigravity", count: 5 });
  });

  it("should forward AppError to next() when body fails validation", () => {
    const middleware = validate(schema);
    const req = { body: { name: "A", count: 0 } } as Request;
    const res = {} as Response;
    let passedError: any = null;

    const next: NextFunction = (err?: unknown) => {
      passedError = err;
    };

    middleware(req, res, next);

    expect(passedError).toBeInstanceOf(AppError);
    expect(passedError.statusCode).toBe(400);
  });
});
