import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "./component/Header";
import SearchFilter from "./component/SearchFilter";
import CardMenu from "./component/CardMenu";
import DrawerListAddOnMenu from "./component/drawerAddCart/DrawerListAddOnMenu";
import { DrawerRepeatMenu } from "../../../shared/component/DrawerRepeatMenu";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { getMenuWithAddOnByMenuId } from "../../../../redux/features/menuSlice";
import { incrementMenu, resetDrawerOptions } from "../../../../redux/features/cartSlice";

import { getMenuQty } from "../../../../utils/cartUtils";

import type { Menu } from "../../../../types/menu";
import type { CartItem } from "../../../../types/cartItem";
import { getCategoryMenu } from "../../../../redux/features/categorySlice";

export default function HomePage() {
    const dispatch = useAppDispatch();

    const cartItems = useAppSelector((state) => state.cart.items);
    const menuCategories = useAppSelector((state) => state.category.masterCategories);
    // const addOnOptions = useAppSelector((state) => state.menu.addOnOptions);
    const status = useAppSelector((state) => state.menu.status);
    const menuWithAddOn = useAppSelector((state) => state.menu.menu);
    const error = useAppSelector((state) => state.menu.error);


    const [isAddOnDrawerOpen, setIsAddOnDrawerOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [repeatMenuItem, setRepeatMenuItem] = useState<CartItem | null>(null);

    useEffect(() => {
        dispatch(getCategoryMenu({}));
    }, [dispatch]);


    const openAddOnDrawer = (menu: Menu) => {
        setSelectedMenu(menu);
        setIsAddOnDrawerOpen(true);
        dispatch(resetDrawerOptions());
        dispatch(getMenuWithAddOnByMenuId({ menuId: menu.id }));
    };

    const closeAddOnDrawer = () => {
        setIsAddOnDrawerOpen(false);
        setSelectedMenu(null);
    };

    const openRepeatMenuDrawer = (menuId: number) => {
        const foundItem = Object.values(cartItems).find((item) => item.menu.id === menuId) ?? null;
        setRepeatMenuItem(foundItem);
    };

    const handleRepeatMenuChoice = (useSameAddOns: boolean) => {
        if (!repeatMenuItem?.menu) return;

        if (useSameAddOns) {
            dispatch(
                incrementMenu({
                    menu: repeatMenuItem.menu,
                    cartKey: null,
                })
            );
        } else {
            openAddOnDrawer(repeatMenuItem.menu);
        }

        setRepeatMenuItem(null);
    };

    const totalQtyCart = useMemo(() => {
        return Object.values(cartItems).reduce((sum, item) => sum + item.qty, 0);
    }, [cartItems])


    if (status === "loading") return <div>Loading menu...</div>;
    // if (status === "failed") return <div>Error: {error}</div>;

    return (
        <>
            <Header />

            <div className="p-5">
                <SearchFilter />

                <div className="w-full">
                    {menuCategories?.map((group) => (
                        <ul key={group.id} className="list-none p-0 m-0 mt-5">
                            <li className="mb-2">{group.category_name}</li>

                            {group.menus.map((menu) => {
                                const menuQty = getMenuQty(cartItems, menu.id);

                                return (
                                    <li className="mb-2" key={menu.id}>
                                        <CardMenu
                                            menu={menu}
                                            menuQty={menuQty}
                                            onPreviewMenu={() => openAddOnDrawer(menu)}
                                            viewRepeatMenuDrawer={openRepeatMenuDrawer}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    ))}

                    {totalQtyCart > 0 && (
                        <div className="bg-white fixed bottom-0 left-1/2 -translate-x-1/2 flex justify-center w-[450px]">
                            <Link
                                to="/cart"
                                type="button"
                                className="text-center text-white rounded-lg m-2 p-3 shadow z-50 bg-blue-700 w-[400px] border-0"
                            >
                                ({totalQtyCart}) Lihat keranjang
                            </Link>
                        </div>
                    )}

                    <DrawerListAddOnMenu
                        open={isAddOnDrawerOpen}
                        menu={selectedMenu}
                        menuWithAddOns={menuWithAddOn}
                        onClose={closeAddOnDrawer}
                    />

                    <DrawerRepeatMenu
                        drawerRepeatMenu={repeatMenuItem}
                        setDrawerRepeatMenu={setRepeatMenuItem}
                        isRepeatMenuDrawer={handleRepeatMenuChoice}
                    />
                </div>
            </div >
        </>
    );
}