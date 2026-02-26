import { useMemo, useState } from "react";
import type { AddOnOption, AddOn } from "../../../../../types/addOn";
import type { Menu } from "../../../../../types/menu";

export function useDrawer(params: {
    fetchAddonsByMenuId: (menuId: number) => Promise<AddOn[]>;
    listAddOns: AddOn[];
}) {
    const [isOpenDrawerAddOnMenu, setIsOpenDrawerAddOnMenu] = useState(false);
    const [previewMenu, setPreviewMenu] = useState<Menu | null>(null);

    const [qtyDrawer, setQtyDrawer] = useState<number>(1);
    const [countOptions, setCountOptions] = useState<AddOnOption[]>([]);

    const totalAddCartDrawer = useMemo(() => {
        const menuPrice = previewMenu?.price ?? 0;
        const addOnsPrice = countOptions.reduce((total, item) => total + (item?.price ?? 0), 0);
        const unitTotal = menuPrice + addOnsPrice;
        return unitTotal * qtyDrawer;
    }, [countOptions, previewMenu, qtyDrawer]);

    const handleCloseDrawerAddOnMenu = () => {
        setCountOptions([]);
        setIsOpenDrawerAddOnMenu(false);
        setQtyDrawer(1);
        setPreviewMenu(null);
    };

    const onPreviewMenu = (data: Menu) => {
        setIsOpenDrawerAddOnMenu(true);
        setPreviewMenu(data);
        params.fetchAddonsByMenuId(data.id);
    };

    const handleQtyDrawer = (option: string) => {
        if (option === "+") {
            setQtyDrawer((prev) => prev + 1);
            return;
        }

        if (option === "-") {
            setQtyDrawer((prev) => {
                if (prev > 1) return prev - 1;
                // kalau qty sudah 1, close drawer
                handleCloseDrawerAddOnMenu();
                return 1;
            });
        }
    };

    // checkbox / radio
    const onAddOptions = (opt: AddOnOption, type: string, add_on_id: number) => {
        setCountOptions((prev) => {
            const exists = prev.some((c) => c?.id === opt?.id);

            if (type === "checkbox") {
                return exists ? prev.filter((c) => c.id !== opt.id) : [...prev, opt];
            }

            if (type === "radio") {
                const radioOptExist = prev.find((d) => add_on_id === d.add_on_id);
                if (!radioOptExist) return [...prev, opt];
                return [...prev.filter((d) => d.id !== radioOptExist.id), opt];
            }

            return prev;
        });
    };

    return {
        isOpenDrawerAddOnMenu,
        previewMenu,
        qtyDrawer,
        countOptions,
        totalAddCartDrawer,
        onPreviewMenu,
        handleCloseDrawerAddOnMenu,
        handleQtyDrawer,
        onAddOptions,
        setIsOpenDrawerAddOnMenu,
    };
}