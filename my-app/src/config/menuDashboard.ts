import type { MenuNavItem } from "../types/menuNav";


export const navMenus: MenuNavItem[] = [
    {
        type: "link",
        label: "Dashboard",
        to: "/",
    },
    {
        type: "group",
        key: "master",
        label: "Master",
        items: [
            { label: "Menu", to: "/menu" },
            { label: "Add on", to: "/add-on" },
            { label: "Kategori", to: "/kategori" },
        ],
    },
    {
        type: "group",
        key: "kelola",
        label: "Kelola",
        items: [
            { label: "Kategori - Menu", to: "/kategori-menu" },
            { label: "Menu - Add on", to: "/menu-add-on" },
        ],
    },
    {
        type: "link",
        label: "Transaksi",
        to: "/transaksi",
    },
];