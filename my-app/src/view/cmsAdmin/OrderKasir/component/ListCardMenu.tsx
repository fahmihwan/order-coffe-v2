
// ListCard.tsx

import type { Menu } from "../../../../types/menu";
import { formatRupiah } from "../../../../utils/cartUtils";

type MenuWithCategoriesType = Menu & {
    categories?: {
        id: string;
        category_name: string;
    }[];
};

type ListCardProps = {
    filteredMenus: MenuWithCategoriesType[];
    handleAddToCart: (menu: Menu) => void;
};

const ListCardMenu = ({ filteredMenus, handleAddToCart }: ListCardProps) => {

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredMenus.length > 0 ? (
                filteredMenus.map((menu) => (
                    <div
                        key={menu.id}
                        onClick={() => handleAddToCart(menu)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-xl "
                    >
                        <div className="relative overflow-hidden">
                            <img
                                src={menu.image}
                                alt={menu.name}
                                className="h-44 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            />

                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                <div className="translate-y-2 rounded-full border border-purple-500 bg-white/95 px-4 py-2 text-sm font-semibold text-purple-600 shadow-md transition-all duration-300 group-hover:translate-y-0">
                                    + Tambah
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 p-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-600">
                                    {menu.name}
                                </h3>
                            </div>

                            {!!menu.categories?.length && (
                                <div className="flex flex-wrap gap-1">
                                    {menu.categories.map((category) => (
                                        <span
                                            key={category.id}
                                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 transition-all duration-300 group-hover:bg-purple-50 group-hover:text-purple-600"
                                        >
                                            {category.category_name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-base font-bold text-green-600">
                                {formatRupiah(menu.price)}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                    Menu tidak ditemukan
                </div>
            )}
        </div>
    )
}

export default ListCardMenu;