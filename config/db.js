import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "lmsdb",
  password: process.env.PGPASSWORD || "yourpassword",
  port: Number(process.env.PGPORT || 5432),
});

export default pool;
