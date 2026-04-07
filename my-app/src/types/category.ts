import type { Menu } from "./menu";
import type { PaginationState } from "./type";

export interface Category {
    id: string;
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
    categoryName: string;
};

export interface UpdateCategoryPayload {
    id: string;
    data: Partial<CreateCategoryPayload>;
};

export interface CategoryState {
    masterCategories: Category[];
    message: string;
    status: CategoryStatus;
    error?: string;
    pagination: PaginationState | null;
};

export interface GetMasterCategoryParams {
    page?: number;
    limit?: number;
};

