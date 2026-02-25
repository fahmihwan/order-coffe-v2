import { useState } from "react";
import type { CartItems } from "../../../../../types/cartItem";

export function useCart() {
    const [cartItems, setCartItems] = useState<CartItems>({}); // source of truth qty

}