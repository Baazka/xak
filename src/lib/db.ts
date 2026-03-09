// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || "5432"),
});

console.log("DB_HOST =", process.env.PGHOST);
console.log("DB_PORT =", process.env.PGPORT);
console.log("DATABASE_URL =", process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, "//***:***@"));

pool.on("connect", () => {
  console.log("Connected to the database");
});
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;
