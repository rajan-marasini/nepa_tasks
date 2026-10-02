import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again after a minute.",
  },
  keyGenerator: (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? (Array.isArray(forwarded)
          ? forwarded[0]
          : forwarded.split(",")[0]
        )?.trim()
      : req.socket.remoteAddress;
    return ip ?? "unknown";
  },
});
