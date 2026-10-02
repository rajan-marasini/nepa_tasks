import winston from "winston";

const { combine, colorize, errors, json, printf, splat, timestamp } =
  winston.format;

const serializeNestedErrors = winston.format((info) => {
  if (info.error instanceof Error) {
    info.error = {
      name: info.error.name,
      message: info.error.message,
      stack: info.error.stack,
    };
  }

  return info;
});

const developmentFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  splat(),
  serializeNestedErrors(),
  printf(({ level, message, stack, timestamp, ...metadata }) => {
    const details =
      Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : "";
    return `${timestamp} ${level}: ${stack ?? message}${details}`;
  }),
);

const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  serializeNestedErrors(),
  json(),
);

export const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  format:
    process.env.NODE_ENV === "production"
      ? productionFormat
      : developmentFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

export default logger;
