import { neon } from "@neondatabase/serverless";

let connectionString = process.env.POSTGRES_URL || "";

// Clean up quotes if present in env variable
if (connectionString.startsWith('"') && connectionString.endsWith('"')) {
  connectionString = connectionString.slice(1, -1);
}

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is missing in process.env.");
}

export const sql = neon(connectionString);

