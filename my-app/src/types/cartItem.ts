import type { AddOnOption } from "./addOn";
import type { Menu } from "./menu";

export interface CartItem {
    key: string;
    qty: number;
    totalPrice: number;
    unitPrice?: number; // kalau ada lebih bagus
    menu: Menu;
    addons: AddOnOption[];  // kamu pakai ini juga
    addonsPrice: number;    // dan ini
    basePrice: number;

};

export interface CartItems {
    [key: string]: CartItem;
}


export type GroupedAddonsCart = Record<
    string,
    {
        groupId: string;
        options: AddOnOption[];
    }
>;