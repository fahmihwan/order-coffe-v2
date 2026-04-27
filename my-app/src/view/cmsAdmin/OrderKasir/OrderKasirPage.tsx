"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import type { CartItem, GroupedAddonsCart } from "../../../types/cartItem";
import type { Category } from "../../../types/category";
import { formatRupiah } from "../../../utils/cartUtils";
import FilterAndSearch from "./component/FilterAndSearch";
import ListCardMenu from "./component/ListCardMenu";
import AddOnModal from "./component/AddOnModal";
import toast, { Toaster } from "react-hot-toast";

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

type HeldTransaction = {
    id: string;
    label?: string;
    items: CartItem[];
    paymentMethod: string;
    amountPaid: number;
    createdAt: string;
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

    const holdIdRef = useRef(0);
    const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);
    const [holdLabel, setHoldLabel] = useState("");
    const [isHoldInputOpen, setIsHoldInputOpen] = useState(false);
    const [heldAccordionOpen, setHeldAccordionOpen] = useState(false);
    const [expandedHeldIds, setExpandedHeldIds] = useState<string[]>([]);

    const toggleHeldExpand = (id: string) => {
        setExpandedHeldIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        dispatch(getMasterCategory({}));
        dispatch(getMenuWithCategories());
    }, [dispatch]);

    useEffect(() => {
        if (cart.length === 0) {
            setIsHoldInputOpen(false);
            setHoldLabel("");
        }
    }, [cart.length]);

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

        (masterCategories as Category[] | undefined)?.forEach((category: Category) => {
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

    const handleAddToCart = async (menu: Menu) => {
        try {
            setAddOnErrors({});
            dispatch(resetDrawerOptions());
            setQtyDrawer(1);

            const menuDetail = await dispatch(
                getMenuWithAddOnByMenuId({ menuId: menu.id })
            ).unwrap();

            const groups = menuDetail.add_on_groups || [];

            if (groups.length === 0) {
                dispatch(
                    addFromDrawer({
                        menu,
                        selectedAddons: [],
                        qtyDrawer: 1,
                    })
                );
                return;
            }

            setSelectedMenu(menu);
            setIsAddOnModalOpen(true);
        } catch (error) {
            console.error("Gagal ambil menu add on:", error);
        }
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

    const restoreCartItems = (items: CartItem[]) => {
        items.forEach((item) => {
            dispatch(
                addFromDrawer({
                    menu: item.menu,
                    selectedAddons: item.addons || [],
                    qtyDrawer: item.qty,
                })
            );
        });
    };

    const handleOpenHoldInput = () => {
        if (cart.length === 0) return;
        setIsHoldInputOpen(true);
    };

    const handleCancelHoldInput = () => {
        setIsHoldInputOpen(false);
        setHoldLabel("");
    };

    const handleHoldTransaction = () => {
        if (cart.length === 0) {
            toast.error("Minimal ada 1 menu di keranjang untuk ditahan");
            return;
        }

        const newHeldTransaction: HeldTransaction = {
            id: `hold-${Date.now()}-${holdIdRef.current++}`,
            label: holdLabel.trim() || undefined,
            items: cart.map((item) => ({
                ...item,
                addons: item.addons ? [...item.addons] : [],
            })),
            paymentMethod,
            amountPaid,
            createdAt: new Date().toLocaleString("id-ID"),
        };

        setHeldTransactions((prev) => [newHeldTransaction, ...prev]);
        clearCart();
        setHoldLabel("");
        setIsHoldInputOpen(false);
        toast.success("Transaksi berhasil ditahan");
    };

    const handleRestoreHeldTransaction = (heldId: string) => {
        if (cart.length > 0) {
            toast.error("Keranjang masih berisi menu. Kosongkan keranjang terlebih dahulu sebelum mengambil transaksi yang ditahan")
            return;
        }

        const heldTransaction = heldTransactions.find((item) => item.id === heldId);

        if (!heldTransaction) {
            toast.error("Transaksi yang ditahan tidak ditemukan")
            return;
        }

        restoreCartItems(heldTransaction.items);
        setPaymentMethod(heldTransaction.paymentMethod || "Tunai");
        setAmountPaid(heldTransaction.amountPaid || 0);
        setExpandedHeldIds((prev) => prev.filter((id) => id !== heldId));

        setHeldTransactions((prev) => prev.filter((item) => item.id !== heldId));
    };

    const handleDeleteHeldTransaction = (heldId: string) => {
        setExpandedHeldIds((prev) => prev.filter((id) => id !== heldId));
        setHeldTransactions((prev) => prev.filter((item) => item.id !== heldId));
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
            toast.error("Keranjang masih kosong");
            return;
        }

        if (paymentMethod === "Tunai" && amountPaid < subtotal) {
            toast.error("Nominal bayar kurang");
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
        toast.success("Pembayaran berhasil (dummy)");
        clearCart();
    };

    const addOnTotalPreview = useMemo(() => {
        return drawerSelectedOptions.reduce((acc, item) => acc + (item.price || 0), 0);
    }, [drawerSelectedOptions]);

    return (
        <>
            <div className="flex h-[calc(100dvh-80px)] flex-col gap-6 overflow-hidden lg:flex-row">
                <Toaster position="top-right" />
                <div className="min-h-0 w-full space-y-8 overflow-y-scroll p-5 lg:w-8/12">
                    <FilterAndSearch
                        search={search}
                        setSearch={setSearch}
                        categoriesWithAll={categoriesWithAll}
                        selectedCategoryId={selectedCategoryId}
                        handleCategoryClick={handleCategoryClick}
                    />

                    <ListCardMenu filteredMenus={filteredMenus} handleAddToCart={handleAddToCart} />
                </div>

                <div className="min-h-0 w-full overflow-scroll lg:w-4/12">
                    <div className="sticky top-4 border-x border-t-0 border-gray-200 bg-white p-4 shadow-sm">
                        {heldTransactions.length > 0 && (
                            <div className="bg-yellow-50">
                                <button
                                    type="button"
                                    onClick={() => setHeldAccordionOpen(!heldAccordionOpen)}
                                    className="flex w-full items-center justify-between bg-yellow-50 py-2 border-b border-orange-300"
                                >
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Transaksi Ditahan
                                            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-xs font-medium text-white">
                                                {heldTransactions.length}
                                            </span>
                                        </h3>
                                    </div>
                                    <svg
                                        className={`h-5 w-5 text-gray-500 transition-transform ${heldAccordionOpen ? "rotate-180" : ""
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {heldAccordionOpen && (
                                    <div className="mt-3 space-y-2">
                                        {heldTransactions.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                                                Belum ada transaksi yang ditahan
                                            </div>
                                        ) : (
                                            heldTransactions.map((held) => {
                                                const heldTotalItems = held.items.reduce(
                                                    (acc, item) => acc + item.qty,
                                                    0
                                                );
                                                const heldSubtotal = held.items.reduce(
                                                    (acc, item) => acc + item.totalPrice,
                                                    0
                                                );
                                                const isExpanded = expandedHeldIds.includes(held.id);

                                                return (
                                                    <div
                                                        key={held.id}
                                                        className="overflow-hidden border-b-[0.5px] bg-yellow-50"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleHeldExpand(held.id)}
                                                            className="flex w-full items-center justify-between p-3 text-left"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="truncate text-sm font-semibold text-gray-900">
                                                                        {held.label?.trim()
                                                                            ? held.label
                                                                            : "Tanpa Label"}
                                                                    </h4>
                                                                    <svg
                                                                        className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""
                                                                            }`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M19 9l-7 7-7-7"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <p className="text-xs text-gray-600">
                                                                    {heldTotalItems} item •{" "}
                                                                    {formatRupiah(heldSubtotal)}
                                                                </p>
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="border-t border-yellow-200 bg-yellow-50 p-3">
                                                                <div className="mb-2 text-xs text-gray-500">
                                                                    {held.createdAt}
                                                                </div>

                                                                <div className="mb-3 space-y-1">
                                                                    {held.items.map((item) => (
                                                                        <div
                                                                            key={item.key}
                                                                            className="flex justify-between text-xs text-gray-700"
                                                                        >
                                                                            <span>
                                                                                {item.menu.name} x{item.qty}
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                {formatRupiah(item.totalPrice)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRestoreHeldTransaction(held.id)
                                                                        }
                                                                        className="flex-1 rounded-md bg-yellow-500 px-2 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
                                                                    >
                                                                        Masukkan
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteHeldTransaction(held.id)
                                                                        }
                                                                        className="rounded-md border border-red-300 bg-white px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                                                                    >
                                                                        Hapus
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {cart.length > 0 && (
                            <div className="mb-4 mt-4">
                                {!isHoldInputOpen ? (
                                    <button
                                        type="button"
                                        onClick={handleOpenHoldInput}
                                        className="w-full rounded-lg border border-yellow-400 border-dashed text-yellow-400 px-4 py-3 text-sm font-semibold  hover:bg-yellow-50"
                                    >
                                        Tahan
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={holdLabel}
                                                onChange={(e) => setHoldLabel(e.target.value)}
                                                placeholder="Label (opsional)"
                                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
                                            />

                                            <button
                                                type="button"
                                                onClick={handleHoldTransaction}
                                                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                                            >
                                                Tambah
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleCancelHoldInput}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-red-500"
                                                aria-label="Tutup input tahan transaksi"
                                                title="Batal"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="max-h-[480px] space-y-3 overflow-y-auto mt-5 border-y py-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold">Keranjang</h2>
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
                                                            item.addons.reduce(
                                                                (acc: GroupedAddonsCart, addon: AddOnOption) => {
                                                                    if (!acc[addon.add_on_group_id]) {
                                                                        acc[addon.add_on_group_id] = {
                                                                            groupId: addon.add_on_group_id,
                                                                            options: [],
                                                                        };
                                                                    }
                                                                    acc[addon.add_on_group_id].options.push(addon);
                                                                    return acc;
                                                                },
                                                                {}
                                                            )
                                                        ).map((group) => (
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

                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Total Item</span>
                                <span>{totalItems}</span>
                            </div>

                            <div className="flex items-center justify-between text-base font-semibold">
                                <span>Subtotal</span>
                                <span>{formatRupiah(subtotal)}</span>
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

            {/*  */}
            {isAddOnModalOpen && menuWithAddOn && (
                <AddOnModal
                    menuWithAddOn={menuWithAddOn}
                    handleCloseAddOnModal={handleCloseAddOnModal}
                    setQtyDrawer={setQtyDrawer}
                    drawerSelectedOptions={drawerSelectedOptions}
                    handleSelectOption={handleSelectOption}
                    addOnErrors={addOnErrors}
                    addOnTotalPreview={addOnTotalPreview}
                    qtyDrawer={qtyDrawer}
                    handleConfirmAddOn={handleConfirmAddOn}
                />
            )}
        </>
    );
}





