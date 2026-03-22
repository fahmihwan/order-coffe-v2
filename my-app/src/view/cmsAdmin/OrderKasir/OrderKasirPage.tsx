"use client";

import { useMemo, useState } from "react";

const dummyData = {
    data: [
        {
            id: 1,
            category_name: "Rekomendasi",
            menus: [
                {
                    id: 2,
                    name: "memew 20",
                    price: 20000,
                    image:
                        "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
                },
                {
                    id: 3,
                    name: "memew 21",
                    price: 21000,
                    image:
                        "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
                },
                {
                    id: 50,
                    name: "memew 50",
                    price: 21000,
                    image:
                        "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
                },
                {
                    id: 51,
                    name: "memew 51",
                    price: 21000,
                    image:
                        "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
                },
                {
                    id: 52,
                    name: "memew 52",
                    price: 21000,
                    image:
                        "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
                },
                {
                    id: 53,
                    name: "memew 53",
                    price: 21000,
                    image:
                        "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
                },
            ],
        },
        {
            id: 2,
            category_name: "Coffe",
            menus: [
                {
                    id: 4,
                    name: "memew 22",
                    price: 22000,
                    image:
                        "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
                },
                {
                    id: 5,
                    name: "memew 23",
                    price: 23000,
                    image:
                        "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
                },
            ],
        },
    ],
};

type MenuItem = {
    id: number;
    name: string;
    price: number;
    image: string;
};

type CartItem = MenuItem & {
    qty: number;
};

export default function OrderKasirPage() {
    const categories = dummyData.data;
    const [cart, setCart] = useState<CartItem[]>([]);

    const formatRupiah = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const addToCart = (menu: MenuItem) => {
        setCart((prev) => {
            const existingItem = prev.find((item) => item.id === menu.id);

            if (existingItem) {
                return prev.map((item) =>
                    item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
                );
            }

            return [...prev, { ...menu, qty: 1 }];
        });
    };

    const increaseQty = (menuId: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === menuId ? { ...item, qty: item.qty + 1 } : item
            )
        );
    };

    const decreaseQty = (menuId: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === menuId ? { ...item, qty: item.qty - 1 } : item
                )
                .filter((item) => item.qty > 0)
        );
    };

    const removeFromCart = (menuId: number) => {
        setCart((prev) => prev.filter((item) => item.id !== menuId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalItems = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.qty, 0);
    }, [cart]);

    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    }, [cart]);

    const handlePay = () => {
        if (cart.length === 0) {
            alert("Keranjang masih kosong");
            return;
        }

        const payload = {
            items: cart.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty,
                total: item.price * item.qty,
            })),
            total_items: totalItems,
            subtotal,
        };

        console.log("Payload pembayaran:", payload);
        alert("Pembayaran berhasil (dummy)");
        clearCart();
    };

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold">Dashboard Kasir</h1>

            <div className="flex flex-col gap-6 lg:flex-row">
                <div className="w-full lg:w-8/12 space-y-8">
                    {categories.map((category) => (
                        <section key={category.id} className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold">{category.category_name}</h2>
                                <p className="text-sm text-gray-500">
                                    Total menu: {category.menus.length}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {category.menus.map((menu) => (
                                    <div
                                        key={menu.id}
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <img
                                            src={menu.image}
                                            alt={menu.name}
                                            className="h-44 w-full object-cover"
                                        />

                                        <div className="p-4 space-y-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {menu.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">ID Menu: {menu.id}</p>
                                            </div>

                                            <p className="text-base font-bold text-green-600">
                                                {formatRupiah(menu.price)}
                                            </p>

                                            <button
                                                onClick={() => addToCart(menu)}
                                                className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium  hover:bg-brand-strong"
                                            >
                                                Tambah Pesanan
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="w-full lg:w-4/12">
                    <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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

                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                            {cart.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                                    Belum ada menu di keranjang
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-gray-200 p-3"
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-16 w-16 rounded-md object-cover"
                                            />

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatRupiah(item.price)}
                                                </p>
                                                <p className="text-sm font-semibold text-green-600">
                                                    {formatRupiah(item.price * item.qty)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => decreaseQty(item.id)}
                                                    className="h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100"
                                                >
                                                    -
                                                </button>

                                                <span className="min-w-[24px] text-center text-sm font-medium">
                                                    {item.qty}
                                                </span>

                                                <button
                                                    onClick={() => increaseQty(item.id)}
                                                    className="h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-sm font-medium text-red-500 hover:text-red-600"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 border-t pt-4 space-y-3">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Total Item</span>
                                <span>{totalItems}</span>
                            </div>

                            <div className="flex items-center justify-between text-base font-semibold">
                                <span>Subtotal</span>
                                <span>{formatRupiah(subtotal)}</span>
                            </div>

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
        </div>
    );
}