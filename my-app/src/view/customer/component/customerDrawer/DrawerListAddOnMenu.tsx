import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react';
import AddOnCompt from './AddOnCompt';
import type { Menu } from '../../../../types/menu';
import type { AddOn, AddOnOption } from '../../../../types/addOn';

type DrawerListAddOnMenuProps = {
    isOpenModal: boolean;
    handleCloseDrawer: () => void;

    previewMenu: Menu | null;          // kalau bisa null saat belum pilih menu
    listAddOns: AddOn[];

    countOptions: AddOnOption[];
    totalAddCartDrawer: number;

    handleAddCartDrawer: () => void;         // atau (menu: Menu) => void kalau butuh
    onAddOptions: (option: AddOnOption, type: string, add_on_id: number,) => void; // sesuaikan signature sebenarnya
    qtyDrawer: number;
    handleQtyDrawer: (option: string) => void;
    formatRupiah: (value: number) => string
};


const DrawerListAddOnMenu = ({
    isOpenModal,
    handleCloseDrawer,
    previewMenu,
    listAddOns,
    countOptions,
    handleAddCartDrawer,
    totalAddCartDrawer,
    onAddOptions,
    qtyDrawer,
    handleQtyDrawer,
    formatRupiah
}: DrawerListAddOnMenuProps) => {
    return (
        <Drawer open={isOpenModal} onClose={handleCloseDrawer} position="bottom" className="
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
                                {listAddOns.map((d, i) => (
                                    <li className=" mb-5" key={i}>
                                        <section className=" border-b-2 border-dotted border-gray-400">
                                            <div className="flex justify-between items-center mb-5">
                                                <div>
                                                    <p className="text-xl">{d.title}</p>
                                                    <p className="text-sm font-light">{d.description}</p>
                                                </div>
                                                {d.isRequired == true && (<span className="bg-red-100 text-red-800 text-xs font-light h-5 p-2 py-0.5 rounded-sm ">Wajib Diisi</span>)}
                                                {d.isRequired == false && (<span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300">Green</span>)}
                                            </div>


                                            <ul className="list-none p-0 m-0 ">
                                                {d.options.map((opt, index) => {
                                                    if (opt.type == 'radio') {
                                                        const inputId = `radio-${d.id}-${opt.id}`;
                                                        const name = `radio-addon-${d.id}`; // penting: unik per addon

                                                        let checked = false;
                                                        if (countOptions.filter((d) => d.id == opt.id).length > 0) {
                                                            checked = true;
                                                        } else {
                                                            checked = false;
                                                        }
                                                        return (
                                                            <AddOnCompt
                                                                formatRupiah={formatRupiah}
                                                                key={index}
                                                                opt={opt}
                                                                name={name}
                                                                type={'radio'}
                                                                inputId={inputId}
                                                                checked={checked}
                                                                onChange={() => onAddOptions(opt, opt.type, opt.add_on_id)}
                                                            />
                                                        )
                                                    } else if (opt.type == 'checkbox') {
                                                        const inputId = `chk-${d.id}-${opt.id}`;
                                                        const name = `chk-addon-${d.id}`; // penting: unik per addon

                                                        let checked = false;
                                                        if (countOptions.filter((d) => d.id == opt.id).length > 0) {
                                                            checked = true;
                                                        } else {
                                                            checked = false;
                                                        }
                                                        return (
                                                            <AddOnCompt
                                                                formatRupiah={formatRupiah}
                                                                key={index}
                                                                opt={opt}
                                                                name={name}
                                                                type={'checkbox'}
                                                                inputId={inputId}
                                                                checked={checked}
                                                                onChange={() => onAddOptions(opt, opt.type, opt.add_on_id)}
                                                            />
                                                        )
                                                    }
                                                })}

                                            </ul>
                                        </section>
                                    </li>))}
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
                            onClick={() => handleAddCartDrawer()}
                            type="button"
                            className="
                                        w-full
                                        text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm  py-2.5 "
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