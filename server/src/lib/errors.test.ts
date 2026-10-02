import { describe, expect, it } from "bun:test";
import { AppError } from "@/lib/errors";

describe("AppError Utility", () => {
  it("should initialize with default status code 400", () => {
    const err = new AppError("Invalid input");
    expect(err.message).toBe("Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });

  it("should allow custom status code", () => {
    const err = new AppError("Resource not found", 404);
    expect(err.message).toBe("Resource not found");
    expect(err.statusCode).toBe(404);
  });
});
