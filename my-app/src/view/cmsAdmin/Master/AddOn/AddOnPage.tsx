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
    Textarea,
} from "flowbite-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../../../redux/store";
import {
    createAddOnGroup,
    createAddOnOption,
    deleteAddOnOption,
    getMasterAddOn,
    setMessage,
    updateAddOnGroup,
    updateAddOnOption,
} from "../../../../redux/features/addOnSlice";
import type {
    AddOnGroup,
    AddOnGroupPayload,
    AddOnOption,
    AddOnOptionPayload,
    AddOnType,
} from "../../../../types/addOn";

const initialForm: AddOnOptionPayload = {
    name: "",
    price: 0,
    add_on_group_id: "",
    is_active: true,
    type: "radio",
};

const initialGroupForm: AddOnGroupPayload = {
    title: "",
    description: "",
    is_required: false,
    min_select: 0,
    max_select: 1,
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
    const [openGroupModal, setOpenGroupModal] = useState(false);

    const [selectedAddOnId, setSelectedAddOnId] = useState<string | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditGroupMode, setIsEditGroupMode] = useState(false);

    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const [form, setForm] = useState<AddOnOptionPayload>(initialForm);
    const [groupForm, setGroupForm] =
        useState<AddOnGroupPayload>(initialGroupForm);

    const currentPaginationPage = pagination?.current_page ?? 1;
    const totalPaginationPages = pagination?.pages ?? 1;
    const totalPaginationItems = pagination?.total ?? masterAddOns.length;

    useEffect(() => {
        dispatch(getMasterAddOn({ page: currentPage }));
    }, [dispatch, currentPage]);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            dispatch(setMessage(""));
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, dispatch]);

    const selectedAddOn = useMemo<AddOnGroup | null>(() => {
        if (!selectedAddOnId) return null;

        return (
            masterAddOns.find(
                (item: AddOnGroup) => item.id === selectedAddOnId
            ) ?? null
        );
    }, [masterAddOns, selectedAddOnId]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return masterAddOns;

        return masterAddOns.filter((item: AddOnGroup) => {
            const matchTitle = item.title.toLowerCase().includes(keyword);
            const matchDescription = item.description
                .toLowerCase()
                .includes(keyword);

            const matchOption = item.add_on_options.some((option) =>
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

    const resetGroupForm = () => {
        setGroupForm(initialGroupForm);
        setSelectedAddOnId(null);
        setIsEditGroupMode(false);
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    const closeGroupModal = () => {
        setOpenGroupModal(false);
        resetGroupForm();
    };

    const toggleExpandRow = (id: string) => {
        setExpandedRows((prev) =>
            prev.includes(id)
                ? prev.filter((rowId) => rowId !== id)
                : [...prev, id]
        );
    };

    const openCreateGroupModal = () => {
        setIsEditGroupMode(false);
        setSelectedAddOnId(null);
        setGroupForm(initialGroupForm);
        setOpenGroupModal(true);
    };

    const openEditGroupModal = (addOn: AddOnGroup) => {
        setIsEditGroupMode(true);
        setSelectedAddOnId(addOn.id);
        setGroupForm({
            title: addOn.title,
            description: addOn.description,
            is_required: addOn.is_required,
            min_select: addOn.min_select,
            max_select: addOn.max_select,
            type: addOn.type,
        });
        setOpenGroupModal(true);
    };

    const openAddOptionModal = (addOn: AddOnGroup) => {
        setIsEditMode(false);
        setSelectedAddOnId(addOn.id);
        setSelectedOptionId(null);
        setForm({
            name: "",
            price: 0,
            add_on_group_id: addOn.id,
            is_active: true,
            type: addOn.type,
        });
        setOpenModal(true);
    };

    const openEditOptionModal = (addOn: AddOnGroup, option: AddOnOption) => {
        setIsEditMode(true);
        setSelectedAddOnId(addOn.id);
        setSelectedOptionId(option.id);
        setForm({
            name: option.name,
            price: option.price,
            add_on_group_id: addOn.id,
            is_active: option.is_active,
            type: addOn.type,
        });
        setOpenModal(true);
    };

    const handleSubmitGroup = async () => {
        if (!groupForm.title.trim()) return;

        const payload: AddOnGroupPayload = {
            title: groupForm.title.trim(),
            description: groupForm.description.trim(),
            is_required: groupForm.is_required,
            min_select: Number(groupForm.min_select) || 0,
            max_select: groupForm.type === "radio" ? 1 : Number(groupForm.max_select) || 0,
            type: groupForm.type,
        };

        if (isEditGroupMode && selectedAddOnId) {
            const resultAction = await dispatch(
                updateAddOnGroup({
                    id: selectedAddOnId,
                    payload,
                })
            );

            if (updateAddOnGroup.fulfilled.match(resultAction)) {
                closeGroupModal();
                dispatch(getMasterAddOn({ page: currentPage }));
            }

            return;
        }

        const resultAction = await dispatch(createAddOnGroup(payload));

        if (createAddOnGroup.fulfilled.match(resultAction)) {
            closeGroupModal();
            setCurrentPage(1);
            dispatch(getMasterAddOn({ page: 1 }));
        }
    };

    const handleSubmit = async () => {
        if (!selectedAddOnId || !form.name.trim()) return;

        const addOnGroup = masterAddOns.find(
            (item: AddOnGroup) => item.id === selectedAddOnId
        );

        if (!addOnGroup) return;

        const payload: AddOnOptionPayload = {
            name: form.name.trim(),
            add_on_group_id: selectedAddOnId,
            price: Number(form.price) || 0,
            type: addOnGroup.type,
            is_active: form.is_active,
        };

        if (isEditMode && selectedOptionId) {
            const resultAction = await dispatch(
                updateAddOnOption({
                    id: selectedOptionId,
                    payload,
                })
            );

            if (updateAddOnOption.fulfilled.match(resultAction)) {
                closeModal();
                dispatch(getMasterAddOn({ page: currentPage }));
            }

            return;
        }

        const resultAction = await dispatch(createAddOnOption(payload));

        if (createAddOnOption.fulfilled.match(resultAction)) {
            closeModal();
            dispatch(getMasterAddOn({ page: currentPage }));
        }
    };

    const handleDeleteOption = async (optionId: string) => {
        const resultAction = await dispatch(deleteAddOnOption(optionId));

        if (deleteAddOnOption.fulfilled.match(resultAction)) {
            dispatch(getMasterAddOn({ page: currentPage }));
        }
    };

    return (
        <div className="p-5">
            <div className="mb-5 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-heading">Add On Page</h1>

                <Button onClick={openCreateGroupModal}>
                    Tambah Add On Group
                </Button>
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
                                    <th className="px-6 py-3 font-medium">Type</th>
                                    <th className="px-6 py-3 font-medium">Required</th>
                                    <th className="px-6 py-3 font-medium">Min / Max</th>
                                    <th className="px-6 py-3 font-medium">Options</th>
                                    <th className="px-6 py-3 font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((addOn: AddOnGroup, index: number) => {
                                        const options = addOn.add_on_options ?? [];
                                        const activeOptions = options.filter(
                                            (option) => option.is_active
                                        );
                                        const isExpanded = expandedRows.includes(addOn.id);

                                        return (
                                            <Fragment key={addOn.id}>
                                                <tr className="border-b border-default bg-white align-top hover:bg-neutral-secondary-medium/40">
                                                    <td className="whitespace-nowrap px-6 py-4 text-heading">
                                                        {(currentPaginationPage - 1) *
                                                            filteredData.length +
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
                                                        <Badge color="info">{addOn.type}</Badge>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {addOn.is_required ? (
                                                            <Badge color="failure">Required</Badge>
                                                        ) : (
                                                            <Badge color="gray">Optional</Badge>
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
                                                                {isExpanded
                                                                    ? "Sembunyikan"
                                                                    : "Lihat"}{" "}
                                                                option
                                                            </button>
                                                        ) : (
                                                            <span className="text-sm text-body">
                                                                Belum ada option
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                size="sm"
                                                                color="blue"
                                                                onClick={() =>
                                                                    openEditGroupModal(addOn)
                                                                }
                                                            >
                                                                Edit Group
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    openAddOptionModal(addOn)
                                                                }
                                                            >
                                                                Tambah Option
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr className="border-b border-default bg-neutral-primary-soft">
                                                        <td colSpan={8} className="px-6 py-4">
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
                                                                            openAddOptionModal(addOn)
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
                                                                            {options.map((option) => (
                                                                                <tr
                                                                                    key={option.id}
                                                                                    className="border-t border-default bg-white"
                                                                                >
                                                                                    <td className="px-4 py-3 font-medium text-heading">
                                                                                        {option.name}
                                                                                    </td>

                                                                                    <td className="px-4 py-3">
                                                                                        <Badge color="info">
                                                                                            {option.type}
                                                                                        </Badge>
                                                                                    </td>

                                                                                    <td className="px-4 py-3">
                                                                                        {option.is_active ? (
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
                                                                                                        addOn,
                                                                                                        option
                                                                                                    )
                                                                                                }
                                                                                                className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                                                disabled={actionLoading}
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
                                                                                                disabled={actionLoading}
                                                                                            >
                                                                                                Hapus
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center">
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
                                {totalPaginationItems}
                            </span>
                        </span>

                        {!search.trim() && totalPaginationPages > 1 && (
                            <Pagination
                                currentPage={currentPaginationPage}
                                totalPages={totalPaginationPages}
                                onPageChange={setCurrentPage}
                                showIcons
                            />
                        )}
                    </div>
                </div>
            </div>

            <Modal
                dismissible
                show={openGroupModal}
                size="lg"
                onClose={closeGroupModal}
            >
                <ModalHeader>
                    {isEditGroupMode ? "Edit Add On Group" : "Tambah Add On Group"}
                </ModalHeader>

                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="group-title">Title</Label>
                            </div>
                            <TextInput
                                id="group-title"
                                placeholder="Masukkan title add on group"
                                value={groupForm.title}
                                onChange={(e) =>
                                    setGroupForm((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="group-description">
                                    Description
                                </Label>
                            </div>
                            <Textarea
                                id="group-description"
                                placeholder="Masukkan description"
                                rows={4}
                                value={groupForm.description}
                                onChange={(e) =>
                                    setGroupForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="group-type">Type</Label>
                            </div>
                            <Select
                                id="group-type"
                                value={groupForm.type}
                                onChange={(e) =>
                                    setGroupForm((prev) => ({
                                        ...prev,
                                        type: e.target.value as AddOnType,
                                        max_select:
                                            e.target.value === "radio"
                                                ? 1
                                                : prev.max_select,
                                    }))
                                }
                            >
                                <option value="radio">radio</option>
                                <option value="checkbox">checkbox</option>
                            </Select>
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="group-required">Required</Label>
                            </div>
                            <Select
                                id="group-required"
                                value={String(groupForm.is_required)}
                                onChange={(e) =>
                                    setGroupForm((prev) => ({
                                        ...prev,
                                        is_required: e.target.value === "true",
                                    }))
                                }
                            >
                                <option value="false">Optional</option>
                                <option value="true">Required</option>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="group-min-select">
                                        Min Select
                                    </Label>
                                </div>
                                <TextInput
                                    id="group-min-select"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={groupForm.min_select}
                                    onChange={(e) =>
                                        setGroupForm((prev) => ({
                                            ...prev,
                                            min_select:
                                                Number(e.target.value) || 0,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="group-max-select">
                                        Max Select
                                    </Label>
                                </div>
                                <TextInput
                                    id="group-max-select"
                                    type="number"
                                    min={0}
                                    placeholder="1"
                                    value={groupForm.max_select}
                                    disabled={groupForm.type === "radio"}
                                    onChange={(e) =>
                                        setGroupForm((prev) => ({
                                            ...prev,
                                            max_select:
                                                Number(e.target.value) || 0,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        onClick={handleSubmitGroup}
                        disabled={!groupForm.title.trim() || actionLoading}
                    >
                        {actionLoading
                            ? "Menyimpan..."
                            : isEditGroupMode
                              ? "Update Add On Group"
                              : "Simpan Add On Group"}
                    </Button>

                    <Button
                        color="gray"
                        onClick={closeGroupModal}
                        disabled={actionLoading}
                    >
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>

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
                                        price:
                                            Number(e.target.value) || 0,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="option-type">Type</Label>
                            </div>
                            <Select id="option-type" value={form.type} disabled>
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
                                        is_active:
                                            e.target.value === "true",
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

                    <Button
                        color="gray"
                        onClick={closeModal}
                        disabled={actionLoading}
                    >
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AddOnPage;