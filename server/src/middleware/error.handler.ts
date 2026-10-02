import { AppError } from "@/lib/errors";
import logger from "@/lib/logger";
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

export const handleError: ErrorRequestHandler = (err, req, res, _next) => {
  // Handle invalid JSON body syntax
  if (err instanceof SyntaxError && "body" in err && "status" in err && err.status === 400) {
    logger.warn(`Malformed JSON body: ${err.message}`, { path: req.path });
    res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body",
    });
    return;
  }

  // Handle known AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Postgres connection / query errors
  if (err && typeof err === "object" && ("code" in err || "routine" in err)) {
    const pgErr = err as { code?: string; message?: string };
    logger.error("Database error occurred", { code: pgErr.code, message: pgErr.message });

    if (pgErr.code === "ECONNREFUSED" || pgErr.code === "57P01") {
      res.status(503).json({
        success: false,
        message: "Database service unavailable. Please try again later.",
      });
      return;
    }

    if (pgErr.code === "23505") {
      res.status(409).json({
        success: false,
        message: "A record with this identifier already exists.",
      });
      return;
    }
  }

  // Fallback for general server errors
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";

  logger.error("Unhandled error", { error: err, path: req.path, method: req.method });

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : message,
  });
};

export const TryCatch = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
