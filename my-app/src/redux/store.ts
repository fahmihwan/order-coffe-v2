import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import menuReducer from "./features/menuSlice";
import { loadCart, saveCart } from "./persist";
import categoryReducer from "./features/categorySlice";
import addOnReducer from "./features/addOnSlice";

const preloadedCart = typeof window !== "undefined" ? loadCart() : undefined;

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        menu: menuReducer,
        category: categoryReducer,
        addOn: addOnReducer
    },
    preloadedState: preloadedCart ? { cart: preloadedCart } : undefined,
})

// save cart setiap state berubah
store.subscribe(() => {
    saveCart(store.getState().cart);
});


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
