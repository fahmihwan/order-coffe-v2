import type { MenuWithCategoryMenuId } from "./menu";
import type { PaginationState } from "./type";

export interface Category {
    id: string;
    category_name: string;
    menus: MenuWithCategoryMenuId[]
}


type CategoryStatus = "idle" | "loading" | "success" | "failed";


export interface CreateCategoryPayload {
    category_name: string;
};

export interface UpdateCategoryPayload {
    id: string;
    data: CreateCategoryPayload;
};

export interface CategoryState {
    masterCategories: Category[];
    message: string;
    status: CategoryStatus;
    error?: string;
    pagination: PaginationState | null;
};

export interface CreateCategoryMenuPayload {
    category_id: string
    menu_id: string,
}

export interface UpdateCategoryMenuPayload {
    id: string;
    data: CreateCategoryMenuPayload;
}



