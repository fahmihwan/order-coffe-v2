import type { AddOnOption } from "../../../../../types/addOn";
import type { Menu } from "../../../../../types/menu";

import { useMenuData } from "./useMenuData";
import { useCart } from "./useCart";
import { useDrawer } from "../hooks/useDrawer";

export function useHome() {
    // 1) menu data (API)
    const menuData = useMenuData();

    // 2) cart logic + localStorage
    const cart = useCart();

    // 3) drawer logic (preview + addon selection)
    const drawer = useDrawer({
        fetchAddonsByMenuId: menuData.fetchAddonsByMenuId,
        listAddOns: menuData.listAddOns,
    });

    // tambah ke cart dari drawer
    const handleAddCartDrawer = () => {
        if (!drawer.previewMenu) return;
        cart.addFromDrawer({
            menu: drawer.previewMenu,
            selectedAddons: drawer.countOptions,
            qtyDrawer: drawer.qtyDrawer,
        });
        drawer.handleCloseDrawer();
    };

    // handler add option (checkbox/radio)
    const onAddOptions = (opt: AddOnOption, type: string, add_on_id: number) => {
        drawer.onAddOptions(opt, type, add_on_id);
    };

    // open drawer by menu
    const onPreviewMenu = (data: Menu) => {
        drawer.onPreviewMenu(data);
    };

    const hasCart = Object.keys(cart.cartItems).length > 0;

    return {
        // view data
        menu: menuData.menu,
        cartItems: cart.cartItems,
        hasCart,

        // drawer data
        isOpenModal: drawer.isOpenModal,
        previewMenu: drawer.previewMenu,
        listAddOns: menuData.listAddOns,
        countOptions: drawer.countOptions,
        qtyDrawer: drawer.qtyDrawer,
        totalAddCartDrawer: drawer.totalAddCartDrawer,

        // actions
        onPreviewMenu,
        handleCloseDrawer: drawer.handleCloseDrawer,
        onAddOptions,
        handleAddCartDrawer,
        handleQtyDrawer: drawer.handleQtyDrawer,
        handleIncMenu: cart.handleIncMenu,
        handleDecMenu: cart.handleDecMenu,
    };
}