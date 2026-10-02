import { type CorsOptions } from "cors";

const CLIENT_URL = process.env.CLIENT_URL;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  ...(CLIENT_URL ? [CLIENT_URL, CLIENT_URL.replace(/\/$/, "")] : []),
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-CSRF-Token",
  ],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
