import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import {
    decrementMenu,
    incrementMenu,
    resetDrawerOptions,
    setDrawerSelectedOptions,
} from "../../../../redux/features/cartSlice";
import { getAddOnOptionsByMenuId } from "../../../../redux/features/menuSlice";

import { formatRupiah } from "../../../../utils/cartUtils";

import QuantityStepper from "../../../shared/component/QuantityStepper";
import { DrawerRepeatMenu } from "../../../shared/component/DrawerRepeatMenu";
import DrawerListAddOnMenu from "../home/component/drawerAddCart/DrawerListAddOnMenu";

import type { CartItem } from "../../../../types/cartItem";
import type { Menu } from "../../../../types/menu";

export default function CartPage() {
    const dispatch = useAppDispatch();

    const cartItems = useAppSelector((state) => state.cart.items);
    const addOnOptions = useAppSelector((state) => state.menu.addOnOptions);
    const status = useAppSelector((state) => state.menu.status);
    const error = useAppSelector((state) => state.menu.error);

    const [isAddOnDrawerOpen, setIsAddOnDrawerOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [repeatMenuItem, setRepeatMenuItem] = useState<CartItem | null>(null);

    const [editingCartKey, setEditingCartKey] = useState<string | null>(null);
    const [initialDrawerQty, setInitialDrawerQty] = useState(1);

    const pb1Rate = 0.1;

    const cartList = useMemo(() => Object.values(cartItems), [cartItems]);

    const subtotal = useMemo(() => {
        return cartList.reduce((total, item) => total + (item.totalPrice ?? 0), 0);
    }, [cartList]);

    const tax = useMemo(() => Math.round(subtotal * pb1Rate), [subtotal, pb1Rate]);
    const grandTotal = useMemo(() => subtotal + tax, [subtotal, tax]);

    const totalItem = useMemo(() => {
        return cartList.reduce((total, item) => total + (item.qty ?? 0), 0);
    }, [cartList]);

    const openAddOnDrawer = (menu: Menu) => {
        setSelectedMenu(menu);
        setEditingCartKey(null);
        setInitialDrawerQty(1);
        setIsAddOnDrawerOpen(true);

        dispatch(resetDrawerOptions());
        dispatch(getAddOnOptionsByMenuId({ menuId: menu.id }));
    };

    const closeAddOnDrawer = () => {
        setIsAddOnDrawerOpen(false);
        setSelectedMenu(null);
        setEditingCartKey(null);
        setInitialDrawerQty(1);
        dispatch(resetDrawerOptions());;
    };

    const openCustomizeDrawer = (item: CartItem) => {
        setSelectedMenu(item.menu);
        setEditingCartKey(item.key);
        setInitialDrawerQty(item.qty);
        setIsAddOnDrawerOpen(true);

        dispatch(resetDrawerOptions());
        dispatch(getAddOnOptionsByMenuId({ menuId: item.menu.id }));
        dispatch(setDrawerSelectedOptions(item.addons ?? []));
    };

    const openRepeatMenuDrawer = (cartKey: string) => {
        const foundItem = cartList.find((item) => item.key === cartKey) ?? null;
        setRepeatMenuItem(foundItem);
    };

    const handleRepeatMenuChoice = (useSameAddOns: boolean, cartKey: string | null) => {
        if (!repeatMenuItem?.menu) return;

        if (useSameAddOns) {
            dispatch(
                incrementMenu({
                    menu: repeatMenuItem.menu,
                    cartKey,
                })
            );
        } else {
            openAddOnDrawer(repeatMenuItem.menu);
        }

        setRepeatMenuItem(null);
    };

    if (status === "loading") return <div>Loading menu...</div>;
    if (status === "failed") return <div>Error: {error}</div>;

    return (
        <>
            <div className="p-2 border h-14 shadow-lg flex items-center">
                <Link to="/menu" type="button">
                    Back
                </Link>
            </div>

            <div className="p-5">
                <p>
                    <b>Ringkasan Pesan</b>
                </p>

                <div className="mb-5">
                    <ul>
                        {cartList.map((item) => (
                            <li
                                key={item.key}
                                className="flex justify-between py-5 w-full border-b border-dotted border-gray-400"
                            >
                                <div className="w-1/4">
                                    <b>{item.menu?.name}</b>
                                    <p className="font-light text-sm mb-1">{formatRupiah(item.totalPrice)}</p>
                                    <p className="line-clamp-2 font-light text-xs">
                                        {item.addons?.map((addon) => addon.name).join(", ") || "-"}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openCustomizeDrawer(item);
                                        }}
                                        className="mt-1 font-normal text-sm text-red-500"
                                    >
                                        <b>Kustomisasi</b>
                                    </button>
                                </div>

                                <div className="w-1/4">
                                    <QuantityStepper
                                        menuQty={item.qty}
                                        onPlus={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openRepeatMenuDrawer(item.key);
                                        }}
                                        onMinus={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            dispatch(
                                                decrementMenu({
                                                    menuId: item.menu.id,
                                                    cartKey: item.key,
                                                })
                                            );
                                        }}
                                    />
                                </div>

                                <div className="w-1/4">
                                    <b>{formatRupiah(item.totalPrice)}</b>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <RincianTagihan cartItems={cartList} pb1Rate={pb1Rate} />
            </div>

            <DrawerListAddOnMenu
                open={isAddOnDrawerOpen}
                menu={selectedMenu}
                addOns={addOnOptions}
                onClose={closeAddOnDrawer}
                editingCartKey={editingCartKey}
                initialQty={initialDrawerQty}
            />

            <DrawerRepeatMenu
                drawerRepeatMenu={repeatMenuItem}
                setDrawerRepeatMenu={setRepeatMenuItem}
                isRepeatMenuDrawer={handleRepeatMenuChoice}
            />

            <div className="bg-white fixed bottom-0 left-1/2 -translate-x-1/2 w-[450px] p-5 shadow-lg border-t-2">
                <div className="flex items-center gap-4">
                    <div className="w-1/2">
                        <p>{totalItem} item</p>
                        <p>{formatRupiah(grandTotal)}</p>
                    </div>

                    <div className="w-1/2">
                        <Link
                            to="/cart"
                            className="block w-full text-center text-white rounded-lg p-3 z-50 bg-blue-700 border-0"
                        >
                            Lanjut
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}




type RincianTagihanProps = {
    cartItems: CartItem[],
    pb1Rate: number
}

export const RincianTagihan = ({
    cartItems,
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
                                (cartItems ?? []).reduce((acc, item) => acc + (item?.totalPrice ?? 0), 0)
                            )}

                        </td>
                    </tr>
                    <tr className="mb-2 border-b border-dotted border-gray-400">
                        <td className="py-2">PB1 @{pb1Rate * 100}%</td>
                        <td className="text-right py-2">
                            {formatRupiah(
                                Math.round(
                                    (cartItems ?? []).reduce((acc, item) => acc + (item?.totalPrice ?? 0), 0) * pb1Rate
                                )
                            )}
                        </td>
                    </tr>
                    <tr className="mb-2">
                        <td><b>Total</b></td>
                        <td className="text-right py-2"><b>
                            {formatRupiah(
                                (() => {
                                    const sub = (cartItems ?? []).reduce(
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