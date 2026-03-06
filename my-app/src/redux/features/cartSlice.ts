import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AddOnOption } from "../../types/addOn";
import type { CartItem, CartItems } from "../../types/cartItem";
import type { Menu } from "../../types/menu";
import { buildCartKey, calcAddonsPrice, calcUnitPrice } from "../../utils/cartUtils";

type AddFromDrawerPayload = {
    menu: Menu;
    selectedAddons: AddOnOption[];
    qtyDrawer: number;
};

type IncrementMenuPayload = {
    menu: Menu;
    cartKey: string | null
};

type DecrementMenuPayload = {
    menuId: number;
    cartKey: string | null
};


export type CartState = {
    items: CartItems;
    drawerSelectedOptions: AddOnOption[];
};



type ToggleDrawerOptionPayload = {
    opt: AddOnOption;
    type: "radio" | "checkbox";
    add_on_id: number;
};



const initialState: CartState = {
    items: {},
    drawerSelectedOptions: []
};
export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addFromDrawer(state, action: PayloadAction<AddFromDrawerPayload>) {
            const { menu, selectedAddons, qtyDrawer } = action.payload;


            const key = buildCartKey(menu.id, selectedAddons);
            const existing = state.items[key];

            const basePrice = menu.price ?? 0;
            const addonsPrice = calcAddonsPrice(selectedAddons);
            const unitPrice = calcUnitPrice(menu, addonsPrice);

            const nextQty = existing ? existing.qty + qtyDrawer : qtyDrawer;

            const nextItem = {
                key,
                menu,
                addons: selectedAddons,
                qty: nextQty,
                basePrice,
                addonsPrice,
                totalPrice: unitPrice * nextQty,
            };

            state.items = {
                ...state.items,
                [key]: nextItem,
            };
        },
        incrementMenu(state, action: PayloadAction<IncrementMenuPayload>) {
            const { menu, cartKey } = action.payload;
            const noAddonKey = `${menu.id}::noaddon`;
            const prev = state.items;

            let sameMenuEntries: [string, CartItem][] = [];


            if (cartKey != null) {
                // find by cart Key
                sameMenuEntries = Object.entries(prev).filter(([, item]) => item.key === cartKey);
            } else {
                // find by Menu Id
                sameMenuEntries = Object.entries(prev).filter(([, item]) => item.menu.id === menu.id);
            }



            let targetKey: string;

            if (prev[noAddonKey]) {
                targetKey = noAddonKey;
            } else if (sameMenuEntries.length > 0) {
                targetKey = sameMenuEntries[sameMenuEntries.length - 1][0];
            } else {
                targetKey = noAddonKey;
            }

            const existing = prev[targetKey];
            const addons = existing ? existing.addons : ([] as AddOnOption[]);
            const addonsPrice = existing ? existing.addonsPrice : 0;

            const basePrice = menu.price ?? 0;
            const unitPrice = calcUnitPrice(menu, addonsPrice);
            const nextQty = existing ? existing.qty + 1 : 1;

            state.items = {
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
        },
        decrementMenu(state, action: PayloadAction<DecrementMenuPayload>) {
            const { menuId, cartKey } = action.payload;
            const prev = state.items;


            let items: CartItem[] = [];

            if (cartKey != null) {
                items = Object.values(prev).filter((it) => it.key === cartKey);
            } else {
                items = Object.values(prev).filter((it) => it.menu.id === menuId);
            }

            if (items.length === 0) return;

            const noAddonKey = `${menuId}::noaddon`;
            const target = items.find((it) => it.key === noAddonKey) ?? items[0];

            const nextQty = target.qty - 1;

            if (nextQty <= 0) {
                const next = { ...prev };
                delete next[target.key];
                state.items = next;
                return;
            }

            const unitPrice = target.totalPrice / target.qty;

            state.items = {
                ...prev,
                [target.key]: {
                    ...target,
                    qty: nextQty,
                    totalPrice: unitPrice * nextQty,
                },
            };
        },
        onAddOptions(state, action: PayloadAction<ToggleDrawerOptionPayload>) {
            const { opt, type, add_on_id } = action.payload;

            const prev = state.drawerSelectedOptions;

            const exists = prev.some((c) => c?.id === opt?.id);

            if (type === "checkbox") {
                state.drawerSelectedOptions = exists
                    ? prev.filter((c) => c.id !== opt.id)
                    : [...prev, opt];
                return;
            }

            if (type === "radio") {
                const radioOptExist = prev.find((d) => add_on_id === d.add_on_id);
                if (!radioOptExist) {
                    state.drawerSelectedOptions = [...prev, opt];
                    return;
                }
                state.drawerSelectedOptions = [
                    ...prev.filter((d) => d.id !== radioOptExist.id),
                    opt,
                ];
                return;
            }

            state.drawerSelectedOptions = prev;
        },
        updateCartItemFromDrawer: (state, action) => {
            const { cartKey, menu, selectedAddons, qtyDrawer } = action.payload;

            const currentItem = state.items[cartKey];
            if (!currentItem) return;

            const normalizedAddons = [...selectedAddons].sort((a, b) => a.id - b.id);

            const addOnTotal = normalizedAddons.reduce(
                (total: number, addon: AddOnOption) => total + (addon.price ?? 0),
                0
            );

            const unitPrice = (menu.price ?? 0) + addOnTotal;
            const totalPrice = unitPrice * qtyDrawer;

            const newKey = buildCartKey(menu.id, normalizedAddons);

            const updatedItem = {
                ...currentItem,
                key: newKey,
                menu,
                addons: normalizedAddons,
                qty: qtyDrawer,
                totalPrice,
            };

            if (newKey === cartKey) {
                state.items[cartKey] = updatedItem;
                return;
            }

            const duplicateItem = state.items[newKey];

            if (duplicateItem) {
                state.items[newKey] = {
                    ...duplicateItem,
                    qty: duplicateItem.qty + qtyDrawer,
                    totalPrice: duplicateItem.totalPrice + totalPrice,
                };

                delete state.items[cartKey];
                return;
            }

            state.items[newKey] = updatedItem;
            delete state.items[cartKey];
        },
        setDrawerSelectedOptions: (state, action) => {
            state.drawerSelectedOptions = action.payload;
        },
        // opsional tapi biasanya kepake pas close drawer
        resetDrawerOptions(state) {
            state.drawerSelectedOptions = [];
        },
    },
});


export const {
    addFromDrawer,
    incrementMenu,
    decrementMenu,
    onAddOptions,
    updateCartItemFromDrawer,
    setDrawerSelectedOptions,
    resetDrawerOptions
} = cartSlice.actions;

export default cartSlice.reducer;