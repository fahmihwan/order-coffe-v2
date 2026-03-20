import { Button, Pagination } from "flowbite-react";
import { useMemo, useState } from "react";

type AddOnOption = {
    id: number;
    add_on_group_id: number;
    name: string;
    price: number;
    is_active: boolean;
};

type MenuAddOnGroup = {
    id: number;
    title: string;
    description: string;
    is_required: boolean;
    min_select: number;
    max_select: number;
    options: AddOnOption[];
};

type MenuItem = {
    id: number;
    img_url: string;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    menu_add_on_groups: MenuAddOnGroup[];
};

const dummyMenus: MenuItem[] = [
    {
        id: 2,
        img_url:
            "https://encrypted-tbn0.gstatic.com/AC?q=tbn:ANd9GcQrA0EfnQYQ0PhaE6oQHDFWafTbFlwmIBaCZA&s",
        name: "Memew 20",
        description: "Menu dummy",
        price: 20000,
        is_active: true,
        menu_add_on_groups: [
            {
                id: 1,
                title: "Hot or Ice",
                description: "Pilih jenis",
                is_required: true,
                min_select: 1,
                max_select: 1,
                options: [
                    {
                        id: 6,
                        add_on_group_id: 1,
                        name: "Hot",
                        price: 0,
                        is_active: true,
                    },
                    {
                        id: 7,
                        add_on_group_id: 1,
                        name: "Ice",
                        price: 100,
                        is_active: true,
                    },
                ],
            },
            {
                id: 2,
                title: "Additional syrup",
                description: "Pilih hingga 3 opsi",
                is_required: false,
                min_select: 0,
                max_select: 3,
                options: [
                    {
                        id: 1,
                        add_on_group_id: 2,
                        name: "Vanilla",
                        price: 8000,
                        is_active: true,
                    },
                    {
                        id: 2,
                        add_on_group_id: 2,
                        name: "Huzzlent",
                        price: 8000,
                        is_active: true,
                    },
                    {
                        id: 3,
                        add_on_group_id: 2,
                        name: "Caramel",
                        price: 8000,
                        is_active: true,
                    },
                    {
                        id: 4,
                        add_on_group_id: 2,
                        name: "Sugar",
                        price: 0,
                        is_active: true,
                    },
                ],
            },
        ],
    },
    {
        id: 3,
        img_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c",
        name: "Matcha Latte",
        description: "Minuman matcha creamy",
        price: 25000,
        is_active: true,
        menu_add_on_groups: [
            {
                id: 3,
                title: "Size",
                description: "Pilih ukuran minuman",
                is_required: true,
                min_select: 1,
                max_select: 1,
                options: [
                    {
                        id: 8,
                        add_on_group_id: 3,
                        name: "Regular",
                        price: 0,
                        is_active: true,
                    },
                    {
                        id: 9,
                        add_on_group_id: 3,
                        name: "Large",
                        price: 5000,
                        is_active: true,
                    },
                ],
            },
            {
                id: 4,
                title: "Topping",
                description: "Pilih topping favorit",
                is_required: false,
                min_select: 0,
                max_select: 2,
                options: [
                    {
                        id: 10,
                        add_on_group_id: 4,
                        name: "Boba",
                        price: 6000,
                        is_active: true,
                    },
                    {
                        id: 11,
                        add_on_group_id: 4,
                        name: "Grass Jelly",
                        price: 5000,
                        is_active: true,
                    },
                    {
                        id: 12,
                        add_on_group_id: 4,
                        name: "Cheese Foam",
                        price: 7000,
                        is_active: true,
                    },
                ],
            },
        ],
    },
];

const ITEMS_PER_PAGE = 5;

const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    return `+Rp ${price.toLocaleString("id-ID")}`;
};

const formatMenuPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
};

const getMenuStats = (menu: MenuItem) => {
    const totalGroups = menu.menu_add_on_groups.length;
    const totalOptions = menu.menu_add_on_groups.reduce(
        (acc, group) => acc + group.options.length,
        0
    );
    const requiredGroups = menu.menu_add_on_groups.filter(
        (group) => group.is_required
    ).length;

    return { totalGroups, totalOptions, requiredGroups };
};

const MenuAddOnPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [menus, setMenus] = useState<MenuItem[]>(dummyMenus);
    const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

    const onPageChange = (page: number) => setCurrentPage(page);

    const toggleExpandMenu = (menuId: number) => {
        setExpandedMenus((prev) =>
            prev.includes(menuId)
                ? prev.filter((id) => id !== menuId)
                : [...prev, menuId]
        );
    };

    const filteredData = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) return menus;

        return menus.filter((menu) => {
            const matchMenu =
                menu.name.toLowerCase().includes(keyword) ||
                menu.description.toLowerCase().includes(keyword);

            const matchGroup = menu.menu_add_on_groups.some(
                (group) =>
                    group.title.toLowerCase().includes(keyword) ||
                    group.description.toLowerCase().includes(keyword)
            );

            const matchOption = menu.menu_add_on_groups.some((group) =>
                group.options.some((option) =>
                    option.name.toLowerCase().includes(keyword)
                )
            );

            return matchMenu || matchGroup || matchOption;
        });
    }, [menus, search]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredData.slice(start, end);
    }, [filteredData, currentPage]);

    const handleDeleteGroup = (menuId: number, groupId: number) => {
        setMenus((prev) =>
            prev.map((menu) =>
                menu.id === menuId
                    ? {
                        ...menu,
                        menu_add_on_groups: menu.menu_add_on_groups.filter(
                            (group) => group.id !== groupId
                        ),
                    }
                    : menu
            )
        );
    };

    return (
        <div className="p-5">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-heading">Menu Add On</h1>
                    <p className="mt-1 text-sm text-body">
                        Kelola add-on group dan opsi untuk setiap menu.
                    </p>
                </div>

                <Button size="sm">Tambah Menu</Button>
            </div>

            <div className="rounded-base border border-default bg-white p-6 shadow-xs">
                <div className="overflow-hidden rounded-base border border-default bg-neutral-primary-soft shadow-xs">
                    <div className="flex flex-col gap-4 border-b border-default-medium p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-medium text-heading">
                                Daftar Menu & Add On
                            </p>
                            <p className="text-xs text-body">
                                Gunakan expand untuk melihat detail add-on group per menu.
                            </p>
                        </div>

                        <div className="relative w-full md:max-w-sm">
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
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full rounded-base border border-default-medium bg-neutral-secondary-medium py-2 ps-9 pe-3 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
                                placeholder="Search menu / add on / option"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm rtl:text-right">
                            <thead className="border-b border-default-medium bg-neutral-secondary-medium text-body">
                                <tr>
                                    <th className="px-6 py-3 font-medium">No</th>
                                    <th className="px-6 py-3 font-medium">Menu</th>
                                    <th className="px-6 py-3 font-medium">Add On Summary</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((menu, i) => {
                                        const stats = getMenuStats(menu);
                                        const isExpanded = expandedMenus.includes(menu.id);

                                        return (
                                            <>
                                                <tr
                                                    key={menu.id}
                                                    className="border-b border-default bg-neutral-primary-soft align-top hover:bg-neutral-secondary-medium"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-heading">
                                                        {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <img
                                                                src={menu.img_url}
                                                                alt={menu.name}
                                                                className="h-16 w-16 rounded-xl border border-default object-cover"
                                                            />

                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-heading">
                                                                    {menu.name}
                                                                </p>
                                                                <p className="mt-1 text-sm text-body">
                                                                    {menu.description}
                                                                </p>
                                                                <p className="mt-2 text-sm font-semibold text-heading">
                                                                    {formatMenuPrice(menu.price)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="rounded-full bg-neutral-secondary-medium px-3 py-1 text-xs font-medium text-heading">
                                                                {stats.totalGroups} group
                                                            </span>
                                                            <span className="rounded-full bg-neutral-secondary-medium px-3 py-1 text-xs font-medium text-heading">
                                                                {stats.totalOptions} option
                                                            </span>
                                                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                                                {stats.requiredGroups} required
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 space-y-2">
                                                            {menu.menu_add_on_groups.slice(0, 2).map((group) => (
                                                                <div
                                                                    key={group.id}
                                                                    className="rounded-lg border border-default bg-white px-3 py-2"
                                                                >
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="text-sm font-medium text-heading">
                                                                            {group.title}
                                                                        </p>
                                                                        <span
                                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${group.is_required
                                                                                ? "bg-rose-50 text-rose-700"
                                                                                : "bg-slate-100 text-slate-700"
                                                                                }`}
                                                                        >
                                                                            {group.is_required ? "Required" : "Optional"}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-1 text-xs text-body">
                                                                        {group.options.length} opsi • Min {group.min_select} •
                                                                        Max {group.max_select}
                                                                    </p>
                                                                </div>
                                                            ))}

                                                            {menu.menu_add_on_groups.length > 2 && (
                                                                <p className="text-xs font-medium text-brand">
                                                                    +{menu.menu_add_on_groups.length - 2} group lainnya
                                                                </p>
                                                            )}

                                                            {menu.menu_add_on_groups.length === 0 && (
                                                                <div className="rounded-lg border border-dashed border-default px-3 py-2 text-xs text-body">
                                                                    Belum ada add on group
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${menu.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {menu.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col items-end gap-2">
                                                            <Button
                                                                size="xs"
                                                                color="light"
                                                                onClick={() => toggleExpandMenu(menu.id)}
                                                            >
                                                                {isExpanded ? "Sembunyikan Detail" : "Lihat Detail"}
                                                            </Button>

                                                            <Button size="xs">Tambah Group</Button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr className="border-b border-default bg-white">
                                                        <td colSpan={5} className="px-6 py-5">
                                                            <div className="rounded-2xl border border-default bg-neutral-primary-soft p-4">
                                                                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                                    <div>
                                                                        <h3 className="text-sm font-semibold text-heading">
                                                                            Detail Add On - {menu.name}
                                                                        </h3>
                                                                        <p className="text-xs text-body">
                                                                            Kelola add-on group dan option untuk menu ini.
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2">
                                                                        <Button size="xs" color="light">
                                                                            Edit Menu
                                                                        </Button>
                                                                        <Button size="xs">Tambah Add On Group</Button>
                                                                    </div>
                                                                </div>

                                                                {menu.menu_add_on_groups.length > 0 ? (
                                                                    <div className="grid gap-4">
                                                                        {menu.menu_add_on_groups.map((group) => (
                                                                            <div
                                                                                key={group.id}
                                                                                className="rounded-2xl border border-default bg-white p-4 shadow-xs"
                                                                            >
                                                                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                                                    <div className="min-w-0">
                                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                                            <p className="text-base font-semibold text-heading">
                                                                                                {group.title}
                                                                                            </p>

                                                                                            <span
                                                                                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${group.is_required
                                                                                                    ? "bg-rose-50 text-rose-700"
                                                                                                    : "bg-slate-100 text-slate-700"
                                                                                                    }`}
                                                                                            >
                                                                                                {group.is_required
                                                                                                    ? "Required"
                                                                                                    : "Optional"}
                                                                                            </span>

                                                                                            <span className="rounded-full bg-neutral-secondary-medium px-2.5 py-1 text-[11px] text-body">
                                                                                                Min {group.min_select}
                                                                                            </span>

                                                                                            <span className="rounded-full bg-neutral-secondary-medium px-2.5 py-1 text-[11px] text-body">
                                                                                                Max {group.max_select}
                                                                                            </span>
                                                                                        </div>

                                                                                        <p className="mt-2 text-sm text-body">
                                                                                            {group.description}
                                                                                        </p>
                                                                                    </div>

                                                                                    <div className="flex shrink-0 flex-wrap gap-2">
                                                                                        <Button size="xs" color="light">
                                                                                            Edit Group
                                                                                        </Button>
                                                                                        <Button size="xs">Tambah Option</Button>
                                                                                        <Button
                                                                                            color="failure"
                                                                                            size="xs"
                                                                                            onClick={() =>
                                                                                                handleDeleteGroup(menu.id, group.id)
                                                                                            }
                                                                                        >
                                                                                            Hapus
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="mt-4">
                                                                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-body">
                                                                                        Options
                                                                                    </p>

                                                                                    {group.options.length > 0 ? (
                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            {group.options.map((option) => (
                                                                                                <div
                                                                                                    key={option.id}
                                                                                                    className={`rounded-full border px-3 py-1.5 text-sm ${option.is_active
                                                                                                        ? "border-default bg-neutral-primary-soft text-heading"
                                                                                                        : "border-default bg-gray-100 text-gray-400 line-through"
                                                                                                        }`}
                                                                                                >
                                                                                                    <span className="font-medium">
                                                                                                        {option.name}
                                                                                                    </span>
                                                                                                    <span className="ml-1 text-xs">
                                                                                                        ({formatPrice(option.price)})
                                                                                                    </span>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="rounded-xl border border-dashed border-default p-4 text-sm text-body">
                                                                                            Belum ada option.
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="rounded-2xl border border-dashed border-default bg-white p-6 text-center">
                                                                        <p className="text-sm text-body">
                                                                            Belum ada add on group untuk menu ini.
                                                                        </p>
                                                                        <div className="mt-4">
                                                                            <Button size="sm">Tambah Add On Group</Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-sm text-body"
                                        >
                                            Data menu/add-on tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="block text-sm font-normal text-body">
                            Showing{" "}
                            <span className="font-semibold text-heading">
                                {paginatedData.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-heading">
                                {filteredData.length}
                            </span>
                        </span>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages || 1}
                            onPageChange={onPageChange}
                            showIcons
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuAddOnPage;