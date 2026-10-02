import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({ client: pool });

export const testConnection = async (): Promise<boolean> => {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    return true;
  } finally {
    client.release();
  }
};
