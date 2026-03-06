import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react';
import AddOnCompt from './AddOnCompt';
import type { Menu } from '../../../../../../types/menu';
import type { AddOn } from '../../../../../../types/addOn';
import { useAppDispatch, useAppSelector } from '../../../../../../redux/hooks';
import { addFromDrawer, onAddOptions, resetDrawerOptions } from '../../../../../../redux/features/cartSlice';
import { useMemo, useState } from 'react';
import { formatRupiah } from '../../../../../../utils/cartUtils';

type DrawerListAddOnMenuProps = {
    isOpenDrawerAddOnMenu: boolean;
    previewMenu: Menu | null;          // kalau bisa null saat belum pilih menu
    listAddOns: AddOn[];
    setIsOpenDrawerAddOnMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setPreviewMenu: React.Dispatch<React.SetStateAction<Menu | null>>;
};


const DrawerListAddOnMenu = ({
    isOpenDrawerAddOnMenu,
    previewMenu,
    listAddOns,
    setIsOpenDrawerAddOnMenu,
    setPreviewMenu
}: DrawerListAddOnMenuProps) => {
    const [qtyDrawer, setQtyDrawer] = useState<number>(1);
    const drawerSelectedOptions = useAppSelector((state) => state.cart.drawerSelectedOptions)
    const dispatch = useAppDispatch();

    const totalAddCartDrawer = useMemo(() => {
        const menuPrice = previewMenu?.price ?? 0;
        const addOnsPrice = drawerSelectedOptions.reduce((total, item) => total + (item?.price ?? 0), 0);
        const unitTotal = menuPrice + addOnsPrice;
        return unitTotal * qtyDrawer;
    }, [drawerSelectedOptions, previewMenu, qtyDrawer]);


    const handleCloseDrawerAddOnMenu = () => {
        dispatch(resetDrawerOptions());
        setIsOpenDrawerAddOnMenu(false);
        setQtyDrawer(1);
        setPreviewMenu(null);
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

    const getMissingRequiredAddOns = () => {
        return listAddOns.filter((addOn) => {
            if (!addOn.isRequired) return false;

            const hasSelected = drawerSelectedOptions.some(
                (selected) => selected.add_on_id === addOn.id
            );

            return !hasSelected;
        });
    };

    const handleAddCartDrawer = (e: React.MouseEvent<HTMLButtonElement>) => {

        e.preventDefault();
        e.stopPropagation();

        if (!previewMenu) return;
        const missingRequired = getMissingRequiredAddOns();

        if (missingRequired.length > 0) {
            alert(
                `Pilihan berikut wajib diisi: ${missingRequired
                    .map((item) => item.title)
                    .join(", ")}`
            );
            return;
        }

        dispatch(addFromDrawer({
            menu: previewMenu,
            selectedAddons: drawerSelectedOptions,
            qtyDrawer: qtyDrawer,
        }))

        handleCloseDrawerAddOnMenu();
    };

    const missingRequiredAddOns = useMemo(() => {
        return listAddOns.filter((addOn) => {
            if (!addOn.isRequired) return false;

            return !drawerSelectedOptions.some(
                (selected) => selected.add_on_id === addOn.id
            );
        });
    }, [listAddOns, drawerSelectedOptions]);

    const isFormValid = missingRequiredAddOns.length === 0;


    return (
        <Drawer open={isOpenDrawerAddOnMenu} onClose={handleCloseDrawerAddOnMenu} position="bottom" className="
                    w-[450px]
                    !left-1/2
                    !-translate-x-1/2
                    !right-auto
                    h-screen
                    flex flex-col
                ">
            <DrawerHeader title="No Miaw miaw ok" />
            <DrawerItems className="flex-1 min-h-0 flex flex-col p-0">
                <div className="flex-1 min-h-0 overflow-y-auto  pb-16 px-4">
                    <img
                        className="object-cover w-full h-auto rounded-lg"
                        src="https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s" />
                    <div className="flex justify-between py-2">
                        <p className="text-lg font-bold">{previewMenu?.name}</p>
                        <p className="mb-6  text-gray-500  text-lg">
                            {formatRupiah(previewMenu?.price ?? 0)}
                        </p>
                    </div>

                    <div>
                        <ul className="list-none p-0 m-0">
                            <ul>
                                {listAddOns.map((d, i) => {
                                    const hasSelectedOption = drawerSelectedOptions.some(
                                        (selected) => selected.add_on_id === d.id
                                    );

                                    return (

                                        <li className=" mb-5" key={i}>
                                            <section className=" border-b-2 border-dotted border-gray-400">
                                                <div className="flex justify-between items-center mb-5">
                                                    <div>
                                                        <p className="text-xl">{d.title}</p>
                                                        <p className="text-sm font-light">{d.description}</p>


                                                    </div>
                                                    {
                                                        hasSelectedOption ? (
                                                            <p className="text-sm text-green-600 mt-1">
                                                                ✓ Sudah dipilih
                                                            </p>
                                                        ) :
                                                            d.isRequired ? (
                                                                <span className="bg-red-100 text-red-800 text-xs font-light h-5 px-2 py-0.5 rounded-sm">
                                                                    Wajib Diisi
                                                                </span>
                                                            ) : (
                                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-sm">
                                                                    Opsional
                                                                </span>
                                                            )
                                                    }
                                                </div>


                                                <ul className="list-none p-0 m-0 ">
                                                    {d.options.map((opt, index) => {
                                                        const checked = drawerSelectedOptions.some((x) => x.id === opt.id);

                                                        if (opt.type == 'radio') {
                                                            const inputId = `radio-${d.id}-${opt.id}`;
                                                            const name = `radio-addon-${d.id}`; // penting: unik per addon


                                                            return (
                                                                <AddOnCompt
                                                                    formatRupiah={formatRupiah}
                                                                    key={index}
                                                                    opt={opt}
                                                                    name={name}
                                                                    type={'radio'}
                                                                    inputId={inputId}
                                                                    checked={checked}
                                                                    onClick={() => dispatch(onAddOptions({ opt: opt, type: opt.type, add_on_id: opt.add_on_id }))}
                                                                />
                                                            )
                                                        } else if (opt.type == 'checkbox') {
                                                            const inputId = `chk-${d.id}-${opt.id}`;
                                                            const name = `chk-addon-${d.id}`; // penting: unik per addon

                                                            return (
                                                                <AddOnCompt
                                                                    formatRupiah={formatRupiah}
                                                                    key={index}
                                                                    opt={opt}
                                                                    name={name}
                                                                    type={'checkbox'}
                                                                    inputId={inputId}
                                                                    checked={checked}
                                                                    onClick={() => dispatch(onAddOptions({ opt: opt, type: opt.type, add_on_id: opt.add_on_id }))}
                                                                />
                                                            )
                                                        }
                                                    })}

                                                </ul>
                                            </section>
                                        </li>)
                                })}
                            </ul>
                        </ul>
                    </div>
                </div>


                {/* Bottom nav: nempel bawah Drawer, tidak ikut scroll */}
                <div className="shrink-0 w-full h-16 bg-white border-t border-gray-200 flex items-center">

                    <div className="mr-2 ">
                        <div
                            className="inline-flex items-center"
                            role="group"
                            aria-label="Quantity control"
                        >
                            <button
                                onClick={() => handleQtyDrawer('-')}
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4  focus:outline-none font-medium rounded-s-lg text-sm px-4 py-2.5 "
                                aria-label="Kurangi"
                            >
                                −
                            </button>
                            <div className="text-white bg-blue-700 font-medium text-sm px-4 py-2.5 border-x border-blue-600  select-none">
                                {qtyDrawer}
                            </div>
                            <button
                                onClick={() => handleQtyDrawer("+")}
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4  focus:outline-none font-medium rounded-e-lg text-sm px-4 py-2.5 "
                                aria-label="Tambah"
                            >
                                +
                            </button>
                        </div>
                    </div>


                    <div className="w-full ">
                        <button
                            disabled={!isFormValid}
                            onClick={(e) => handleAddCartDrawer(e)}
                            type="button"
                            className={`w-full
                                        text-white ${isFormValid ? 'bg-blue-700  hover:bg-blue-800' : 'bg-gray-400'}    focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm  py-2.5 `}
                        >
                            Tambah | {formatRupiah(totalAddCartDrawer)}
                        </button>

                    </div>

                </div>
            </DrawerItems>
        </Drawer>
    )
}

export default DrawerListAddOnMenu