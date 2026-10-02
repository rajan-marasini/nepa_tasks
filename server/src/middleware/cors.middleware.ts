import { corsOptions } from "@/config/cors";
import cors from "cors";
import { type RequestHandler } from "express";

export const CorsMiddleware: RequestHandler = cors(corsOptions);
