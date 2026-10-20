function mysqlUrlFromParts() {
  const uri = process.env.MYSQL_ADDON_URI || process.env.MYSQL_URL;
  if (uri) return uri;

  const host = process.env.MYSQL_ADDON_HOST || process.env.MYSQL_HOST;
  const user = process.env.MYSQL_ADDON_USER || process.env.MYSQL_USER;
  const password = process.env.MYSQL_ADDON_PASSWORD || process.env.MYSQL_PASSWORD || "";
  const database = process.env.MYSQL_ADDON_DB || process.env.MYSQL_DATABASE;
  const port = process.env.MYSQL_ADDON_PORT || process.env.MYSQL_PORT || "3306";

  if (!host || !user || !database) return "";
  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

const databaseUrl = process.env.DATABASE_URL || mysqlUrlFromParts();

export const env = {
  databaseUrl,
  databaseSsl: process.env.DATABASE_SSL === "true",
  jwtSecret: process.env.JWT_SECRET || "centralshop-dev-secret-cambia-en-produccion",
  jwtSecretIsDefault: !process.env.JWT_SECRET,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "CentralShop",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "573001112233",
  autoAprobarTienda: process.env.TIENDA_AUTO_APROBAR !== "false",
  demoMode: !databaseUrl,
};
