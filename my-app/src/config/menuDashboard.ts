import type { MenuNavItem } from "../types/menuNav";


export const navMenus: MenuNavItem[] = [
    {
        type: "link",
        label: "Dashboard",
        to: "/admin/dashboard",
    },
    {
        type: "group",
        key: "master",
        label: "Master",
        items: [
            { label: "Menu", to: "/admin/master/menu" },
            { label: "Add on", to: "/admin/master/add-on" },
            { label: "Kategori", to: "/admin/master/category" },
        ],
    },
    {
        type: "group",
        key: "kelola",
        label: "Kelola",
        items: [
            { label: "Kategori - Menu", to: "/admin/kelola/kategori-menu" },
            { label: "Menu - Add on", to: "/admin/kelola/menu-add-on" },
        ],
    },
    {
        type: "link",
        label: "Transaksi",
        to: "/admin/transaksi",
    },
];