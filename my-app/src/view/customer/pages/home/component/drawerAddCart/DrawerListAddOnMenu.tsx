import { useMemo, useState } from "react";
import { Drawer, DrawerHeader, DrawerItems } from "flowbite-react";

import AddOnCompt from "./AddOnCompt";

import type { Menu } from "../../../../../../types/menu";
import type { AddOn, AddOnOption } from "../../../../../../types/addOn";

import { useAppDispatch, useAppSelector } from "../../../../../../redux/hooks";
import {
    addFromDrawer,
    onAddOptions,
    resetDrawerOptions,
} from "../../../../../../redux/features/cartSlice";

import { formatRupiah } from "../../../../../../utils/cartUtils";

type DrawerListAddOnMenuProps = {
    open: boolean;
    menu: Menu | null;
    addOns: AddOn[];
    onClose: () => void;
};

const DrawerListAddOnMenu = ({
    open,
    menu,
    addOns,
    onClose,
}: DrawerListAddOnMenuProps) => {
    const dispatch = useAppDispatch();
    const drawerSelectedOptions = useAppSelector((state) => state.cart.drawerSelectedOptions);

    const [qty, setQty] = useState(1);

    const missingRequiredAddOns = useMemo(() => {
        return addOns.filter((addOn) => {
            if (!addOn.isRequired) return false;

            return !drawerSelectedOptions.some(
                (selectedOption) => selectedOption.add_on_id === addOn.id
            );
        });
    }, [addOns, drawerSelectedOptions]);

    const isFormValid = missingRequiredAddOns.length === 0;

    const totalPrice = useMemo(() => {
        const menuPrice = menu?.price ?? 0;
        const addOnPrice = drawerSelectedOptions.reduce(
            (total, item) => total + (item.price ?? 0),
            0
        );

        return (menuPrice + addOnPrice) * qty;
    }, [menu, drawerSelectedOptions, qty]);

    const handleClose = () => {
        dispatch(resetDrawerOptions());
        setQty(1);
        onClose();
    };

    const handleIncreaseQty = () => {
        setQty((prev) => prev + 1);
    };

    const handleDecreaseQty = () => {
        setQty((prev) => {
            if (prev > 1) return prev - 1;
            handleClose();
            return 1;
        });
    };

    const handleSelectOption = (opt: AddOnOption) => {
        dispatch(
            onAddOptions({
                opt,
                type: opt.type,
                add_on_id: opt.add_on_id,
            })
        );
    };

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!menu) return;

        if (!isFormValid) {
            alert(
                `Pilihan berikut wajib diisi: ${missingRequiredAddOns
                    .map((item) => item.title)
                    .join(", ")}`
            );
            return;
        }

        dispatch(
            addFromDrawer({
                menu,
                selectedAddons: drawerSelectedOptions,
                qtyDrawer: qty,
            })
        );

        handleClose();
    };

    return (
        <Drawer
            open={open}
            onClose={handleClose}
            position="bottom"
            className="w-[450px] !left-1/2 !-translate-x-1/2 !right-auto h-screen flex flex-col"
        >
            <DrawerHeader title="Pilih Add On" />

            <DrawerItems className="flex-1 min-h-0 flex flex-col p-0">
                <div className="flex-1 min-h-0 overflow-y-auto pb-16 px-4">
                    <img className="object-cover w-full h-auto rounded-lg" src={menu?.image} alt={menu?.name} />

                    <div className="flex justify-between py-2">
                        <p className="text-lg font-bold">{menu?.name}</p>
                        <p className="mb-6 text-gray-500 text-lg">{formatRupiah(menu?.price ?? 0)}</p>
                    </div>

                    <div>
                        <ul className="list-none p-0 m-0">
                            {addOns.map((addOn) => {
                                const hasSelectedOption = drawerSelectedOptions.some(
                                    (selected) => selected.add_on_id === addOn.id
                                );

                                return (
                                    <li className="mb-5" key={addOn.id}>
                                        <section className="border-b-2 border-dotted border-gray-400">
                                            <div className="flex justify-between items-center mb-5">
                                                <div>
                                                    <p className="text-xl">{addOn.title}</p>
                                                    <p className="text-sm font-light">{addOn.description}</p>
                                                </div>

                                                {hasSelectedOption ? (
                                                    <p className="text-sm text-green-600 mt-1">✓ Sudah dipilih</p>
                                                ) : addOn.isRequired ? (
                                                    <span className="bg-red-100 text-red-800 text-xs font-light h-5 px-2 py-0.5 rounded-sm">
                                                        Wajib Diisi
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-sm">
                                                        Opsional
                                                    </span>
                                                )}
                                            </div>

                                            <ul className="list-none p-0 m-0">
                                                {addOn.options.map((option) => {
                                                    const checked = drawerSelectedOptions.some(
                                                        (selected) => selected.id === option.id
                                                    );

                                                    const inputId =
                                                        option.type === "radio"
                                                            ? `radio-${addOn.id}-${option.id}`
                                                            : `chk-${addOn.id}-${option.id}`;

                                                    const name =
                                                        option.type === "radio"
                                                            ? `radio-addon-${addOn.id}`
                                                            : `chk-addon-${addOn.id}`;

                                                    return (
                                                        <AddOnCompt
                                                            key={option.id}
                                                            formatRupiah={formatRupiah}
                                                            opt={option}
                                                            name={name}
                                                            type={option.type}
                                                            inputId={inputId}
                                                            checked={checked}
                                                            onClick={() => handleSelectOption(option)}
                                                        />
                                                    );
                                                })}
                                            </ul>
                                        </section>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div className="shrink-0 w-full h-16 bg-white border-t border-gray-200 flex items-center">
                    <div className="mr-2">
                        <div className="inline-flex items-center" role="group" aria-label="Quantity control">
                            <button
                                onClick={handleDecreaseQty}
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-s-lg text-sm px-4 py-2.5"
                                aria-label="Kurangi"
                            >
                                −
                            </button>

                            <div className="text-white bg-blue-700 font-medium text-sm px-4 py-2.5 border-x border-blue-600 select-none">
                                {qty}
                            </div>

                            <button
                                onClick={handleIncreaseQty}
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-e-lg text-sm px-4 py-2.5"
                                aria-label="Tambah"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="w-full">
                        <button
                            disabled={!isFormValid}
                            onClick={handleAddToCart}
                            type="button"
                            className={`w-full text-white ${isFormValid ? "bg-blue-700 hover:bg-blue-800" : "bg-gray-400"
                                } focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm py-2.5`}
                        >
                            Tambah | {formatRupiah(totalPrice)}
                        </button>
                    </div>
                </div>
            </DrawerItems>
        </Drawer>
    );
};

export default DrawerListAddOnMenu;