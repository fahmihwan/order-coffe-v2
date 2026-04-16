"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { getMasterCategory } from "../../../redux/features/categorySlice";
import {
    getMenuWithAddOnByMenuId,
    getMenuWithCategories,
} from "../../../redux/features/menuSlice";
import {
    addFromDrawer,
    decrementMenu,
    incrementMenu,
    onAddOptions,
    resetDrawerOptions,
} from "../../../redux/features/cartSlice";
import type { Menu } from "../../../types/menu";
import type { AddOnGroup, AddOnOption } from "../../../types/addOn";
import type { CartItem } from "../../../types/cartItem";
import type { Category } from "../../../types/category";
import { formatRupiah } from "../../../utils/cartUtils";

const quickAmounts = [10000, 20000, 50000, 100000];

type CategoryWithAll = {
    id: string;
    category_name: string;
};

type MenuWithCategoriesType = Menu & {
    categories?: {
        id: string;
        category_name: string;
    }[];
};

export default function OrderKasirPage() {
    const dispatch = useAppDispatch();

    const { masterCategories } = useAppSelector((state) => state.category);
    const { menuWithCategories } = useAppSelector((state) => state.menu);
    const menuWithAddOn = useAppSelector((state) => state.menu.menu) as Menu | null;
    const cartItems = useAppSelector((state) => state.cart.items);
    const drawerSelectedOptions = useAppSelector(
        (state) => state.cart.drawerSelectedOptions
    );

    const cart = useMemo(() => Object.values(cartItems || {}), [cartItems]);

    const [paymentMethod, setPaymentMethod] = useState("Tunai");
    const [amountPaid, setAmountPaid] = useState<number>(0);

    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
    const [qtyDrawer, setQtyDrawer] = useState(1);
    const [addOnErrors, setAddOnErrors] = useState<Record<string, string>>({});
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(getMasterCategory({}));
        dispatch(getMenuWithCategories());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedMenu || !menuWithAddOn) return;
        if (String(menuWithAddOn.id) !== String(selectedMenu.id)) return;

        const groups = menuWithAddOn.add_on_groups || [];

        dispatch(resetDrawerOptions());
        setQtyDrawer(1);

        if (groups.length === 0) {
            dispatch(
                addFromDrawer({
                    menu: selectedMenu,
                    selectedAddons: [],
                    qtyDrawer: 1,
                })
            );
            setSelectedMenu(null);
            return;
        }

        setIsAddOnModalOpen(true);
    }, [menuWithAddOn, selectedMenu, dispatch]);

    /**
     * Ambil kategori dari menuWithCategories.categories
     * supaya tab mengikuti data kategori yang benar-benar dipakai oleh menu.
     */
    const categoriesWithAll = useMemo<CategoryWithAll[]>(() => {
        const allCategory: CategoryWithAll = {
            id: "all",
            category_name: "Semua",
        };

        const map = new Map<string, CategoryWithAll>();

        // Prioritas 1: kategori dari menuWithCategories.categories
        (menuWithCategories as MenuWithCategoriesType[] | undefined)?.forEach((menu) => {
            (menu.categories || []).forEach((category) => {
                if (!map.has(String(category.id))) {
                    map.set(String(category.id), {
                        id: String(category.id),
                        category_name: category.category_name,
                    });
                }
            });
        });

        // Optional fallback: tambahkan dari masterCategories kalau memang ada
        (masterCategories as Category[] | undefined)?.forEach((category: any) => {
            if (
                category?.id &&
                category?.category_name &&
                !map.has(String(category.id))
            ) {
                map.set(String(category.id), {
                    id: String(category.id),
                    category_name: category.category_name,
                });
            }
        });

        return [allCategory, ...Array.from(map.values())];
    }, [menuWithCategories, masterCategories]);

    /**
     * Filter menu berdasarkan:
     * 1. selectedCategoryId => cocok dengan menu.categories[].id
     * 2. search => name / description
     */
    const filteredMenus = useMemo(() => {
        const menus = (menuWithCategories || []) as MenuWithCategoriesType[];

        return menus.filter((menu) => {
            const matchCategory =
                selectedCategoryId === "all" ||
                (menu.categories || []).some(
                    (category) => String(category.id) === String(selectedCategoryId)
                );

            const keyword = search.trim().toLowerCase();
            const matchSearch =
                keyword === "" ||
                menu.name?.toLowerCase().includes(keyword) ||
                menu.description?.toLowerCase().includes(keyword);

            return matchCategory && matchSearch;
        });
    }, [menuWithCategories, selectedCategoryId, search]);

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategoryId(String(categoryId));
    };

    const handleAddToCart = (menu: Menu) => {
        setSelectedMenu(menu);
        dispatch(getMenuWithAddOnByMenuId({ menuId: menu.id }));
    };

    const handleSelectOption = (group: AddOnGroup, option: AddOnOption) => {
        const currentSelected = drawerSelectedOptions.filter(
            (item) => item.add_on_group_id === group.id
        );

        if (
            option.type === "checkbox" &&
            !currentSelected.some((item) => item.id === option.id) &&
            currentSelected.length >= group.max_select
        ) {
            setAddOnErrors((prev) => ({
                ...prev,
                [group.id]: `Maksimal pilih ${group.max_select} opsi`,
            }));
            return;
        }

        dispatch(
            onAddOptions({
                opt: option,
                type: option.type,
                add_on_id: group.id,
            })
        );

        setAddOnErrors((prev) => ({
            ...prev,
            [group.id]: "",
        }));
    };

    const validateAddOns = () => {
        if (!menuWithAddOn?.add_on_groups) return true;

        const errors: Record<string, string> = {};

        for (const group of menuWithAddOn.add_on_groups) {
            const selectedInGroup = drawerSelectedOptions.filter(
                (item) => item.add_on_group_id === group.id
            );

            if (group.is_required && selectedInGroup.length < group.min_select) {
                errors[group.id] = `Minimal pilih ${group.min_select} opsi`;
                continue;
            }

            if (selectedInGroup.length > group.max_select) {
                errors[group.id] = `Maksimal pilih ${group.max_select} opsi`;
            }
        }

        setAddOnErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfirmAddOn = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedMenu) return;
        if (!validateAddOns()) return;

        dispatch(
            addFromDrawer({
                menu: selectedMenu,
                selectedAddons: drawerSelectedOptions,
                qtyDrawer,
            })
        );

        handleCloseAddOnModal();
    };

    const handleCloseAddOnModal = () => {
        setIsAddOnModalOpen(false);
        setSelectedMenu(null);
        setQtyDrawer(1);
        setAddOnErrors({});
        dispatch(resetDrawerOptions());
    };

    const increaseQty = (item: CartItem) => {
        dispatch(
            incrementMenu({
                menu: item.menu,
                cartKey: item.key,
            })
        );
    };

    const decreaseQty = (item: CartItem) => {
        dispatch(
            decrementMenu({
                menuId: item.menu.id,
                cartKey: item.key,
            })
        );
    };

    const removeFromCart = (item: CartItem) => {
        for (let i = 0; i < item.qty; i++) {
            dispatch(
                decrementMenu({
                    menuId: item.menu.id,
                    cartKey: item.key,
                })
            );
        }
    };

    const clearCart = () => {
        cart.forEach((item: CartItem) => {
            for (let i = 0; i < item.qty; i++) {
                dispatch(
                    decrementMenu({
                        menuId: item.menu.id,
                        cartKey: item.key,
                    })
                );
            }
        });

        setAmountPaid(0);
        setPaymentMethod("Tunai");
    };

    const totalItems = useMemo(() => {
        return cart.reduce((acc: number, item: CartItem) => acc + item.qty, 0);
    }, [cart]);

    const subtotal = useMemo(() => {
        return cart.reduce((acc: number, item: CartItem) => acc + item.totalPrice, 0);
    }, [cart]);

    const change = useMemo(() => {
        return Math.max(amountPaid - subtotal, 0);
    }, [amountPaid, subtotal]);

    const handleQuickAmount = (amount: number) => {
        setAmountPaid(amount);
    };

    const handlePay = () => {
        if (cart.length === 0) {
            alert("Keranjang masih kosong");
            return;
        }

        if (paymentMethod === "Tunai" && amountPaid < subtotal) {
            alert("Nominal bayar kurang");
            return;
        }

        const payload = {
            payment_method: paymentMethod,
            amount_paid: amountPaid,
            change,
            total_items: totalItems,
            subtotal,
            items: cart.map((item: CartItem) => ({
                cart_key: item.key,
                menu_id: item.menu.id,
                menu_name: item.menu.name,
                image: item.menu.image,
                base_price: item.basePrice,
                addons_price: item.addonsPrice,
                qty: item.qty,
                total_price: item.totalPrice,
                addons: (item.addons || []).map((addon: AddOnOption) => ({
                    id: addon.id,
                    name: addon.name,
                    price: addon.price,
                    add_on_group_id: addon.add_on_group_id,
                    type: addon.type,
                })),
            })),
        };

        console.log("Payload pembayaran:", payload);
        alert("Pembayaran berhasil (dummy)");
        clearCart();
    };

    const addOnTotalPreview = useMemo(() => {
        return drawerSelectedOptions.reduce((acc, item) => acc + (item.price || 0), 0);
    }, [drawerSelectedOptions]);

    return (
        <>
            <div className="flex h-[calc(100dvh-80px)] flex-col gap-6 overflow-hidden lg:flex-row">
                <div className="min-h-0 w-full space-y-8 overflow-scroll p-5 lg:w-8/12">
                    <div>
                        <label htmlFor="input-group-1" className="sr-only">
                            Search
                        </label>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                                <svg
                                    className="h-4 w-4 text-body"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeWidth={2}
                                        d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="text"
                                id="input-group-1"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full rounded-lg border-default-medium border-gray-300 py-3 ps-9 pe-3 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
                                placeholder="Search"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-wrap gap-2">
                            {categoriesWithAll.map((category) => {
                                const isActive =
                                    String(selectedCategoryId) === String(category.id);

                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleCategoryClick(String(category.id))}
                                        className={`rounded-base border px-4 py-2.5 text-sm font-medium leading-5 shadow-xs transition ${isActive
                                            ? "border-brand bg-purple-500 text-white focus:ring-brand/30"
                                            : "border-default-medium bg-white text-body hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-neutral-tertiary"
                                            }`}
                                    >
                                        {category.category_name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {filteredMenus.length > 0 ? (
                            filteredMenus.map((menu) => (
                                <div
                                    key={menu.id}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                                >
                                    <img
                                        src={menu.image}
                                        alt={menu.name}
                                        className="h-44 w-full object-cover"
                                    />

                                    <div className="space-y-3 p-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {menu.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {menu.description}
                                            </p>
                                        </div>

                                        {!!menu.categories?.length && (
                                            <div className="flex flex-wrap gap-1">
                                                {menu.categories.map((category) => (
                                                    <span
                                                        key={category.id}
                                                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                                    >
                                                        {category.category_name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-base font-bold text-green-600">
                                            {formatRupiah(menu.price)}
                                        </p>

                                        <button
                                            onClick={() => handleAddToCart(menu)}
                                            className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium hover:bg-brand-strong"
                                        >
                                            Tambah Pesanan
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                                Menu tidak ditemukan
                            </div>
                        )}
                    </div>
                </div>

                <div className="min-h-0 w-full overflow-scroll lg:w-4/12">
                    <div className="sticky top-4 h-screen border-x border-t-0 border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Keranjang</h2>
                                <p className="text-sm text-gray-500">
                                    {totalItems} item dipilih
                                </p>
                            </div>

                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-sm font-medium text-red-500 hover:text-red-600"
                                >
                                    Kosongkan
                                </button>
                            )}
                        </div>

                        <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
                            {cart.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                                    Belum ada menu di keranjang
                                </div>
                            ) : (
                                cart.map((item: CartItem) => (
                                    <div
                                        key={item.key}
                                        className="rounded-lg border border-gray-200 p-3"
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={item.menu.image}
                                                alt={item.menu.name}
                                                className="h-16 w-16 rounded-md object-cover"
                                            />

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.menu.name}
                                                </h3>

                                                <p className="text-sm text-gray-500">
                                                    Harga menu: {formatRupiah(item.basePrice)}
                                                </p>

                                                {item.addons?.length > 0 && (
                                                    <div className="mt-1 space-y-1">
                                                        {Object.values(
                                                            item.addons.reduce((acc: any, addon: AddOnOption) => {
                                                                if (!acc[addon.add_on_group_id]) {
                                                                    acc[addon.add_on_group_id] = {
                                                                        groupId: addon.add_on_group_id,
                                                                        options: [],
                                                                    };
                                                                }
                                                                acc[addon.add_on_group_id].options.push(addon);
                                                                return acc;
                                                            }, {})
                                                        ).map((group: any) => (
                                                            <div
                                                                key={group.groupId}
                                                                className="text-xs text-gray-600"
                                                            >
                                                                {group.options.map((option: AddOnOption) => (
                                                                    <span
                                                                        key={option.id}
                                                                        className="mr-2 inline-block"
                                                                    >
                                                                        {option.name}
                                                                        {option.price > 0
                                                                            ? ` (+${formatRupiah(option.price)})`
                                                                            : ""}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <p className="text-sm text-gray-500">
                                                    Add-on/item: {formatRupiah(item.addonsPrice)}
                                                </p>

                                                <p className="text-sm font-semibold text-green-600">
                                                    {formatRupiah(item.totalPrice)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => decreaseQty(item)}
                                                    className="h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100"
                                                >
                                                    -
                                                </button>

                                                <span className="min-w-[24px] text-center text-sm font-medium">
                                                    {item.qty}
                                                </span>

                                                <button
                                                    onClick={() => increaseQty(item)}
                                                    className="h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item)}
                                                className="text-sm font-medium text-red-500 hover:text-red-600"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Total Item</span>
                                <span>{totalItems}</span>
                            </div>

                            <div className="flex items-center justify-between text-base font-semibold">
                                <span>Subtotal</span>
                                <span>{formatRupiah(subtotal)}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Metode Pembayaran
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600"
                                >
                                    <option value="Tunai">Tunai</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Jumlah Bayar
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={amountPaid || ""}
                                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                                    placeholder="Masukkan nominal bayar"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600"
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    {quickAmounts.map((amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => handleQuickAmount(amount)}
                                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                                        >
                                            {amount === 10000 && "10rb"}
                                            {amount === 20000 && "20rb"}
                                            {amount === 50000 && "50rb"}
                                            {amount === 100000 && "100rb"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-base font-semibold">
                                <span>Kembalian</span>
                                <span
                                    className={amountPaid < subtotal ? "text-red-500" : "text-green-600"}
                                >
                                    {formatRupiah(change)}
                                </span>
                            </div>

                            {cart.length > 0 && amountPaid > 0 && amountPaid < subtotal && (
                                <p className="text-sm text-red-500">
                                    Nominal bayar masih kurang
                                </p>
                            )}

                            <button
                                onClick={handlePay}
                                disabled={cart.length === 0}
                                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                Bayar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isAddOnModalOpen && menuWithAddOn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b p-4">
                            <div>
                                <h2 className="text-xl font-bold">Pilih Add On</h2>
                                <p className="text-sm text-gray-500">{menuWithAddOn.name}</p>
                            </div>

                            <button
                                onClick={handleCloseAddOnModal}
                                className="rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
                            >
                                Tutup
                            </button>
                        </div>

                        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-4">
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={menuWithAddOn.image}
                                        alt={menuWithAddOn.name}
                                        className="h-20 w-20 rounded-lg object-cover"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold">{menuWithAddOn.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {menuWithAddOn.description}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-green-600">
                                            {formatRupiah(menuWithAddOn.price)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Qty
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setQtyDrawer((prev) => Math.max(prev - 1, 1))}
                                        className="h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="min-w-[32px] text-center text-sm font-medium">
                                        {qtyDrawer}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQtyDrawer((prev) => prev + 1)}
                                        className="h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {(menuWithAddOn.add_on_groups || []).map((group) => {
                                const currentSelected = drawerSelectedOptions.filter(
                                    (item) => item.add_on_group_id === group.id
                                );

                                return (
                                    <div
                                        key={group.id}
                                        className="space-y-3 rounded-lg border border-gray-200 p-4"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {group.title}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {group.description}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Min {group.min_select} - Max {group.max_select}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            {group.add_on_options
                                                .filter((option) => option.is_active)
                                                .map((option) => {
                                                    const isChecked = currentSelected.some(
                                                        (item) => item.id === option.id
                                                    );

                                                    return (
                                                        <label
                                                            key={option.id}
                                                            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type={option.type}
                                                                    checked={isChecked}
                                                                    onChange={() =>
                                                                        handleSelectOption(group, option)
                                                                    }
                                                                />
                                                                <span className="text-sm text-gray-800">
                                                                    {option.name}
                                                                </span>
                                                            </div>

                                                            <span className="text-sm font-medium text-green-600">
                                                                {option.price > 0
                                                                    ? `+ ${formatRupiah(option.price)}`
                                                                    : "Gratis"}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                        </div>

                                        {addOnErrors[group.id] && (
                                            <p className="text-sm text-red-500">
                                                {addOnErrors[group.id]}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between border-t p-4">
                            <div>
                                <p className="text-sm text-gray-500">Total per item</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatRupiah(
                                        (menuWithAddOn.price + addOnTotalPreview) * qtyDrawer
                                    )}
                                </p>
                            </div>

                            <button
                                onClick={handleConfirmAddOn}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                            >
                                Simpan ke Keranjang
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}