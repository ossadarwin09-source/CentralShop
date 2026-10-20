import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_ADDON_URI;
if (!databaseUrl) {
  console.error("Define DATABASE_URL o MYSQL_ADDON_URI antes de iniciar la base.");
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), "Central Shop", "centralshop-schema.sql");
const sql = fs.readFileSync(sqlPath, "utf8");
const connection = await mysql.createConnection({
  uri: databaseUrl,
  multipleStatements: true,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
});

await connection.query(sql);
console.log("Esquema CentralShop aplicado.");
await connection.end();
