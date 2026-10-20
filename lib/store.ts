import bcrypt from "bcryptjs";
import { getPool } from "./db";
import { env } from "./env";
import { productos as seedProductos, resenas as seedResenas, tiendas as seedTiendas, categorias as seedCategorias, withStats } from "./seed";
import type {
  Categoria,
  DireccionInput,
  Favorito,
  Pedido,
  PedidoItem,
  Producto,
  Resena,
  Tienda,
  UsuarioPublico,
} from "./types";

export class StoreError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type MetodoPago = "tarjeta" | "pse" | "efectivo_contraentrega" | "billetera";

const METODOS: MetodoPago[] = ["tarjeta", "pse", "efectivo_contraentrega", "billetera"];

type DemoUser = UsuarioPublico & { password: string };

type DemoState = {
  users: DemoUser[];
  tiendas: Tienda[];
  productos: Producto[];
  resenas: Resena[];
  favoritos: Favorito[];
  pedidos: Pedido[];
  seq: number;
};

function demo(): DemoState {
  const g = globalThis as typeof globalThis & { __centralshop?: DemoState };
  if (!g.__centralshop) {
    g.__centralshop = {
      users: [
        { id: 1, rol: "administrador", nombre: "Admin Central", email: "admin@centralshop.co", telefono: "3001110001", estado: "activo", password: "Admin123" },
        { id: 2, rol: "vendedor", nombre: "Valentina Nodo", email: "vendedor@centralshop.co", telefono: "3001110002", estado: "activo", password: "Vendedor123", tiendaId: 1, tiendaNombre: "Nodo Tech", tiendaEstado: "aprobada" },
        { id: 3, rol: "cliente", nombre: "Camila Ríos", email: "cliente@centralshop.co", telefono: "3001110003", estado: "activo", password: "Cliente123" },
      ],
      tiendas: structuredClone(seedTiendas),
      productos: structuredClone(seedProductos),
      resenas: structuredClone(seedResenas),
      favoritos: [],
      pedidos: [],
      seq: 200,
    };
  }
  return g.__centralshop;
}

function nextId(state: DemoState) {
  state.seq += 1;
  return state.seq;
}

function publicUser(user: DemoUser): UsuarioPublico {
  const { password: _password, ...rest } = user;
  return rest;
}

function envioDe(subtotal: number) {
  return subtotal >= 150000 ? 0 : 12000;
}

function assertMetodo(metodo: string): MetodoPago {
  if (!METODOS.includes(metodo as MetodoPago)) throw new StoreError("Método de pago no válido.");
  return metodo as MetodoPago;
}

export function getMode() {
  return {
    mode: env.demoMode ? "demo" : "mysql",
    databaseConfigured: !env.demoMode,
    jwtSecretIsDefault: env.jwtSecretIsDefault,
    autoAprobarTienda: env.autoAprobarTienda,
  };
}

type Filters = { q?: string; categoriaId?: number; tiendaId?: number; orden?: string };

function sortProductos(list: Producto[], orden?: string) {
  const copy = [...list];
  if (orden === "precio_asc") copy.sort((a, b) => a.precio - b.precio);
  else if (orden === "precio_desc") copy.sort((a, b) => b.precio - a.precio);
  else if (orden === "destacados") copy.sort((a, b) => b.rating - a.rating || b.resenas - a.resenas);
  else copy.sort((a, b) => b.id - a.id);
  return copy;
}

export async function listCategorias(): Promise<Categoria[]> {
  if (env.demoMode) return seedCategorias;
  const pool = getPool();
  if (!pool) return seedCategorias;
  const [rows] = await pool.query("SELECT id, padre_id, nombre FROM categorias ORDER BY nombre");
  return (rows as { id: number; padre_id: number | null; nombre: string }[]).map((row) => ({
    id: row.id,
    padreId: row.padre_id,
    nombre: row.nombre,
    descripcion: seedCategorias.find((c) => c.nombre === row.nombre)?.descripcion || "",
  }));
}

export async function listTiendas(): Promise<Tienda[]> {
  if (env.demoMode) return demo().tiendas.filter((t) => t.estado === "aprobada");
  const pool = getPool();
  if (!pool) return [];
  const [rows] = await pool.query(
    `SELECT t.id, t.usuario_id, t.nombre, t.descripcion, t.logo_url, t.estado
     FROM tiendas t WHERE t.estado = 'aprobada' ORDER BY t.nombre`
  );
  return (rows as Record<string, unknown>[]).map(mapTienda);
}

export async function getTienda(id: number): Promise<Tienda | null> {
  const all = env.demoMode ? demo().tiendas : await listTiendas();
  return all.find((t) => t.id === id) || null;
}

export async function listProductos(filters: Filters = {}): Promise<Producto[]> {
  if (env.demoMode) {
    const state = demo();
    const rated = withStats(state.productos, state.resenas);
    const q = filters.q?.trim().toLowerCase();
    const list = rated.filter((p) => {
      if (p.estado !== "activo") return false;
      const tienda = state.tiendas.find((t) => t.id === p.tiendaId);
      if (!tienda || tienda.estado !== "aprobada") return false;
      if (filters.categoriaId && p.categoriaId !== filters.categoriaId) return false;
      if (filters.tiendaId && p.tiendaId !== filters.tiendaId) return false;
      if (q && !`${p.nombre} ${p.descripcion} ${p.tienda}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return sortProductos(list, filters.orden);
  }

  const pool = getPool();
  if (!pool) return [];
  const q = filters.q?.trim() || null;
  const like = q ? `%${q}%` : null;
  const order =
    filters.orden === "precio_asc"
      ? "p.precio ASC"
      : filters.orden === "precio_desc"
        ? "p.precio DESC"
        : filters.orden === "destacados"
          ? "rating DESC, resenas DESC"
          : "p.id DESC";
  const [rows] = await pool.query(
    `SELECT p.id, p.tienda_id, t.nombre AS tienda, p.categoria_id, c.nombre AS categoria,
            p.nombre, p.descripcion, p.precio, p.stock, p.estado,
            (SELECT url FROM producto_imagenes i WHERE i.producto_id = p.id ORDER BY i.orden LIMIT 1) AS imagen,
            IFNULL((SELECT ROUND(AVG(calificacion), 1) FROM resenas r WHERE r.producto_id = p.id), 0) AS rating,
            (SELECT COUNT(*) FROM resenas r WHERE r.producto_id = p.id) AS resenas
     FROM productos p
     JOIN tiendas t ON t.id = p.tienda_id
     JOIN categorias c ON c.id = p.categoria_id
     WHERE p.estado = 'activo' AND t.estado = 'aprobada'
       AND (? IS NULL OR p.categoria_id = ?)
       AND (? IS NULL OR p.tienda_id = ?)
       AND (? IS NULL OR p.nombre LIKE ? OR p.descripcion LIKE ?)
     ORDER BY ${order}`,
    [filters.categoriaId || null, filters.categoriaId || null, filters.tiendaId || null, filters.tiendaId || null, like, like, like]
  );
  return (rows as Record<string, unknown>[]).map(mapProducto);
}

export async function getProducto(id: number): Promise<(Producto & { opiniones: Resena[] }) | null> {
  const list = await listProductos({});
  const found = list.find((p) => p.id === id);
  if (!found) {
    if (!env.demoMode) return null;
    const hidden = demo().productos.find((p) => p.id === id);
    if (!hidden) return null;
  }
  const producto = found || (await listOwnerProduct(id));
  if (!producto) return null;
  const opiniones = env.demoMode
    ? demo().resenas.filter((r) => r.productoId === id)
    : await listResenas(id);
  return { ...producto, opiniones };
}

async function listOwnerProduct(id: number): Promise<Producto | null> {
  if (!env.demoMode) return null;
  const state = demo();
  const rated = withStats(state.productos, state.resenas).find((p) => p.id === id);
  return rated || null;
}

export async function listResenas(productoId: number): Promise<Resena[]> {
  if (env.demoMode) return demo().resenas.filter((r) => r.productoId === productoId);
  const pool = getPool();
  if (!pool) return [];
  const [rows] = await pool.query(
    `SELECT r.id, r.usuario_id, u.nombre AS usuario, r.producto_id, r.calificacion, r.comentario, r.creado_en
     FROM resenas r JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.producto_id = ? ORDER BY r.creado_en DESC`,
    [productoId]
  );
  return (rows as Record<string, unknown>[]).map(mapResena);
}

export async function register(input: { nombre: string; email: string; password: string; telefono?: string }) {
  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();
  const telefono = (input.telefono || "").trim();
  if (nombre.length < 3) throw new StoreError("Escribe tu nombre completo.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new StoreError("El correo no es válido.");
  if (input.password.length < 8) throw new StoreError("La contraseña debe tener al menos 8 caracteres.");

  if (env.demoMode) {
    const state = demo();
    if (state.users.some((u) => u.email === email)) throw new StoreError("Ese correo ya tiene cuenta.", 409);
    const user: DemoUser = {
      id: nextId(state),
      rol: "cliente",
      nombre,
      email,
      telefono,
      estado: "activo",
      password: input.password,
    };
    state.users.push(user);
    return publicUser(user);
  }

  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  const hash = await bcrypt.hash(input.password, 10);
  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios (rol_id, nombre, email, password_hash, telefono, estado)
       SELECT id, ?, ?, ?, ?, 'activo' FROM roles WHERE nombre = 'cliente'`,
      [nombre, email, hash, telefono || null]
    );
    const id = Number((result as { insertId: number }).insertId);
    await pool.query("INSERT INTO carritos (usuario_id) VALUES (?)", [id]);
    return reloadUser(id);
  } catch (error) {
    if (isDup(error)) throw new StoreError("Ese correo ya tiene cuenta.", 409);
    throw error;
  }
}

export async function login(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (env.demoMode) {
    const user = demo().users.find((u) => u.email === normalized);
    if (!user || user.password !== password) throw new StoreError("Correo o contraseña incorrectos.", 401);
    if (user.estado !== "activo") throw new StoreError("La cuenta no está activa.", 403);
    return publicUser(user);
  }
  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  const [rows] = await pool.query(
    `SELECT u.id, u.password_hash, u.estado FROM usuarios u WHERE u.email = ? LIMIT 1`,
    [normalized]
  );
  const row = (rows as { id: number; password_hash: string; estado: string }[])[0];
  if (!row) throw new StoreError("Correo o contraseña incorrectos.", 401);
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) throw new StoreError("Correo o contraseña incorrectos.", 401);
  if (row.estado !== "activo") throw new StoreError("La cuenta no está activa.", 403);
  return reloadUser(row.id);
}

export async function reloadUser(id: number): Promise<UsuarioPublico> {
  if (env.demoMode) {
    const user = demo().users.find((u) => u.id === id);
    if (!user) throw new StoreError("Usuario no encontrado.", 404);
    return publicUser(user);
  }
  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  const [rows] = await pool.query(
    `SELECT u.id, r.nombre AS rol, u.nombre, u.email, u.telefono, u.estado,
            t.id AS tienda_id, t.nombre AS tienda_nombre, t.estado AS tienda_estado
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     LEFT JOIN tiendas t ON t.usuario_id = u.id
     WHERE u.id = ? LIMIT 1`,
    [id]
  );
  const row = (rows as Record<string, unknown>[])[0];
  if (!row) throw new StoreError("Usuario no encontrado.", 404);
  return mapUsuario(row);
}

export async function crearTienda(user: UsuarioPublico, input: { nombre: string; descripcion: string }) {
  const nombre = input.nombre.trim();
  const descripcion = input.descripcion.trim();
  if (nombre.length < 3) throw new StoreError("El nombre de la tienda es muy corto.");
  if (user.rol === "administrador") throw new StoreError("El administrador no abre tienda.");
  if (user.tiendaId) throw new StoreError("Ya tienes una tienda.");

  const estado = env.autoAprobarTienda ? "aprobada" : "pendiente";

  if (env.demoMode) {
    const state = demo();
    const owner = state.users.find((u) => u.id === user.id);
    if (!owner) throw new StoreError("Vuelve a iniciar sesión.", 401);
    const tienda: Tienda = {
      id: nextId(state),
      usuarioId: owner.id,
      nombre,
      descripcion,
      logoUrl: "",
      estado,
      ciudad: "Colombia",
    };
    state.tiendas.push(tienda);
    owner.rol = "vendedor";
    owner.tiendaId = tienda.id;
    owner.tiendaNombre = tienda.nombre;
    owner.tiendaEstado = tienda.estado;
    return publicUser(owner);
  }

  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE usuarios SET rol_id = (SELECT id FROM roles WHERE nombre = 'vendedor') WHERE id = ?`,
      [user.id]
    );
    await conn.query(
      `INSERT INTO tiendas (usuario_id, nombre, descripcion, logo_url, estado) VALUES (?, ?, ?, '', ?)`,
      [user.id, nombre, descripcion, estado]
    );
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
  return reloadUser(user.id);
}

export async function crearProducto(
  user: UsuarioPublico,
  input: { nombre: string; descripcion: string; precio: number; stock: number; categoriaId: number }
) {
  if (user.rol !== "vendedor" || !user.tiendaId) throw new StoreError("Necesitas una tienda para publicar.", 403);
  if (user.tiendaEstado !== "aprobada") throw new StoreError("Tu tienda aún no está aprobada.", 403);
  if (input.nombre.trim().length < 3) throw new StoreError("El nombre del producto es muy corto.");
  if (input.precio < 0 || Number.isNaN(input.precio)) throw new StoreError("El precio no es válido.");
  if (input.stock < 0) throw new StoreError("El stock no es válido.");

  if (env.demoMode) {
    const state = demo();
    const categoria = seedCategorias.find((c) => c.id === input.categoriaId);
    if (!categoria) throw new StoreError("Categoría no encontrada.", 404);
    const producto: Producto = {
      id: nextId(state),
      tiendaId: user.tiendaId,
      tienda: user.tiendaNombre || "Tu tienda",
      categoriaId: categoria.id,
      categoria: categoria.nombre,
      nombre: input.nombre.trim(),
      descripcion: input.descripcion.trim(),
      precio: Math.round(input.precio),
      stock: Math.round(input.stock),
      estado: "activo",
      imagen: categoria.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      rating: 0,
      resenas: 0,
    };
    state.productos.push(producto);
    return producto;
  }

  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  const [result] = await pool.query(
    `INSERT INTO productos (tienda_id, categoria_id, nombre, descripcion, precio, stock, estado)
     VALUES (?, ?, ?, ?, ?, ?, 'activo')`,
    [user.tiendaId, input.categoriaId, input.nombre.trim(), input.descripcion.trim(), input.precio, input.stock]
  );
  const id = Number((result as { insertId: number }).insertId);
  const producto = await getProducto(id);
  if (!producto) throw new StoreError("No se pudo leer el producto creado.", 500);
  return producto;
}

export async function crearPedido(input: {
  user: UsuarioPublico;
  items: { productoId: number; cantidad: number }[];
  direccion: DireccionInput;
  metodo: string;
}) {
  const metodo = assertMetodo(input.metodo);
  if (!input.items.length) throw new StoreError("El carrito está vacío.");
  const direccion = input.direccion;
  if (!direccion.departamento || !direccion.ciudad || !direccion.direccion) {
    throw new StoreError("Completa departamento, ciudad y dirección.");
  }

  if (env.demoMode) return crearPedidoDemo(input.user, input.items, direccion, metodo);

  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const normales: { productoId: number; tiendaId: number; nombre: string; cantidad: number; precio: number }[] = [];
    for (const item of input.items) {
      if (item.cantidad < 1) throw new StoreError("La cantidad debe ser mayor a cero.");
      const [rows] = await conn.query(
        `SELECT p.id, p.nombre, p.precio, p.stock, p.tienda_id, p.estado, t.estado AS tienda_estado
         FROM productos p JOIN tiendas t ON t.id = p.tienda_id WHERE p.id = ? FOR UPDATE`,
        [item.productoId]
      );
      const row = (rows as Record<string, unknown>[])[0];
      if (!row || row.estado !== "activo" || row.tienda_estado !== "aprobada") {
        throw new StoreError("Un producto del carrito ya no está disponible.");
      }
      if (Number(row.stock) < item.cantidad) throw new StoreError(`Sin stock suficiente de ${row.nombre}.`);
      normales.push({
        productoId: Number(row.id),
        tiendaId: Number(row.tienda_id),
        nombre: String(row.nombre),
        cantidad: item.cantidad,
        precio: Number(row.precio),
      });
      await conn.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [item.cantidad, row.id]);
    }
    const subtotal = normales.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const costoEnvio = envioDe(subtotal);
    const total = subtotal + costoEnvio;
    const [dir] = await conn.query(
      `INSERT INTO direcciones (usuario_id, alias, departamento, ciudad, direccion, referencia, telefono_contacto)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [input.user.id, direccion.alias || "Entrega", direccion.departamento, direccion.ciudad, direccion.direccion, direccion.referencia || null, direccion.telefono || input.user.telefono || null]
    );
    const direccionId = Number((dir as { insertId: number }).insertId);
    const estadoPedido = metodo === "efectivo_contraentrega" ? "pendiente" : "pagado";
    const [ped] = await conn.query(
      `INSERT INTO pedidos (cliente_id, direccion_id, subtotal, costo_envio, total, estado) VALUES (?, ?, ?, ?, ?, ?)`,
      [input.user.id, direccionId, subtotal, costoEnvio, total, estadoPedido]
    );
    const pedidoId = Number((ped as { insertId: number }).insertId);
    for (const item of normales) {
      await conn.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, tienda_id, cantidad, precio_unitario, estado) VALUES (?, ?, ?, ?, ?, ?)`,
        [pedidoId, item.productoId, item.tiendaId, item.cantidad, item.precio, estadoPedido === "pagado" ? "preparando" : "pendiente"]
      );
    }
    await conn.query(
      `INSERT INTO pagos (pedido_id, metodo, estado, monto, referencia_pasarela, pagado_en) VALUES (?, ?, ?, ?, ?, ?)`,
      [pedidoId, metodo, estadoPedido === "pagado" ? "aprobado" : "pendiente", total, `CS-${pedidoId}`, estadoPedido === "pagado" ? new Date() : null]
    );
    await conn.query(
      `INSERT INTO envios (pedido_id, transportadora, estado) VALUES (?, 'CentralEnvíos', 'preparando')`,
      [pedidoId]
    );
    await conn.query(`INSERT INTO notificaciones (usuario_id, mensaje) VALUES (?, ?)`, [
      input.user.id,
      `Recibimos tu pedido #${pedidoId}.`,
    ]);
    await conn.commit();
    const pedidos = await listPedidos(input.user.id);
    const creado = pedidos.find((p) => p.id === pedidoId);
    if (!creado) throw new StoreError("Pedido creado, pero no se pudo leer.", 500);
    return creado;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

function crearPedidoDemo(
  user: UsuarioPublico,
  items: { productoId: number; cantidad: number }[],
  direccion: DireccionInput,
  metodo: MetodoPago
): Pedido {
  const state = demo();
  const lines: PedidoItem[] = [];
  for (const item of items) {
    const producto = state.productos.find((p) => p.id === item.productoId && p.estado === "activo");
    if (!producto) throw new StoreError("Un producto del carrito ya no está disponible.");
    if (item.cantidad < 1) throw new StoreError("La cantidad debe ser mayor a cero.");
    if (producto.stock < item.cantidad) throw new StoreError(`Sin stock suficiente de ${producto.nombre}.`);
    producto.stock -= item.cantidad;
    lines.push({
      id: nextId(state),
      productoId: producto.id,
      tiendaId: producto.tiendaId,
      nombre: producto.nombre,
      cantidad: item.cantidad,
      precioUnitario: producto.precio,
      estado: metodo === "efectivo_contraentrega" ? "pendiente" : "preparando",
    });
  }
  const subtotal = lines.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);
  const costoEnvio = envioDe(subtotal);
  const pedido: Pedido = {
    id: nextId(state),
    clienteId: user.id,
    subtotal,
    costoEnvio,
    total: subtotal + costoEnvio,
    estado: metodo === "efectivo_contraentrega" ? "pendiente" : "pagado",
    creadoEn: new Date().toISOString(),
    metodoPago: metodo,
    pagoEstado: metodo === "efectivo_contraentrega" ? "pendiente" : "aprobado",
    envioEstado: "preparando",
    ciudad: direccion.ciudad,
    direccion: direccion.direccion,
    items: lines,
  };
  state.pedidos.unshift(pedido);
  return pedido;
}

export async function listPedidos(userId: number): Promise<Pedido[]> {
  if (env.demoMode) return demo().pedidos.filter((p) => p.clienteId === userId);
  const pool = getPool();
  if (!pool) return [];
  const [rows] = await pool.query(
    `SELECT p.id, p.cliente_id, p.subtotal, p.costo_envio, p.total, p.estado, p.creado_en,
            d.ciudad, d.direccion, pg.metodo, pg.estado AS pago_estado, e.estado AS envio_estado
     FROM pedidos p
     JOIN direcciones d ON d.id = p.direccion_id
     LEFT JOIN pagos pg ON pg.pedido_id = p.id
     LEFT JOIN envios e ON e.pedido_id = p.id
     WHERE p.cliente_id = ?
     ORDER BY p.id DESC`,
    [userId]
  );
  const pedidos = (rows as Record<string, unknown>[]).map(mapPedido);
  if (!pedidos.length) return [];
  const ids = pedidos.map((p) => p.id);
  const [items] = await pool.query(
    `SELECT pi.id, pi.pedido_id, pi.producto_id, pi.tienda_id, pr.nombre, pi.cantidad, pi.precio_unitario, pi.estado
     FROM pedido_items pi JOIN productos pr ON pr.id = pi.producto_id
     WHERE pi.pedido_id IN (?)`,
    [ids]
  );
  for (const raw of items as Record<string, unknown>[]) {
    const pedido = pedidos.find((p) => p.id === Number(raw.pedido_id));
    if (!pedido) continue;
    pedido.items.push({
      id: Number(raw.id),
      productoId: Number(raw.producto_id),
      tiendaId: Number(raw.tienda_id),
      nombre: String(raw.nombre),
      cantidad: Number(raw.cantidad),
      precioUnitario: Number(raw.precio_unitario),
      estado: String(raw.estado),
    });
  }
  return pedidos;
}

export async function listFavoritos(userId: number) {
  if (env.demoMode) {
    const state = demo();
    const ids = state.favoritos.filter((f) => f.usuarioId === userId).map((f) => f.productoId);
    return withStats(state.productos, state.resenas).filter((p) => ids.includes(p.id));
  }
  const pool = getPool();
  if (!pool) return [];
  const [rows] = await pool.query(`SELECT producto_id FROM favoritos WHERE usuario_id = ?`, [userId]);
  const ids = (rows as { producto_id: number }[]).map((r) => r.producto_id);
  if (!ids.length) return [];
  const all = await listProductos({});
  return all.filter((p) => ids.includes(p.id));
}

export async function toggleFavorito(userId: number, productoId: number) {
  if (env.demoMode) {
    const state = demo();
    const index = state.favoritos.findIndex((f) => f.usuarioId === userId && f.productoId === productoId);
    if (index >= 0) state.favoritos.splice(index, 1);
    else state.favoritos.push({ usuarioId: userId, productoId });
    return { activo: index < 0 };
  }
  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  const [rows] = await pool.query(`SELECT 1 FROM favoritos WHERE usuario_id = ? AND producto_id = ?`, [userId, productoId]);
  if ((rows as unknown[]).length) {
    await pool.query(`DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?`, [userId, productoId]);
    return { activo: false };
  }
  await pool.query(`INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?)`, [userId, productoId]);
  return { activo: true };
}

export async function crearResena(user: UsuarioPublico, productoId: number, calificacion: number, comentario: string) {
  if (calificacion < 1 || calificacion > 5) throw new StoreError("La calificación va de 1 a 5.");
  if (comentario.trim().length < 8) throw new StoreError("Cuéntanos un poco más en el comentario.");
  if (env.demoMode) {
    const state = demo();
    if (state.resenas.some((r) => r.usuarioId === user.id && r.productoId === productoId)) {
      throw new StoreError("Ya reseñaste este producto.", 409);
    }
    const resena: Resena = {
      id: nextId(state),
      usuarioId: user.id,
      usuario: user.nombre,
      productoId,
      calificacion,
      comentario: comentario.trim(),
      creadoEn: new Date().toISOString().slice(0, 10),
    };
    state.resenas.unshift(resena);
    return resena;
  }
  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  try {
    await pool.query(
      `INSERT INTO resenas (usuario_id, producto_id, calificacion, comentario) VALUES (?, ?, ?, ?)`,
      [user.id, productoId, calificacion, comentario.trim()]
    );
  } catch (error) {
    if (isDup(error)) throw new StoreError("Ya reseñaste este producto.", 409);
    throw error;
  }
  const list = await listResenas(productoId);
  return list[0];
}

export async function panel(user: UsuarioPublico) {
  const fresh = await reloadUser(user.id);
  const pedidos = fresh.rol === "cliente" || fresh.rol === "administrador" ? await listPedidos(fresh.id) : [];
  const favoritos = await listFavoritos(fresh.id);
  let productosTienda: Producto[] = [];
  let pendientes: Tienda[] = [];
  let conteos = { usuarios: 0, tiendas: 0, productos: 0, pedidos: 0 };

  if (env.demoMode) {
    const state = demo();
    if (fresh.tiendaId) productosTienda = state.productos.filter((p) => p.tiendaId === fresh.tiendaId);
    if (fresh.rol === "administrador") {
      pendientes = state.tiendas.filter((t) => t.estado === "pendiente");
      conteos = {
        usuarios: state.users.length,
        tiendas: state.tiendas.length,
        productos: state.productos.length,
        pedidos: state.pedidos.length,
      };
    }
  } else {
    const pool = getPool();
    if (pool && fresh.tiendaId) {
      const [own] = await pool.query(
        `SELECT p.id, p.tienda_id, t.nombre AS tienda, p.categoria_id, c.nombre AS categoria,
                p.nombre, p.descripcion, p.precio, p.stock, p.estado, '' AS imagen, 0 AS rating, 0 AS resenas
         FROM productos p
         JOIN tiendas t ON t.id = p.tienda_id
         JOIN categorias c ON c.id = p.categoria_id
         WHERE p.tienda_id = ?`,
        [fresh.tiendaId]
      );
      productosTienda = (own as Record<string, unknown>[]).map(mapProducto);
    }
    if (pool && fresh.rol === "administrador") {
      const [tiendasRows] = await pool.query(`SELECT id, usuario_id, nombre, descripcion, logo_url, estado FROM tiendas WHERE estado = 'pendiente'`);
      pendientes = (tiendasRows as Record<string, unknown>[]).map(mapTienda);
      const [counts] = await pool.query(
        `SELECT
           (SELECT COUNT(*) FROM usuarios) AS usuarios,
           (SELECT COUNT(*) FROM tiendas) AS tiendas,
           (SELECT COUNT(*) FROM productos) AS productos,
           (SELECT COUNT(*) FROM pedidos) AS pedidos`
      );
      const row = (counts as Record<string, unknown>[])[0];
      conteos = {
        usuarios: Number(row.usuarios),
        tiendas: Number(row.tiendas),
        productos: Number(row.productos),
        pedidos: Number(row.pedidos),
      };
    }
  }

  return { usuario: fresh, pedidos, favoritos, productosTienda, pendientes, conteos };
}

export async function guardarAviso(userId: number | null, mensaje: string) {
  if (!userId || env.demoMode) return;
  const pool = getPool();
  if (!pool) return;
  await pool.query(`INSERT INTO notificaciones (usuario_id, mensaje, leida) VALUES (?, ?, FALSE)`, [userId, mensaje.slice(0, 255)]);
}

export async function aprobarTienda(admin: UsuarioPublico, tiendaId: number, estado: Tienda["estado"]) {
  if (admin.rol !== "administrador") throw new StoreError("Solo administración puede cambiar el estado.", 403);
  if (!["pendiente", "aprobada", "suspendida"].includes(estado)) throw new StoreError("Estado no válido.");
  if (env.demoMode) {
    const tienda = demo().tiendas.find((t) => t.id === tiendaId);
    if (!tienda) throw new StoreError("Tienda no encontrada.", 404);
    tienda.estado = estado;
    const owner = demo().users.find((u) => u.id === tienda.usuarioId);
    if (owner) owner.tiendaEstado = estado;
    return tienda;
  }
  const pool = getPool();
  if (!pool) throw new StoreError("Base de datos no configurada.", 503);
  await pool.query(`UPDATE tiendas SET estado = ? WHERE id = ?`, [estado, tiendaId]);
  return { id: tiendaId, estado };
}

function mapTienda(row: Record<string, unknown>): Tienda {
  return {
    id: Number(row.id),
    usuarioId: Number(row.usuario_id),
    nombre: String(row.nombre),
    descripcion: String(row.descripcion || ""),
    logoUrl: String(row.logo_url || ""),
    estado: String(row.estado) as Tienda["estado"],
    ciudad: "Colombia",
  };
}

function mapProducto(row: Record<string, unknown>): Producto {
  return {
    id: Number(row.id),
    tiendaId: Number(row.tienda_id),
    tienda: String(row.tienda),
    categoriaId: Number(row.categoria_id),
    categoria: String(row.categoria),
    nombre: String(row.nombre),
    descripcion: String(row.descripcion || ""),
    precio: Number(row.precio),
    stock: Number(row.stock),
    estado: String(row.estado) as Producto["estado"],
    imagen: String(row.imagen || ""),
    rating: Number(row.rating || 0),
    resenas: Number(row.resenas || 0),
  };
}

function mapResena(row: Record<string, unknown>): Resena {
  const creado = row.creado_en instanceof Date ? row.creado_en.toISOString().slice(0, 10) : String(row.creado_en || "");
  return {
    id: Number(row.id),
    usuarioId: Number(row.usuario_id),
    usuario: String(row.usuario),
    productoId: Number(row.producto_id),
    calificacion: Number(row.calificacion),
    comentario: String(row.comentario || ""),
    creadoEn: creado,
  };
}

function mapUsuario(row: Record<string, unknown>): UsuarioPublico {
  return {
    id: Number(row.id),
    rol: String(row.rol) as UsuarioPublico["rol"],
    nombre: String(row.nombre),
    email: String(row.email),
    telefono: String(row.telefono || ""),
    estado: String(row.estado) as UsuarioPublico["estado"],
    tiendaId: row.tienda_id ? Number(row.tienda_id) : undefined,
    tiendaNombre: row.tienda_nombre ? String(row.tienda_nombre) : undefined,
    tiendaEstado: row.tienda_estado ? (String(row.tienda_estado) as Tienda["estado"]) : undefined,
  };
}

function mapPedido(row: Record<string, unknown>): Pedido {
  const creado = row.creado_en instanceof Date ? row.creado_en.toISOString() : String(row.creado_en || "");
  return {
    id: Number(row.id),
    clienteId: Number(row.cliente_id),
    subtotal: Number(row.subtotal),
    costoEnvio: Number(row.costo_envio),
    total: Number(row.total),
    estado: String(row.estado),
    creadoEn: creado,
    metodoPago: String(row.metodo || ""),
    pagoEstado: String(row.pago_estado || ""),
    envioEstado: String(row.envio_estado || ""),
    ciudad: String(row.ciudad || ""),
    direccion: String(row.direccion || ""),
    items: [],
  };
}

function isDup(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "ER_DUP_ENTRY";
}
