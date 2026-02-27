import Header from "./component/Header";
import SearchFilter from "./component/SearchFilter";
import CardMenu from "./component/CardMenu";
import { getMenuQty } from "../../../../utils/cartUtils";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { useEffect, useState } from "react";
import { getListMenu, getAddOnOptionsByMenuId } from "../../../../redux/features/menuSlice";
import { resetDrawerOptions } from "../../../../redux/features/cartSlice";
import type { Menu } from "../../../../types/menu";
import DrawerListAddOnMenu from "./component/customerDrawer/DrawerListAddOnMenu";

export default function HomePage() {

    // view/customer/pages/home/.....

    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items)

    const menus = useAppSelector((state) => state.menu.menus);
    const listAddOnOptions = useAppSelector((state) => state.menu.addOnOptions)
    const status = useAppSelector((state) => state.menu.status);
    const error = useAppSelector((state) => state.menu.error);

    useEffect(() => {
        dispatch(getListMenu());
    }, [dispatch]);


    const [isOpenDrawerAddOnMenu, setIsOpenDrawerAddOnMenu] = useState(false);
    const [previewMenu, setPreviewMenu] = useState<Menu | null>(null);

    const onPreviewMenu = (data: Menu) => {
        setIsOpenDrawerAddOnMenu(true);
        setPreviewMenu(data);
        dispatch(resetDrawerOptions());
        dispatch(getAddOnOptionsByMenuId({ menuId: data.id }))
    };


    if (status === "loading") return <div>Loading menu...</div>;
    if (status === "failed") return <div>Error: {error}</div>;



    return (
        <>
            <Header />
            <div className="p-5">
                <SearchFilter />
                <div className="w-full">
                    {menus?.map((item, i) => (
                        <ul key={i} className="list-none p-0 m-0 mt-5">
                            <li className="mb-2">{item.category_name}</li>

                            {item.menus.map((d, idx) => {
                                const menuQty = getMenuQty(cartItems, d.id);

                                return (
                                    <li className="mb-2" key={idx + "-child"}>
                                        <CardMenu
                                            menu={d}
                                            menuQty={menuQty}
                                            onPreviewMenu={() => onPreviewMenu(d)}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    ))}

                    {/* has cart */}
                    {Object.keys(cartItems).length > 0 && (
                        <div
                            className="bg-white fixed bottom-0 left-1/2 -translate-x-1/2 flex justify-center w-[450px]">
                            <button type="button" className="border-4 text-white rounded-lg m-2 p-3 shadow z-50 bg-blue-700 w-[400px]">
                                Lihat keranjang
                            </button>
                        </div>
                    )}

                    <DrawerListAddOnMenu
                        isOpenDrawerAddOnMenu={isOpenDrawerAddOnMenu}
                        previewMenu={previewMenu}
                        listAddOns={listAddOnOptions}
                        setIsOpenDrawerAddOnMenu={setIsOpenDrawerAddOnMenu}
                        setPreviewMenu={setPreviewMenu}
                    />
                </div>
            </div>

        </>
    );
}