import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

let database: any = null;

if (process.env.DATABASE_URL) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  client.connect().catch((error) => {
    console.error("PostgreSQL connection failed:", error);
  });
  database = drizzle(client, { schema });
}

// Database-backed deployments use PostgreSQL. Local development can run with the
// file-backed storage adapter in storage.ts when DATABASE_URL is absent.
export const db = database as any;
