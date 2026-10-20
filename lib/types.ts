export type Rol = "administrador" | "vendedor" | "cliente";

export type Categoria = {
  id: number;
  nombre: string;
  padreId: number | null;
  descripcion: string;
};

export type Tienda = {
  id: number;
  usuarioId: number;
  nombre: string;
  descripcion: string;
  logoUrl: string;
  estado: "pendiente" | "aprobada" | "suspendida";
  ciudad: string;
};

export type Producto = {
  id: number;
  tiendaId: number;
  tienda: string;
  categoriaId: number;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: "borrador" | "activo" | "agotado" | "inactivo";
  imagen: string;
  rating: number;
  resenas: number;
};

export type Resena = {
  id: number;
  usuarioId: number;
  usuario: string;
  productoId: number;
  calificacion: number;
  comentario: string;
  creadoEn: string;
};

export type UsuarioPublico = {
  id: number;
  rol: Rol;
  nombre: string;
  email: string;
  telefono: string;
  estado: "activo" | "inactivo" | "bloqueado";
  tiendaId?: number;
  tiendaNombre?: string;
  tiendaEstado?: Tienda["estado"];
};

export type DireccionInput = {
  alias?: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  referencia?: string;
  telefono?: string;
};

export type PedidoItem = {
  id: number;
  productoId: number;
  tiendaId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  estado: string;
};

export type Pedido = {
  id: number;
  clienteId: number;
  total: number;
  subtotal: number;
  costoEnvio: number;
  estado: string;
  creadoEn: string;
  metodoPago: string;
  pagoEstado: string;
  envioEstado: string;
  ciudad: string;
  direccion: string;
  items: PedidoItem[];
};

export type Favorito = {
  usuarioId: number;
  productoId: number;
};
