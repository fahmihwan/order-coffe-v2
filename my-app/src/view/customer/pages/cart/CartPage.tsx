import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { formatRupiah, getMenuQty } from "../../../../utils/cartUtils";
import QuantityStepper from "../../../shared/component/QuantityStepper";
import { DrawerRepeatMenu } from "../../../shared/component/DrawerRepeatMenu";
import type { CartItem } from "../../../../types/cartItem";
import { useState } from "react";
import { decrementMenu, incrementMenu, resetDrawerOptions } from "../../../../redux/features/cartSlice";
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


    const isRepeatMenuDrawer = (bool: boolean) => {
        const menu = drawerRepeatMenu?.menu;
        if (menu == null) return
        if (bool) {
            dispatch(incrementMenu({ menu }))
        } else {
            onPreviewMenu(menu)
        }
        setDrawerRepeatMenu(null)
    }
    const [previewMenu, setPreviewMenu] = useState<Menu | null>(null);

    const onPreviewMenu = (data: Menu) => {
        setIsOpenDrawerAddOnMenu(true);
        setPreviewMenu(data);
        dispatch(resetDrawerOptions());
        dispatch(getAddOnOptionsByMenuId({ menuId: data.id }))
    };


    const viewRepeatMenuDrawer = (menuId: number) => {
        const cart = Object.values(cartItems)
        const foundItem = cart?.find(item => item.menu?.id === menuId) ?? null;
        setDrawerRepeatMenu(foundItem)
    }

    const pb1Rate = 0.10; // nanti ganti dari DB, mis: Number(setting.pb1Rate) / 100


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
                                const menuQty = getMenuQty(cartItems, item.menu.id);

                                return (
                                    <li key={i} className=" flex justify-between py-5 w-full border-b border-dotted border-gray-400">
                                        <div className="w-1/4">
                                            <b>{item.menu.name}</b>
                                            <p className="font-light text-sm mb-1">{formatRupiah(item.totalPrice)} </p>
                                            <p className="line-clamp-2 font-light text-xs">{item?.addons?.map(a => a.name).join(", ") ?? "-"}</p>

                                            <p className="mt-1 font-normal text-sm text-red-500">Kustomisasi</p>
                                        </div>
                                        <div className="w-1/4">
                                            <QuantityStepper
                                                onPlus={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    viewRepeatMenuDrawer(item.menu.id)
                                                }}
                                                menuQty={menuQty}
                                                onMinus={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    dispatch(decrementMenu({ menuId: item.menu.id }))
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

        <div>
            <p className="mb-2"><b>Rincian Tagihan</b></p>
            <table className="w-full">
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
            </table>
        </div>
    )
}