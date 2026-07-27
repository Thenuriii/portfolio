import { neon } from "@neondatabase/serverless";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is missing in process.env.");
}

export const sql = neon(connectionString);
