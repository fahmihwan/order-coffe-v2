import type { AddOn } from "./addOn";
import type { Category } from "./category";
import type { PaginationState } from "./type";

export interface Menu {
    id: string;           // uuid.UUID -> string
    image?: string;       // omitempty
    name: string;
    description?: string; // *string + omitempty
    price: number;        // float64 -> number
    is_active: boolean;
}

export interface MenuRequest {
    name: string;
    price: string;
    image?: File | null;
    description?: string | null,
    is_active: boolean,
};

export interface UpdateMenuPayload {
    id: string;
    payload: MenuRequest;
};

export interface MenuState {
    menus: Category[];
    addOnOptions: AddOn[];
    masterMenus: Menu[];
    selectedMenu: Menu | null;
    loading: boolean;
    actionLoading: boolean;
    status: "idle" | "loading" | "success" | "failed";
    error: string | null;
    message: string;
    pagination: PaginationState;
};



