import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { formatRupiah } from "../../../../utils/cartUtils";
import QuantityStepper from "../../../shared/component/QuantityStepper";
import { DrawerRepeatMenu } from "../../../shared/component/DrawerRepeatMenu";
import type { CartItem } from "../../../../types/cartItem";
import { useState } from "react";
import { decrementMenu, incrementMenu, resetDrawerOptions, setDrawerSelectedOptions } from "../../../../redux/features/cartSlice";
import DrawerListAddOnMenu from "../home/component/drawerAddCart/DrawerListAddOnMenu";
import type { Menu } from "../../../../types/menu";
import { getAddOnOptionsByMenuId } from "../../../../redux/features/menuSlice";


export default function CartPage() {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items)

    const menus = Object.values(cartItems).map((item) => item);


    const listAddOnOptions = useAppSelector((state) => state.menu.addOnOptions)
    const status = useAppSelector((state) => state.menu.status);
    const error = useAppSelector((state) => state.menu.error);


    const [isOpenDrawerAddOnMenu, setIsOpenDrawerAddOnMenu] = useState(false);
    const [drawerRepeatMenu, setDrawerRepeatMenu] = useState<CartItem | null>(null);
    const [previewMenu, setPreviewMenu] = useState<Menu | null>(null);

    const pb1Rate = 0.10; // nanti ganti dari DB, mis: Number(setting.pb1Rate) / 100

    const isRepeatMenuDrawer = (bool: boolean, cartKey: string | null) => {
        const menu = drawerRepeatMenu?.menu;
        if (menu == null) return
        if (bool) {
            dispatch(incrementMenu({ menu: menu, cartKey: cartKey }))
        } else {
            onPreviewMenu(menu)
        }
        setDrawerRepeatMenu(null)
    }


    const onPreviewMenu = (data: Menu) => {
        setIsOpenDrawerAddOnMenu(true);
        setPreviewMenu(data);
        dispatch(resetDrawerOptions());
        dispatch(getAddOnOptionsByMenuId({ menuId: data.id }))
    };


    const onCustomizeCartItem = (item: CartItem) => {
        setIsOpenDrawerAddOnMenu(true);
        setPreviewMenu(item.menu);
        dispatch(getAddOnOptionsByMenuId({ menuId: item.menu.id }));

        // preload addon dari cart item yang sedang diedit
        dispatch(setDrawerSelectedOptions(item.addons ?? []));
    };

    const viewRepeatMenuDrawer = (cartKey: string) => {
        const cart = Object.values(cartItems)
        const foundItem = cart?.find(item => item.key === cartKey) ?? null;
        setDrawerRepeatMenu(foundItem)
    }



    if (status === "loading") return <div>Loading menu...</div>;
    if (status === "failed") return <div>Error: {error}</div>;

    return (
        <>
            <div className=" p-2  border h-14 shadow-lg flex items-center" >
                <Link
                    to="/menu"
                    type="button"
                >
                    Back
                </Link>


            </div>
            <div className="p-5">
                <p className=""><b>Ringkasan Pesan</b></p>
                <div className="mb-5">
                    <ul>
                        {
                            menus?.map((item, i) => {
                                // const menuQty = getMenuQty(cartItems, item.menu.id);

                                return (
                                    <li key={i} className=" flex justify-between py-5 w-full border-b border-dotted border-gray-400">
                                        <div className="w-1/4">
                                            <b>{item.menu?.name}</b>
                                            <p className="font-light text-sm mb-1">{formatRupiah(item.totalPrice)} </p>
                                            <p className="line-clamp-2 font-light text-xs">{item?.addons?.map(a => a.name).join(", ") ?? "-"}</p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onCustomizeCartItem(item);
                                                }}
                                                className="mt-1 font-normal text-sm text-red-500"
                                            >
                                                Kustomisasi
                                            </button>

                                        </div>
                                        <div className="w-1/4">
                                            <QuantityStepper
                                                onPlus={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    viewRepeatMenuDrawer(item.key)
                                                }}
                                                menuQty={item.qty}
                                                onMinus={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    dispatch(decrementMenu({ menuId: item.menu.id, cartKey: item.key }))
                                                }} />
                                        </div>
                                        <div className="w-1/4">
                                            <b>{formatRupiah(item.totalPrice)}</b>
                                        </div>
                                    </li>
                                )
                            })
                        }

                    </ul>
                </div>

                <RincianTagihan menus={menus} pb1Rate={pb1Rate} />

            </div>

            <DrawerListAddOnMenu
                isOpenDrawerAddOnMenu={isOpenDrawerAddOnMenu}
                previewMenu={previewMenu}
                listAddOns={listAddOnOptions}
                setIsOpenDrawerAddOnMenu={setIsOpenDrawerAddOnMenu}
                setPreviewMenu={setPreviewMenu}
            />
            <DrawerRepeatMenu
                drawerRepeatMenu={drawerRepeatMenu}
                setDrawerRepeatMenu={setDrawerRepeatMenu}
                isRepeatMenuDrawer={isRepeatMenuDrawer}
            />
            <div className="bg-white fixed bottom-0 left-1/2 -translate-x-1/2 w-[450px] p-5 shadow-lg border-t-2">
                <div className="flex items-center gap-4">
                    <div className="w-1/2">
                        <p>6 item</p>
                        <p>
                            {formatRupiah(
                                (() => {
                                    const sub = (menus ?? []).reduce(
                                        (acc, item) => acc + (item?.totalPrice ?? 0),
                                        0
                                    );
                                    const tax = Math.round(sub * pb1Rate);
                                    return sub + tax;
                                })()
                            )}
                        </p>
                    </div>

                    <div className="w-1/2">
                        <Link
                            to="/cart"
                            className="block w-full text-center text-white rounded-lg p-3  z-50 bg-blue-700 border-0"
                        >
                            Lanjut
                        </Link>
                    </div>
                </div>
            </div>
        </>

    )
}


type RincianTagihanProps = {
    menus: CartItem[],
    pb1Rate: number
}

export const RincianTagihan = ({
    menus,
    pb1Rate,
}: RincianTagihanProps) => {

    return (

        <div className="mb-28">
            <p className="mb-2"><b>Rincian Tagihan</b></p>
            <table className="w-full">
                <tbody>
                    <tr className="mb-2">
                        <td>Total Item</td>
                        <td className="text-right py-2">
                            {formatRupiah(
                                (menus ?? []).reduce((acc, item) => acc + (item?.totalPrice ?? 0), 0)
                            )}

                        </td>
                    </tr>
                    <tr className="mb-2 border-b border-dotted border-gray-400">
                        <td className="py-2">PB1 @{pb1Rate * 100}%</td>
                        <td className="text-right py-2">
                            {formatRupiah(
                                Math.round(
                                    (menus ?? []).reduce((acc, item) => acc + (item?.totalPrice ?? 0), 0) * pb1Rate
                                )
                            )}
                        </td>
                    </tr>
                    <tr className="mb-2">
                        <td><b>Total</b></td>
                        <td className="text-right py-2"><b>
                            {formatRupiah(
                                (() => {
                                    const sub = (menus ?? []).reduce(
                                        (acc, item) => acc + (item?.totalPrice ?? 0),
                                        0
                                    );
                                    const tax = Math.round(sub * pb1Rate);
                                    return sub + tax;
                                })()
                            )}
                        </b></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}