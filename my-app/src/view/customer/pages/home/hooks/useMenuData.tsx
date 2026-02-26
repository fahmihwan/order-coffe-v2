import { useEffect, useState } from "react";
import type { AddOn } from "../../../../../types/addOn";
import type { Category } from "../../../../../types/category";
import { getAddOnOptionsByMenuId, getMenu } from "../../../../../api/menu";

export function useMenuData() {
    const [menu, setMenu] = useState<Category[]>([]);
    const [listAddOns, setListAddOns] = useState<AddOn[]>([]);

    useEffect(() => {
        getMenu()
            .then(setMenu)
            .catch((err) => console.error("Gagal ambil menu:", err));
    }, []);

    function fetchAddonsByMenuId(menuId: number) {
        return getAddOnOptionsByMenuId(menuId)
            .then((data) => {
                setListAddOns(data);
                return data;
            })
            .catch((err) => {
                console.error("Gagal ambil addon:", err);
                setListAddOns([]);
                return [];
            });
    }

    return { menu, listAddOns, fetchAddonsByMenuId };
}