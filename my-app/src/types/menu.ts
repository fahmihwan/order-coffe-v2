import type { AddOnGroup } from "./addOn";
import type { Category } from "./category";
import type { PaginationState } from "./type";

export interface Menu {
    id: string;           // uuid.UUID -> string
    image?: string;       // omitempty
    name: string;
    description?: string; // *string + omitempty
    price: number;        // float64 -> number
    is_active: boolean;
    add_on_groups?: AddOnGroup[]
}



export interface MenuWithCategoryMenuId {
    id: string;           // uuid.UUID -> string
    category_menu_id: string,
    image?: string;       // omitempty
    name: string;
    description?: string; // *string + omitempty
    price: number;        // float64 -> number
    is_active: boolean;
}

export interface MenuPayload {
    name: string;
    price: string;
    image?: File | null;
    description?: string | null,
    is_active: boolean,
};

export interface UpdateMenuPayload {
    id: string;
    payload: MenuPayload;
};

export interface MenuState {
    menus: Category[];
    addOnOptions: AddOnGroup[];
    masterMenus: Menu[];
    selectedMenu: Menu | null;
    loading: boolean;
    actionLoading: boolean;
    status: "idle" | "loading" | "success" | "failed";
    error: string | null;
    message: string;
    pagination: PaginationState | null;
};



