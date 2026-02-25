import { useEffect, useState } from "react";
import type { AddOn } from "../../../../../types/addOn";
import type { Category } from "../../../../../types/category";
import { getAddOnOptionsByMenuId, getMenu } from "../../../../../api/menu";

export function useMenuData() {
    const [menu, setMenu] = useState<Category[]>([])
    const [listAddOns, setListAddOns] = useState<AddOn[]>([])

    useEffect(() => {
        getMenu()
            .then((data) => data)
            .then((data) => {
                setMenu(data)
            })
            .catch((err) => console.error("Gagal ambil menu:", err));
    }, []);


    function fetchAddOnOptionByMenuId(menuId: number) {
        getAddOnOptionsByMenuId(menuId)
            .then((data) => data)
            .then((data) => {
                setListAddOns(data)
            })
            .catch((err) => {
                console.error("Gagal ambil menu:", err);
            })
            .finally(() => {
            });
    }


    return { menu, listAddOns, fetchAddOnOptionByMenuId };
}

