import type { CartState } from "./features/cartSlice";

const CART_KEY = "cart";

export function loadCart(): CartState | undefined {
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return undefined;
        return JSON.parse(raw) as CartState;
    } catch {
        return undefined;
    }
}

export function saveCart(cart: CartState) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
        // ignore
    }
}