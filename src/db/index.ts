import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { loadEnv } from "@/lib/load-env";

export function hasDatabase() {
  loadEnv();
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return drizzle(neon(url), { schema });
}
