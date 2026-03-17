import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import menuReducer from "./features/menuSlice";
import { loadCart, saveCart } from "./persist";
import categorySlice from "./features/categorySlice";

const preloadedCart = typeof window !== "undefined" ? loadCart() : undefined;

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        menu: menuReducer,
        category: categorySlice,
    },
    preloadedState: preloadedCart ? { cart: preloadedCart } : undefined,
})

// save cart setiap state berubah
store.subscribe(() => {
    saveCart(store.getState().cart);
});


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
