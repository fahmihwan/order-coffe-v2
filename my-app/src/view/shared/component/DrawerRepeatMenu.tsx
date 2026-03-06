
"use client";

import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import type { CartItem } from "../../../types/cartItem";

type DrawerRepeatMenuProps = {
    drawerRepeatMenu: CartItem | null
    setDrawerRepeatMenu: React.Dispatch<React.SetStateAction<CartItem | null>>,
    isRepeatMenuDrawer: (bool: boolean, cartKey: string | null) => void,
};


export function DrawerRepeatMenu({
    drawerRepeatMenu,
    setDrawerRepeatMenu,
    isRepeatMenuDrawer,
}: DrawerRepeatMenuProps) {

    return (
        <>
            <Drawer open={!!drawerRepeatMenu} onClose={() => setDrawerRepeatMenu(null)} position="bottom" className="
                    w-[450px]
                    !left-1/2
                    !-translate-x-1/2
                    !right-auto
                    
                    flex flex-col
                ">
                <DrawerHeader title="Ulangi Kustomisasi Sebelumnya" />
                <DrawerItems>
                    <div className="flex justify-between py-5">
                        <b>{drawerRepeatMenu?.menu?.name}</b>
                        <b>{drawerRepeatMenu?.menu?.price}</b>
                    </div>

                    <div className="mb-5">
                        <p><b>Variant : </b><span className="font-light">{drawerRepeatMenu?.addons?.map(a => a.name).join(", ") ?? "-"}</span></p>
                    </div>

                    <div className="flex w-full">
                        <button
                            onClick={() => isRepeatMenuDrawer(false, drawerRepeatMenu?.key ?? null)}
                            className="w-1/2 mr-2 py-4 rounded-lg border border-gray-200 bg-white px-4 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-cyan-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 "
                        >
                            Pilih Lagi
                        </button>
                        <button
                            onClick={() => isRepeatMenuDrawer(true, drawerRepeatMenu?.key ?? null)}
                            className=" w-1/2 items-center flex justify-center rounded-lg bg-blue-700  text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 ">
                            Ulangi Sebelumnya
                        </button>
                    </div>
                </DrawerItems>
            </Drawer>
        </>
    );
}
