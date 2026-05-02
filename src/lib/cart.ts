import { useEffect, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

const KEY = "novatech_cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(read);

  useEffect(() => {
    const handler = () => setItems(read());
    window.addEventListener("cart:updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("cart:updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    items,
    add: (item: Omit<CartItem, "quantity">, qty = 1) => {
      const cur = read();
      const ex = cur.find((c) => c.id === item.id);
      if (ex) ex.quantity += qty;
      else cur.push({ ...item, quantity: qty });
      write(cur);
    },
    remove: (id: string) => write(read().filter((c) => c.id !== id)),
    setQty: (id: string, qty: number) => {
      const cur = read().map((c) =>
        c.id === id ? { ...c, quantity: Math.max(1, qty) } : c,
      );
      write(cur);
    },
    clear: () => write([]),
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  };
}
