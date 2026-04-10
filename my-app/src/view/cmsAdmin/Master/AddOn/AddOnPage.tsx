import {
    Badge,
    Button,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Pagination,
    Select,
    TextInput,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../../../redux/store";
import {
    createAddOnOption,
    deleteAddOnOption,
    getMasterAddOn,
    setMessage,
    updateAddOnOption,
} from "../../../../redux/features/addOnSlice";
import type { AddOnOption, AddOnType } from "../../../../types/addOn";

type AddOptionForm = {
    name: string;
    price: string;
    is_active: boolean;
    type: AddOnType;
};

const initialForm: AddOptionForm = {
    name: "",
    price: "",
    is_active: true,
    type: "radio",
};

const AddOnPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    const {
        masterAddOns,
        loading,
        actionLoading,
        pagination,
        message,
        error,
    } = useSelector((state: RootState) => state.addOn);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [openModal, setOpenModal] = useState(false);
    const [selectedAddOnId, setSelectedAddOnId] = useState<number | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [form, setForm] = useState<AddOptionForm>(initialForm);

    useEffect(() => {
        dispatch(
            getMasterAddOn({
                page: currentPage,
                // limit: pagination.limit ?? 5,
            })
        );
    }, [dispatch, currentPage]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                dispatch(setMessage(""));
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, dispatch]);

    const selectedAddOn = useMemo(() => {
        if (selectedAddOnId === null) return null;
        return masterAddOns.find((item) => item.id === selectedAddOnId) ?? null;
    }, [masterAddOns, selectedAddOnId]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return masterAddOns;

        return masterAddOns.filter((item) => {
            const matchTitle = item.title.toLowerCase().includes(keyword);
            const matchDescription = (item.description ?? "")
                .toLowerCase()
                .includes(keyword);

            const matchOption = (item.add_on_options ?? []).some((option) =>
                option.name.toLowerCase().includes(keyword)
            );

            return matchTitle || matchDescription || matchOption;
        });
    }, [masterAddOns, search]);

    const resetForm = () => {
        setForm(initialForm);
        setSelectedAddOnId(null);
        setSelectedOptionId(null);
        setIsEditMode(false);
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    const toggleExpandRow = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const openAddOptionModal = (
        addOnId: number,
        defaultType: AddOnType = "radio"
    ) => {
        setIsEditMode(false);
        setSelectedAddOnId(addOnId);
        setSelectedOptionId(null);
        setForm({
            name: "",
            price: "",
            is_active: true,
            type: defaultType,
        });
        setOpenModal(true);
    };

    const openEditOptionModal = (addOnId: number, option: AddOnOption) => {
        setIsEditMode(true);
        setSelectedAddOnId(addOnId);
        setSelectedOptionId(option.id);
        setForm({
            name: option.name,
            price: String(option.price),
            is_active:
                "is_active" in option
                    ? Boolean(
                        (option as AddOnOption & { is_active?: boolean }).is_active
                    )
                    : true,
            type: option.type,
        });
        setOpenModal(true);
    };

    const handleSubmit = async () => {
        if (!selectedAddOnId || !form.name.trim()) return;

        if (isEditMode && selectedOptionId) {
            const resultAction = await dispatch(
                updateAddOnOption({
                    id: String(selectedOptionId),
                    payload: {
                        name: form.name.trim(),
                        add_on_group_id: String(selectedAddOnId),
                        price: Number(form.price) || 0,
                        type: form.type,
                        is_active: form.is_active,
                    },
                })
            );

            if (updateAddOnOption.fulfilled.match(resultAction)) {
                closeModal();
                dispatch(
                    getMasterAddOn({
                        page: currentPage,
                        // limit: pagination.limit ?? 5,
                    })
                );
            }

            return;
        }

        const resultAction = await dispatch(
            createAddOnOption({
                name: form.name.trim(),
                add_on_group_id: String(selectedAddOnId),
                price: Number(form.price) || 0,
                type: form.type,
                is_active: form.is_active,
            })
        );

        if (createAddOnOption.fulfilled.match(resultAction)) {
            closeModal();

            dispatch(
                getMasterAddOn({
                    page: currentPage,
                    // limit: pagination.limit ?? 5,
                })
            );
        }
    };

    const handleDeleteOption = async (optionId: number) => {
        const resultAction = await dispatch(deleteAddOnOption(String(optionId)));

        if (deleteAddOnOption.fulfilled.match(resultAction)) {
            dispatch(
                getMasterAddOn({
                    page: currentPage,
                    // limit: pagination.limit ?? 5,
                })
            );
        }
    };

    return (
        <div className="p-5">
            <div className="mb-5 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-heading">Add On Page</h1>
            </div>

            {message && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-base border border-default bg-white p-6 shadow-xs">
                <div className="overflow-hidden rounded-base border border-default bg-neutral-primary-soft shadow-xs">
                    <div className="flex flex-col gap-4 border-b border-default p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-heading">
                                Master Add On
                            </h2>
                            <p className="text-sm text-body">
                                Kelola add on dan option dalam tampilan yang lebih ringkas.
                            </p>
                        </div>

                        <div className="relative w-full md:w-80">
                            <label htmlFor="search-addon" className="sr-only">
                                Search
                            </label>

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
                                id="search-addon"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full rounded-base border border-default-medium bg-neutral-secondary-medium py-2 pe-3 ps-9 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
                                placeholder="Search add on / option"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-body rtl:text-right">
                            <thead className="border-b border-default-medium bg-neutral-secondary-medium text-sm text-body">
                                <tr>
                                    <th className="px-6 py-3 font-medium">No</th>
                                    <th className="px-6 py-3 font-medium">Title</th>
                                    <th className="px-6 py-3 font-medium">Description</th>
                                    <th className="px-6 py-3 font-medium">Required</th>
                                    <th className="px-6 py-3 font-medium">Min / Max</th>
                                    <th className="px-6 py-3 font-medium">Options</th>
                                    <th className="px-6 py-3 font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-10 text-center text-sm text-body"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((addOn, index) => {
                                        const options = addOn.add_on_options ?? [];
                                        const activeOptions = options.filter((option) => {
                                            if (!("is_active" in option)) return true;
                                            return Boolean(
                                                (option as AddOnOption & {
                                                    is_active?: boolean;
                                                }).is_active
                                            );
                                        });
                                        const isExpanded = expandedRows.includes(addOn.id);

                                        return (
                                            <>
                                                <tr
                                                    key={addOn.id}
                                                    className="border-b border-default bg-white align-top hover:bg-neutral-secondary-medium/40"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-heading">
                                                        {(pagination.current_page - 1) *
                                                            // pagination.limit +
                                                            index +
                                                            1}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <p className="font-semibold text-heading">
                                                                {addOn.title}
                                                            </p>
                                                            {options.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Badge color="info">
                                                                        {options.length} option
                                                                    </Badge>
                                                                    <Badge color="success">
                                                                        {activeOptions.length} active
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <p className="max-w-md text-sm text-body">
                                                            {addOn.description || "-"}
                                                        </p>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {addOn.is_required ? (
                                                            <Badge color="failure">
                                                                Required
                                                            </Badge>
                                                        ) : (
                                                            <Badge color="gray">
                                                                Optional
                                                            </Badge>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-heading">
                                                        {addOn.min_select} / {addOn.max_select}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {options.length > 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleExpandRow(addOn.id)
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-lg border border-default px-3 py-2 text-sm font-medium text-heading transition hover:bg-neutral-secondary-medium"
                                                            >
                                                                <span>
                                                                    {isExpanded
                                                                        ? "Sembunyikan"
                                                                        : "Lihat"}{" "}
                                                                    option
                                                                </span>
                                                                <svg
                                                                    className={`h-4 w-4 transition-transform ${isExpanded
                                                                        ? "rotate-180"
                                                                        : ""
                                                                        }`}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={2}
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M19 9l-7 7-7-7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        ) : (
                                                            <span className="text-sm text-body">
                                                                Belum ada option
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                openAddOptionModal(
                                                                    addOn.id,
                                                                    addOn.add_on_options?.[0]
                                                                        ?.type ?? "radio"
                                                                )
                                                            }
                                                        >
                                                            Tambah Option
                                                        </Button>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr
                                                        key={`${addOn.id}-expanded`}
                                                        className="border-b border-default bg-neutral-primary-soft"
                                                    >
                                                        <td colSpan={7} className="px-6 py-4">
                                                            <div className="rounded-xl border border-default bg-white p-4">
                                                                <div className="mb-4 flex items-center justify-between">
                                                                    <div>
                                                                        <h3 className="text-sm font-semibold text-heading">
                                                                            Option List
                                                                        </h3>
                                                                        <p className="text-sm text-body">
                                                                            {addOn.title}
                                                                        </p>
                                                                    </div>

                                                                    <Button
                                                                        size="xs"
                                                                        onClick={() =>
                                                                            openAddOptionModal(
                                                                                addOn.id,
                                                                                addOn
                                                                                    .add_on_options?.[0]
                                                                                    ?.type ?? "radio"
                                                                            )
                                                                        }
                                                                    >
                                                                        Tambah Option
                                                                    </Button>
                                                                </div>

                                                                <div className="overflow-hidden rounded-lg border border-default">
                                                                    <table className="w-full text-left text-sm">
                                                                        <thead className="bg-neutral-secondary-medium text-body">
                                                                            <tr>
                                                                                <th className="px-4 py-3 font-medium">
                                                                                    Nama Option
                                                                                </th>
                                                                                <th className="px-4 py-3 font-medium">
                                                                                    Type
                                                                                </th>
                                                                                <th className="px-4 py-3 font-medium">
                                                                                    Status
                                                                                </th>
                                                                                <th className="px-4 py-3 font-medium">
                                                                                    Harga
                                                                                </th>
                                                                                <th className="px-4 py-3 font-medium text-right">
                                                                                    Action
                                                                                </th>
                                                                            </tr>
                                                                        </thead>

                                                                        <tbody>
                                                                            {options.map((option) => {
                                                                                const isActive =
                                                                                    "is_active" in
                                                                                        option
                                                                                        ? Boolean(
                                                                                            (
                                                                                                option as AddOnOption & {
                                                                                                    is_active?: boolean;
                                                                                                }
                                                                                            )
                                                                                                .is_active
                                                                                        )
                                                                                        : true;

                                                                                return (
                                                                                    <tr
                                                                                        key={
                                                                                            option.id
                                                                                        }
                                                                                        className="border-t border-default bg-white"
                                                                                    >
                                                                                        <td className="px-4 py-3 font-medium text-heading">
                                                                                            {option.name}
                                                                                        </td>

                                                                                        <td className="px-4 py-3">
                                                                                            <Badge color="info">
                                                                                                {
                                                                                                    option.type
                                                                                                }
                                                                                            </Badge>
                                                                                        </td>

                                                                                        <td className="px-4 py-3">
                                                                                            {isActive ? (
                                                                                                <Badge color="success">
                                                                                                    Active
                                                                                                </Badge>
                                                                                            ) : (
                                                                                                <Badge color="failure">
                                                                                                    Inactive
                                                                                                </Badge>
                                                                                            )}
                                                                                        </td>

                                                                                        <td className="px-4 py-3 text-heading">
                                                                                            Rp{" "}
                                                                                            {option.price.toLocaleString(
                                                                                                "id-ID"
                                                                                            )}
                                                                                        </td>

                                                                                        <td className="px-4 py-3">
                                                                                            <div className="flex items-center justify-end gap-2">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        openEditOptionModal(
                                                                                                            addOn.id,
                                                                                                            option
                                                                                                        )
                                                                                                    }
                                                                                                    className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                                                    disabled={
                                                                                                        actionLoading
                                                                                                    }
                                                                                                >
                                                                                                    Edit
                                                                                                </button>

                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        handleDeleteOption(
                                                                                                            option.id
                                                                                                        )
                                                                                                    }
                                                                                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                                                    disabled={
                                                                                                        actionLoading
                                                                                                    }
                                                                                                >
                                                                                                    Hapus
                                                                                                </button>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
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
                                            colSpan={7}
                                            className="px-6 py-10 text-center text-sm text-body"
                                        >
                                            Data add on tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                        <span className="block text-sm font-normal text-body">
                            Showing{" "}
                            <span className="font-semibold text-heading">
                                {filteredData.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-heading">
                                {pagination.total}
                            </span>
                        </span>

                        {!search.trim() && pagination.pages > 1 && (
                            <Pagination
                                currentPage={pagination.current_page}
                                totalPages={pagination.pages}
                                onPageChange={setCurrentPage}
                                showIcons
                            />
                        )}
                    </div>
                </div>
            </div>

            <Modal dismissible show={openModal} size="lg" onClose={closeModal}>
                <ModalHeader>
                    {isEditMode ? "Edit Option" : "Tambah Option"}{" "}
                    {selectedAddOn ? `- ${selectedAddOn.title}` : ""}
                </ModalHeader>

                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="option-name">Nama Option</Label>
                            </div>
                            <TextInput
                                id="option-name"
                                placeholder="Masukkan nama option"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="option-price">Harga</Label>
                            </div>
                            <TextInput
                                id="option-price"
                                type="number"
                                placeholder="Masukkan harga"
                                value={form.price}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        price: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="option-type">Type</Label>
                            </div>
                            <Select
                                id="option-type"
                                value={form.type}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        type: e.target.value as AddOnType,
                                    }))
                                }
                            >
                                <option value="radio">radio</option>
                                <option value="checkbox">checkbox</option>
                            </Select>
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="option-active">Status</Label>
                            </div>
                            <Select
                                id="option-active"
                                value={String(form.is_active)}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        is_active: e.target.value === "true",
                                    }))
                                }
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </Select>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={!form.name.trim() || actionLoading}
                    >
                        {actionLoading
                            ? "Menyimpan..."
                            : isEditMode
                                ? "Update Option"
                                : "Simpan Option"}
                    </Button>

                    <Button color="gray" onClick={closeModal} disabled={actionLoading}>
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AddOnPage;