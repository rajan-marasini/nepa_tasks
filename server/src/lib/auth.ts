import { db } from "@/db";
import * as schema from "@/db/schemas";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ],
});
