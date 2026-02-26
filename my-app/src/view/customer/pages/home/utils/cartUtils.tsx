import type { AddOnOption } from "../../../../../types/addOn";
import type { CartItems } from "../../../../../types/cartItem";
import type { Menu } from "../../../../../types/menu";

export function buildCartKey(menuId: number, addons: AddOnOption[]) {
    const addonIds = [...addons]
        .map((a) => a.id)
        .sort((a, b) => a - b)
        .join("-");
    return `${menuId}::${addonIds || "noaddon"}`;
}

export function calcAddonsPrice(addons: AddOnOption[]) {
    return addons.reduce((sum, a) => sum + (a.price || 0), 0);
}

export function calcUnitPrice(menu: Menu, addonsPrice: number) {
    return (menu.price ?? 0) + (addonsPrice ?? 0);
}

export function getMenuQty(cart: CartItems | null | undefined, menuId: number): number {
    return Object.values(cart ?? {})
        .filter((it) => it.menu.id === menuId)
        .reduce((sum, it) => sum + it.qty, 0);
}

export function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export function loadCartFromStorage(): CartItems {
    try {
        const raw = localStorage.getItem("cart");
        if (!raw) return {};
        return JSON.parse(raw) as CartItems;
    } catch {
        return {};
    }
}

export function saveCartToStorage(cart: CartItems) {
    localStorage.setItem("cart", JSON.stringify(cart));
}