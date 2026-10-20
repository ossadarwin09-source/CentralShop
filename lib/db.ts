import mysql from "mysql2/promise";
import { env } from "./env";

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!env.databaseUrl) return null;
  if (!pool) {
    pool = mysql.createPool({
      uri: env.databaseUrl,
      connectionLimit: 3,
      waitForConnections: true,
      enableKeepAlive: true,
      ssl: env.databaseSsl ? { rejectUnauthorized: true } : undefined,
    });
  }
  return pool;
}
