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
        label: "Produk",
        items: [
            { label: "Menu", to: "/admin/master/menu" },
            { label: "Add on / Toping", to: "/admin/master/add-on" },
            { label: "Kategori", to: "/admin/master/category" },
        ],
    },
    {
        type: "group",
        key: "kelola",
        label: "Pengaturan produk",
        items: [
            { label: "Kategori - Menu", to: "/admin/product-setting/category-menu" },
            { label: "Menu - Add on", to: "/admin/product-setting/menu-addon" },
        ],
    },
    {
        type: "link",
        label: "List Order",
        to: "/admin/transaksi",
    },
    {
        type: "link",
        label: "Order Kasir",
        to: "/admin/order-cashier",
    },
];