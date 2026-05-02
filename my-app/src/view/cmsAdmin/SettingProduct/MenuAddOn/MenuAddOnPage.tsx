import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Pagination,
    Select,
    Spinner,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import {
    createMenuAddOn,
    deleteMenuAddOn,
    getMenuAddOn,
} from "../../../../redux/features/menuSlice";
import { getMasterAddOn } from "../../../../redux/features/addOnSlice";
import type { Menu } from "../../../../types/menu";
import type { AddOnGroup, AddOnOption } from "../../../../types/addOn";
import { formatRupiah } from "../../../../utils/cartUtils";

const ITEMS_PER_PAGE = 6;

// const formatMenuPrice = (price: number) => {
//     return `Rp ${price.toLocaleString("id-ID")}`;
// };

const getMenuStats = (menu: Menu) => {
    const totalGroups = menu.add_on_groups?.length ?? 0;
    const totalOptions =
        menu.add_on_groups?.reduce(
            (acc: number, group: AddOnGroup) => acc + (group.add_on_options?.length ?? 0),
            0
        ) ?? 0;
    const requiredGroups =
        menu.add_on_groups?.filter((group: AddOnGroup) => group.is_required).length ?? 0;

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
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [form, setForm] = useState<FormState>(initialForm);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    const { masterMenus, pagination, loading, error } = useAppSelector(
        (state) => state.menu
    );
    const { masterAddOns } = useAppSelector((state) => state.addOn);

    const fetchMenuAddOn = async (page = currentPage) => {
        await dispatch(
            getMenuAddOn({
                page,
                limit: ITEMS_PER_PAGE,
            })
        );
    };

    useEffect(() => {
        fetchMenuAddOn(currentPage);
    }, [dispatch, currentPage]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return masterMenus ?? [];

        return (masterMenus ?? []).filter((menu: Menu) => {
            const inMenu =
                menu.name?.toLowerCase().includes(keyword) ||
                menu.description?.toLowerCase().includes(keyword);

            const inGroups = (menu.add_on_groups ?? []).some((group: AddOnGroup) => {
                const groupMatch =
                    group.title?.toLowerCase().includes(keyword) ||
                    group.description?.toLowerCase().includes(keyword);

                const optionMatch = (group.add_on_options ?? []).some((opt: AddOnOption) =>
                    opt.name?.toLowerCase().includes(keyword)
                );

                return groupMatch || optionMatch;
            });

            return inMenu || inGroups;
        });
    }, [masterMenus, search]);

    const totalPages = pagination?.pages || 1;

    const openAddMenuModal = (menu: Menu) => {
        setSelectedMenu(menu);
        setForm({
            menuId: menu.id,
            addOnGroupId: "",
        });
        dispatch(getMasterAddOn({}));
        setOpenModal(true);
    };

    const closeModal = () => {
        if (submitLoading) return;
        setOpenModal(false);
        setSelectedMenu(null);
        setForm(initialForm);
    };

    const toggleExpandedMenu = (menuId: string) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    };

    const handleSubmit = async () => {
        if (!form.menuId || !form.addOnGroupId) {
            alert("Menu dan Add On Group wajib dipilih.");
            return;
        }
    
        try {
            setSubmitLoading(true);

            await dispatch(
                createMenuAddOn({
                    menu_id: form.menuId,
                    add_on_group_id: form.addOnGroupId,
                })
            ).unwrap();

            await fetchMenuAddOn(currentPage);
            closeModal();
        } catch (err) {
            console.error(err);
            alert(typeof err === "string" ? err : "Failed to create menu add on");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            "Apakah kamu yakin ingin menghapus relasi add on ini?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);
            await dispatch(deleteMenuAddOn(id)).unwrap();
            await fetchMenuAddOn(currentPage);
        } catch (err) {
            console.error(err);
            alert(typeof err === "string" ? err : "Failed to delete menu add on");
        } finally {
            setDeletingId(null);
        }
    };

    const selectedAddOnDetail = useMemo(() => {
        const groups = masterAddOns ?? [];
        return groups.find((group: AddOnGroup) => group.id === form.addOnGroupId);
    }, [masterAddOns, form.addOnGroupId]);

    return (
        <div className="space-y-6 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-heading">Menu Add On</h1>
                    <p className="mt-1 text-sm text-body">
                        Kelola relasi add-on group untuk setiap menu dengan tampilan yang
                        lebih ringkas dan mudah dipahami.
                    </p>
                </div>

                <div className="w-full lg:max-w-sm">
                    <label className="mb-2 block text-sm font-medium text-heading">
                        Cari menu / add-on / opsi
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                            <svg
                                className="h-4 w-4 text-body"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
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
                            className="block w-full rounded-xl border border-default-medium bg-white py-3 ps-10 pe-3 text-sm text-heading shadow-sm placeholder:text-body focus:border-brand focus:ring-brand"
                            placeholder="Contoh: ayam, pedas, topping..."
                        />
                    </div>
                </div>
            </div>

            {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-default bg-white p-5 shadow-sm">
                    <p className="text-sm text-body">Total menu</p>
                    <p className="mt-2 text-2xl font-bold text-heading">
                        {pagination?.total ?? filteredData.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-default bg-white p-5 shadow-sm">
                    <p className="text-sm text-body">Menu aktif di halaman ini</p>
                    <p className="mt-2 text-2xl font-bold text-heading">
                        {(filteredData ?? []).filter((item: Menu) => item.is_active).length}
                    </p>
                </div>

                <div className="rounded-2xl border border-default bg-white p-5 shadow-sm">
                    <p className="text-sm text-body">Hasil pencarian</p>
                    <p className="mt-2 text-2xl font-bold text-heading">
                        {filteredData.length}
                    </p>
                </div>
            </div> */}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {String(error)}
                </div>
            )}

            <div className="rounded-2xl border border-default bg-neutral-primary-soft p-4 shadow-sm bg-white">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-base font-semibold text-heading">
                            Daftar Menu & Add On
                        </p>
                        <p className="text-sm text-body">
                            Klik “Lihat semua group” untuk melihat detail add-on lebih lengkap.
                        </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-body shadow-sm">
                        Showing {pagination?.from ?? 0} - {pagination?.to ?? 0} of{" "}
                        {pagination?.total ?? filteredData.length}
                    </span>
                </div>

                {loading ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default bg-white">
                        <Spinner size="lg" />
                        <p className="text-sm text-body">Memuat data menu add-on...</p>
                    </div>
                ) : filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {filteredData.map((menu: Menu) => {
                            const stats = getMenuStats(menu);
                            const groups = menu.add_on_groups ?? [];
                            const isExpanded = expandedMenus[menu.id] ?? false;
                            const displayedGroups = isExpanded ? groups : groups.slice(0, 2);

                            return (
                                <div
                                    key={menu.id}
                                    className="overflow-hidden rounded-2xl border border-default bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <div className="border-b border-default p-5">
                                        <div className="flex gap-4">
                                            <img
                                                src={menu.image}
                                                alt={menu.name}
                                                className="h-20 w-20 shrink-0 rounded-2xl border border-default object-cover"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="min-w-0">
                                                        <h2 className="truncate text-lg font-semibold text-heading">
                                                            {menu.name}
                                                        </h2>
                                                        <p className="mt-1 line-clamp-2 text-sm text-body">
                                                            {menu.description || "-"}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${menu.is_active
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {menu.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-lg font-bold text-heading">
                                                    {formatRupiah(menu.price)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
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
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-heading">
                                                Add On Group
                                            </p>

                                            <Button
                                                size="xs"
                                                onClick={() => openAddMenuModal(menu)}
                                            >
                                                Tambah Group
                                            </Button>
                                        </div>

                                        {groups.length > 0 ? (
                                            <div className="space-y-3">
                                                {displayedGroups.map((group: AddOnGroup) => (
                                                    <div
                                                        key={`${menu.id}-${group.menu_add_on_group_id ?? group.id}`}
                                                        className="rounded-xl border border-default bg-neutral-primary-soft p-4"
                                                    >
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="text-sm font-semibold text-heading">
                                                                        {group.title}
                                                                    </p>
                                                                    <span
                                                                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${group.is_required
                                                                            ? "bg-rose-50 text-rose-700"
                                                                            : "bg-slate-100 text-slate-700"
                                                                            }`}
                                                                    >
                                                                        {group.is_required
                                                                            ? "Required"
                                                                            : "Optional"}
                                                                    </span>
                                                                </div>

                                                                <p className="mt-1 text-xs text-body">
                                                                    {group.description || "Tidak ada deskripsi."}
                                                                </p>

                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-body">
                                                                        {group.add_on_options?.length ?? 0} opsi
                                                                    </span>
                                                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-body">
                                                                        Min {group.min_select ?? 0}
                                                                    </span>
                                                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-body">
                                                                        Max {group.max_select ?? 0}
                                                                    </span>
                                                                </div>

                                                                {(group.add_on_options?.length ?? 0) > 0 && (
                                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                                        {group.add_on_options
                                                                            .slice(0, 4)
                                                                            .map((opt: AddOnOption) => (
                                                                                <span
                                                                                    key={opt.id}
                                                                                    className="rounded-full border border-default bg-white px-2.5 py-1 text-[11px] text-heading"
                                                                                >
                                                                                    {opt.name}
                                                                                </span>
                                                                            ))}

                                                                        {(group.add_on_options?.length ?? 0) > 4 && (
                                                                            <span className="rounded-full border border-default bg-white px-2.5 py-1 text-[11px] text-body">
                                                                                +{group.add_on_options.length - 4} opsi
                                                                                lainnya
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <Button
                                                                color="failure"
                                                                size="xs"
                                                                disabled={deletingId === group.id}
                                                                onClick={() => handleDelete(group.menu_add_on_group_id)}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {groups.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpandedMenu(menu.id)}
                                                        className="text-sm font-medium text-brand transition hover:underline"
                                                    >
                                                        {isExpanded
                                                            ? "Tampilkan lebih sedikit"
                                                            : `Lihat semua group (${groups.length})`}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-default bg-neutral-primary-soft px-4 py-8 text-center">
                                                <p className="text-sm font-medium text-heading">
                                                    Belum ada add on group
                                                </p>
                                                <p className="mt-1 text-xs text-body">
                                                    Tambahkan group agar menu bisa memiliki opsi tambahan.
                                                </p>
                                                <div className="mt-4">
                                                    <Button size="xs" onClick={() => openAddMenuModal(menu)}>
                                                        Tambah Group
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-white px-6 text-center">
                        <div className="mb-3 rounded-full bg-neutral-secondary-medium p-3">
                            <svg
                                className="h-6 w-6 text-body"
                                xmlns="http://www.w3.org/2000/svg"
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
                        <p className="text-sm font-semibold text-heading">
                            Data menu / add-on tidak ditemukan
                        </p>
                        <p className="mt-1 text-sm text-body">
                            Coba gunakan kata kunci lain yang lebih spesifik.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="block text-sm text-body">
                        Halaman <span className="font-semibold text-heading">{currentPage}</span>{" "}
                        dari <span className="font-semibold text-heading">{totalPages}</span>
                    </span>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        showIcons
                    />
                </div>
            </div>

            <Modal dismissible show={openModal} size="lg" onClose={closeModal}>
                <ModalHeader>Tambah Add On ke Menu</ModalHeader>

                <ModalBody>
                    <div className="space-y-5">
                        <div className="rounded-xl border border-default bg-neutral-primary-soft p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-body">
                                Menu terpilih
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <img
                                    src={selectedMenu?.image}
                                    alt={selectedMenu?.name}
                                    className="h-14 w-14 rounded-xl border border-default object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-heading">
                                        {selectedMenu?.name ?? "-"}
                                    </p>
                                    <p className="text-sm text-body">
                                        {selectedMenu?.description || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

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

                                {(masterAddOns ?? []).map((group: AddOnGroup) => (
                                    <option key={group.id} value={group.id}>
                                        {group.title}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {selectedAddOnDetail && (
                            <div className="rounded-xl border border-default bg-neutral-primary-soft p-4">
                                <p className="text-sm font-semibold text-heading">
                                    Preview Add On Group
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium text-heading">
                                        {selectedAddOnDetail.title}
                                    </p>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${selectedAddOnDetail.is_required
                                            ? "bg-rose-50 text-rose-700"
                                            : "bg-slate-100 text-slate-700"
                                            }`}
                                    >
                                        {selectedAddOnDetail.is_required
                                            ? "Required"
                                            : "Optional"}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-body">
                                    {selectedAddOnDetail.description || "Tidak ada deskripsi."}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-body">
                                        Min {selectedAddOnDetail.min_select ?? 0}
                                    </span>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-body">
                                        Max {selectedAddOnDetail.max_select ?? 0}
                                    </span>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-body">
                                        {selectedAddOnDetail.add_on_options?.length ?? 0} opsi
                                    </span>
                                </div>

                                {(selectedAddOnDetail.add_on_options?.length ?? 0) > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedAddOnDetail.add_on_options.map((opt: AddOnOption) => (
                                            <span
                                                key={opt.id}
                                                className="rounded-full border border-default bg-white px-2.5 py-1 text-[11px] text-heading"
                                            >
                                                {opt.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={!form.menuId || !form.addOnGroupId || submitLoading}
                    >
                        Simpan Relasi
                    </Button>

                    <Button color="gray" onClick={closeModal} disabled={submitLoading}>
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default MenuAddOnPage;