import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Pagination,
    Select,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { getMenuAddOn } from "../../../../redux/features/menuSlice";
import type { Menu } from "../../../../types/menu";
import { getMasterAddOn } from "../../../../redux/features/addOnSlice";

const ITEMS_PER_PAGE = 5;

const formatMenuPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
};

const getMenuStats = (menu: any) => {
    const totalGroups = menu.add_on_groups.length;
    const totalOptions = menu.add_on_groups.reduce(
        (acc: number, group: any) => acc + group.add_on_options.length,
        0
    );
    const requiredGroups = menu.add_on_groups.filter(
        (group: any) => group.is_required
    ).length;

    return { totalGroups, totalOptions, requiredGroups };
};

type FormState = {
    menuId: string;
    addOnGroupId: string;
};

const initialForm: FormState = {
    menuId: "",
    addOnGroupId: "",
};

const MenuAddOnPage = () => {
    const dispatch = useAppDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [form, setForm] = useState<FormState>(initialForm);

    const onPageChange = (page: number) => setCurrentPage(page);

    const { masterMenus, pagination, loading, actionLoading, error } = useAppSelector(
        (state) => state.menu
    );

    const { masterAddOns } = useAppSelector((state) => state.addOn);

    useEffect(() => {
        dispatch(getMenuAddOn({ page: currentPage, limit: ITEMS_PER_PAGE }));
    }, [dispatch, currentPage]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return masterMenus ?? [];

        return (masterMenus ?? []).filter((menu: any) => {
            const inMenu =
                menu.name?.toLowerCase().includes(keyword) ||
                menu.description?.toLowerCase().includes(keyword);

            const inGroups = (menu.add_on_groups ?? []).some((group: any) => {
                const groupMatch =
                    group.title?.toLowerCase().includes(keyword) ||
                    group.description?.toLowerCase().includes(keyword);

                const optionMatch = (group.add_on_options ?? []).some((opt: any) =>
                    opt.name?.toLowerCase().includes(keyword)
                );

                return groupMatch || optionMatch;
            });

            return inMenu || inGroups;
        });
    }, [masterMenus, search]);

    const paginatedData = useMemo(() => {
        return filteredData;
    }, [filteredData]);

    const totalPages = pagination?.pages || 1;

    const openAddMenuModal = (menu: Menu) => {
        setSelectedMenu(menu);
        setForm({
            menuId: menu.id,       // value select menu = menu.id
            addOnGroupId: "",
        });
        dispatch(getMasterAddOn({}));
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        setSelectedMenu(null);
        setForm(initialForm);
    };

    const handleSubmit = () => {
        // TODO:
        // dispatch(assignAddOnToMenu({
        //   menu_id: form.menuId,
        //   add_on_group_id: form.addOnGroupId
        // }))
        console.log("submit payload:", form);
        closeModal();
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
                                    paginatedData.map((menu: any, i: number) => {
                                        const stats = getMenuStats(menu);

                                        return (
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
                                                            src={menu.image}
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
                                                        {menu.add_on_groups.slice(0, 2).map((group: any) => (
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
                                                                    {group.add_on_options.length} opsi • Min {group.min_select} • Max{" "}
                                                                    {group.max_select}
                                                                </p>
                                                            </div>
                                                        ))}

                                                        {menu.add_on_groups.length > 2 && (
                                                            <p className="text-xs font-medium text-brand">
                                                                +{menu.add_on_groups.length - 2} group lainnya
                                                            </p>
                                                        )}

                                                        {menu.add_on_groups.length === 0 && (
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
                                                            onClick={() => openAddMenuModal(menu)}
                                                            size="xs"
                                                        >
                                                            Tambah Group
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
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
                                {pagination?.from ?? 0}
                            </span>
                            {" - "}
                            <span className="font-semibold text-heading">
                                {pagination?.to ?? 0}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-heading">
                                {pagination?.total ?? filteredData.length}
                            </span>
                        </span>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                            showIcons
                        />
                    </div>
                </div>
            </div>

            <Modal dismissible show={openModal} size="lg" onClose={closeModal}>
                <ModalHeader>Tambah Add On ke menu</ModalHeader>

                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="menuId">Menu</Label>
                            </div>
                            <Select
                                id="menuId"
                                value={form.menuId}
                                disabled
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, menuId: e.target.value }))
                                }
                            >
                                <option value={selectedMenu?.id ?? ""}>
                                    {selectedMenu?.name ?? "-- Pilih Menu --"}
                                </option>
                            </Select>
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="addOnGroupId">Pilih Add On Group</Label>
                            </div>
                            <Select
                                id="addOnGroupId"
                                value={form.addOnGroupId}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        addOnGroupId: e.target.value,
                                    }))
                                }
                            >
                                <option value="">-- Pilih Add On Group --</option>

                                {(masterAddOns?.data ?? masterAddOns ?? []).map((group: any) => (
                                    <option key={group.id} value={group.id}>
                                        {group.title}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={!form.menuId || !form.addOnGroupId}
                    >
                        Simpan Relasi
                    </Button>

                    <Button color="gray" onClick={closeModal}>
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default MenuAddOnPage;