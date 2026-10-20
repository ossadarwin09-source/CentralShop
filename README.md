# CentralShop

Marketplace de comercio electrónico para comprar y vender productos. El frontend, la API y las variables de entorno están listos para desplegarse en Vercel, con el mismo tipo de recorrido que un marketplace: inicio, catálogo, tienda, carrito, pago, cuenta, vendedor, contacto y encuesta.

## Variables

Copia `.env.example` a `.env.local`. En Vercel, regístralas en **Project Settings → Environment Variables**.

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | URL pública, sin barra final |
| `NEXT_PUBLIC_SITE_NAME` | Nombre visible |
| `NEXT_PUBLIC_WHATSAPP` | Número de WhatsApp, solo dígitos con indicativo |
| `JWT_SECRET` | Firma de la sesión. Obligatorio en producción |
| `DATABASE_URL` | MySQL. Si se omite, la app corre en modo demostración |
| `MYSQL_ADDON_URI` o `MYSQL_ADDON_HOST/PORT/DB/USER/PASSWORD` | Alternativa al estilo Clever Cloud |
| `DATABASE_SSL` | `true` si el servidor exige TLS |
| `TIENDA_AUTO_APROBAR` | `true` aprueba tiendas nuevas; `false` las deja pendientes |

Sin `DATABASE_URL` el catálogo, el login de demostración y los pedidos de esa instancia funcionan para revisar la interfaz. Las cuentas nuevas y los pedidos no se comparten entre instancias de Vercel hasta conectar MySQL.

## Base de datos

El esquema está en `Central Shop/centralshop-schema.sql`. Con `DATABASE_URL` definida:

```bash
npm run db:init
```

Eso crea roles, usuarios, tiendas, categorías, productos, carrito, pedidos, pagos, envíos, reseñas, favoritos y notificaciones.

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

Cuentas de demostración:

- Cliente: `cliente@centralshop.co` / `Cliente123`
- Vendedor: `vendedor@centralshop.co` / `Vendedor123`
- Admin: `admin@centralshop.co` / `Admin123`

## Vercel

1. Importa el repositorio en Vercel. El framework es Next.js y la raíz del proyecto es este directorio.
2. Carga las variables de la tabla.
3. Si usas MySQL, ejecuta `npm run db:init` contra esa base antes del primer pedido real.
4. Despliega. `GET /api/health` responde `mode: "demo"` o `mode: "mysql"`.
