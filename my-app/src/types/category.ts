import type { Menu } from "./menu";

export interface Category {
    id: number;
    category_name: string;
    menus: Menu[]
}