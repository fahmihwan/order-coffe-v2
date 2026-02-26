import { useEffect, useState } from "react";
import type { AddOnOption } from "../../../../../types/addOn";
import type { CartItems } from "../../../../../types/cartItem";
import type { Menu } from "../../../../../types/menu";

import {
    buildCartKey,
    calcAddonsPrice,
    calcUnitPrice,
    loadCartFromStorage,
    saveCartToStorage,
} from "../utils/cartUtils";

export function useCart() {
    const [cartItems, setCartItems] = useState<CartItems>(() => loadCartFromStorage())


    // persist
    useEffect(() => {
        saveCartToStorage(cartItems);
    }, [cartItems]);

    function addFromDrawer(params: {
        menu: Menu;
        selectedAddons: AddOnOption[];
        qtyDrawer: number;
    }) {
        const { menu, selectedAddons, qtyDrawer } = params;

        const key = buildCartKey(menu.id, selectedAddons);

        setCartItems((prev) => {
            const existing = prev[key];

            const basePrice = menu.price ?? 0;
            const addonsPrice = calcAddonsPrice(selectedAddons);
            const unitPrice = calcUnitPrice(menu, addonsPrice);

            const nextQty = existing ? existing.qty + qtyDrawer : qtyDrawer;

            return {
                ...prev,
                [key]: {
                    key,
                    menu,
                    addons: selectedAddons,
                    qty: nextQty,
                    basePrice,
                    addonsPrice,
                    totalPrice: unitPrice * nextQty,
                },
            };
        });
    }

    // Inc: tambah qty untuk noaddon dulu, kalau gak ada pilih item terakhir menu itu
    const handleIncMenu = (menu: Menu) => {
        setCartItems((prev) => {
            const noAddonKey = `${menu.id}::noaddon`;

            const sameMenuEntries = Object.entries(prev).filter(
                ([, item]) => item.menu.id === menu.id
            );

            let targetKey: string;
            if (prev[noAddonKey]) targetKey = noAddonKey;
            else if (sameMenuEntries.length > 0) targetKey = sameMenuEntries[sameMenuEntries.length - 1][0];
            else targetKey = noAddonKey;

            const existing = prev[targetKey];
            const addons = existing ? existing.addons : ([] as AddOnOption[]);
            const addonsPrice = existing ? existing.addonsPrice : 0;

            const basePrice = menu.price ?? 0;
            const unitPrice = calcUnitPrice(menu, addonsPrice);
            const nextQty = existing ? existing.qty + 1 : 1;

            return {
                ...prev,
                [targetKey]: {
                    key: targetKey,
                    menu,
                    addons,
                    qty: nextQty,
                    basePrice,
                    addonsPrice,
                    totalPrice: unitPrice * nextQty,
                },
            };
        });
    };

    // Dec: kurangi noaddon kalau ada, else item pertama yang ketemu
    const handleDecMenu = (menuId: number) => {
        setCartItems((prev) => {
            const items = Object.values(prev).filter((it) => it.menu.id === menuId);
            if (items.length === 0) return prev;

            const noAddonKey = `${menuId}::noaddon`;
            const target = items.find((it) => it.key === noAddonKey) ?? items[0];

            const nextQty = target.qty - 1;

            if (nextQty <= 0) {
                const next = { ...prev };
                delete next[target.key];
                return next;
            }

            const unitPrice = target.totalPrice / target.qty;

            return {
                ...prev,
                [target.key]: {
                    ...target,
                    qty: nextQty,
                    totalPrice: unitPrice * nextQty,
                },
            };
        });
    };

    return {
        cartItems,
        setCartItems,
        addFromDrawer,
        handleIncMenu,
        handleDecMenu,
    };
}