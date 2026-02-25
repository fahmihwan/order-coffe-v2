import type { AddOnOption } from "./addOn";

export interface CartItem {
    key: string;
    qty: number;
    totalPrice: number;
    unitPrice?: number; // kalau ada lebih bagus
    menu: { id: number };
    addons: AddOnOption[];  // kamu pakai ini juga
    addonsPrice: number;    // dan ini
};

export interface CartItems {
    [key: string]: CartItem;
}