"use client";

export type CartItem = {
  productoId: number;
  nombre: string;
  precio: number;
  tienda: string;
  cantidad: number;
  imagen: string;
  stock: number;
};

const KEY = "cs_cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cs-cart"));
}

export function addToCart(item: Omit<CartItem, "cantidad">, cantidad = 1) {
  const items = readCart();
  const found = items.find((entry) => entry.productoId === item.productoId);
  if (found) found.cantidad = Math.min(item.stock, found.cantidad + cantidad);
  else items.push({ ...item, cantidad: Math.min(item.stock, cantidad) });
  writeCart(items);
  return items;
}

export function cartCount(items = readCart()) {
  return items.reduce((sum, item) => sum + item.cantidad, 0);
}

export function cartTotal(items = readCart()) {
  return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}
