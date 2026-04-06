import type { Menu } from "./menu";

export interface Category {
    id: number;
    category_name: string;
    menus: Menu[]
}


type CategoryStatus = "idle" | "loading" | "success" | "failed";

export interface CategoryState {
    masterCategories: Category[];
    message: string;
    status: CategoryStatus;
    error?: string;
};

export interface CreateCategoryPayload {
    name: string;
};

export interface UpdateCategoryPayload {
    id: string;
    data: Partial<CreateCategoryPayload>;
};