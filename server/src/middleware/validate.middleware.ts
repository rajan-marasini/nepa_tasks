import { AppError } from "@/lib/errors";
import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/**
 * Validates `req.body` against the given Zod schema.
 * On success, replaces `req.body` with the parsed (coerced) data.
 * On failure, forwards a 400 AppError to the error handler.
 */
export const validate = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new AppError(errorMessage, 400));
    }

    req.body = result.data;
    next();
  };
};

/**
 * Validates `req.query` against the given Zod schema.
 * On success, replaces `req.query` with the parsed (coerced) data
 * (e.g. string "10" → number 10 after .transform()).
 * On failure, forwards a 400 AppError to the error handler.
 */
export const validateQuery = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query ?? {});

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new AppError(errorMessage, 400));
    }

    // Wipe existing keys and merge parsed data so downstream
    // handlers see only the validated & coerced query object.
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, result.data);

    next();
  };
};
