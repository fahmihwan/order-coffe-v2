import Header from "./component/Header";
import SearchFilter from "./component/SearchFilter";
import CardMenu from "./component/CardMenu";
import DrawerListAddOnMenu from "./component/customerDrawer/DrawerListAddOnMenu";

import { useHome } from "./hooks/useHome";
import { formatRupiah, getMenuQty } from "./utils/cartUtils";

export default function HomePage() {
    const home = useHome();

    return (
        <>
            <Header />
            <div className="p-5">
                <SearchFilter />
                <div className="w-full">
                    {home.menu.map((item, i) => (
                        <ul key={i} className="list-none p-0 m-0 mt-5">
                            <li className="mb-2">{item.category_name}</li>

                            {item.menus.map((d, idx) => {
                                const menuQty = getMenuQty(home.cartItems, d.id);

                                return (
                                    <li className="mb-2" key={idx + "-child"}>
                                        <CardMenu
                                            handleDecMenu={home.handleDecMenu}
                                            handleIncMenu={home.handleIncMenu}
                                            menu={d}
                                            menuQty={menuQty}
                                            onPreviewMenu={(e) => home.onPreviewMenu(e, d)}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    ))}

                    {home.hasCart && (
                        <div
                            className="bg-white fixed bottom-0 left-1/2 -translate-x-1/2 flex justify-center w-[450px]">
                            <button type="button" className="border-4 text-white rounded-lg m-2 p-3 shadow z-50 bg-blue-700 w-[400px]">
                                Lihat keranjang
                            </button>
                        </div>
                    )}

                    <DrawerListAddOnMenu
                        isOpenDrawerAddOnMenu={home.isOpenDrawerAddOnMenu}
                        handleCloseDrawerAddOnMenu={home.handleCloseDrawerAddOnMenu}
                        previewMenu={home.previewMenu}
                        listAddOns={home.listAddOns}
                        countOptions={home.countOptions}
                        handleAddCartDrawer={home.handleAddCartDrawer}
                        totalAddCartDrawer={home.totalAddCartDrawer}
                        onAddOptions={home.onAddOptions}
                        qtyDrawer={home.qtyDrawer}
                        handleQtyDrawer={home.handleQtyDrawer}
                        formatRupiah={formatRupiah}
                    />
                </div>
            </div>
        </>
    );
}