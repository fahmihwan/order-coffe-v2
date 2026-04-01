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
import { useMemo, useState } from "react";

type AddOnOptionType = "radio" | "checkbox";

type AddOnOptionRequest = {
    name: string;
    price: number;
    is_active: boolean;
    type: AddOnOptionType;
};

type AddOnGroupRequest = {
    title: string;
    description: string | null;
    is_required: boolean;
    min_select: number;
    max_select: number;
    add_on_options?: AddOnOptionRequest[];
};

type AddOptionForm = {
    name: string;
    price: string;
    is_active: boolean;
    type: AddOnOptionType;
};

const dummyAddOns: AddOnGroupRequest[] = [
    {
        title: "Hot or Ice *",
        description: "Pilih jenis",
        is_required: true,
        min_select: 1,
        max_select: 1,
        add_on_options: [
            {
                name: "Hot",
                price: 0,
                is_active: true,
                type: "radio",
            },
            {
                name: "Ice",
                price: 100,
                is_active: true,
                type: "radio",
            },
        ],
    },
    {
        title: "Additional syrup *",
        description: "Pilih hingga 3 opsi",
        is_required: false,
        min_select: 0,
        max_select: 3,
        add_on_options: [
            {
                name: "Vanilla",
                price: 8000,
                is_active: true,
                type: "checkbox",
            },
            {
                name: "Huzzlent",
                price: 8000,
                is_active: true,
                type: "checkbox",
            },
            {
                name: "Caramel",
                price: 8000,
                is_active: false,
                type: "checkbox",
            },
            {
                name: "Sugar",
                price: 0,
                is_active: true,
                type: "checkbox",
            },
        ],
    },
    {
        title: "Cup Size",
        description: "Pilih ukuran cup",
        is_required: true,
        min_select: 1,
        max_select: 1,
        add_on_options: [
            {
                name: "Regular",
                price: 0,
                is_active: true,
                type: "radio",
            },
            {
                name: "Large",
                price: 4000,
                is_active: true,
                type: "radio",
            },
        ],
    },
];

const ITEMS_PER_PAGE = 10;

const initialForm: AddOptionForm = {
    name: "",
    price: "",
    is_active: true,
    type: "radio",
};

const AddOnPage = () => {
    const [addOns, setAddOns] = useState<AddOnGroupRequest[]>(dummyAddOns);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [openModal, setOpenModal] = useState(false);
    const [selectedAddOnIndex, setSelectedAddOnIndex] = useState<number | null>(null);
    const [form, setForm] = useState<AddOptionForm>(initialForm);

    const selectedAddOn = useMemo(() => {
        if (selectedAddOnIndex === null) return null;
        return addOns[selectedAddOnIndex] ?? null;
    }, [addOns, selectedAddOnIndex]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return addOns;

        return addOns.filter((item) => {
            const matchTitle = item.title.toLowerCase().includes(keyword);
            const matchDescription = (item.description ?? "")
                .toLowerCase()
                .includes(keyword);

            const matchOption = (item.add_on_options ?? []).some((option) =>
                option.name.toLowerCase().includes(keyword)
            );

            return matchTitle || matchDescription || matchOption;
        });
    }, [addOns, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / ITEMS_PER_PAGE)
    );

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const resetForm = () => {
        setForm(initialForm);
        setSelectedAddOnIndex(null);
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    const openAddOptionModal = (groupIndex: number) => {
        const selectedGroup = addOns[groupIndex];

        setSelectedAddOnIndex(groupIndex);
        setForm({
            name: "",
            price: "",
            is_active: true,
            type: selectedGroup?.add_on_options?.[0]?.type ?? "radio",
        });
        setOpenModal(true);
    };

    const handleSubmit = () => {
        if (selectedAddOnIndex === null || !form.name.trim()) return;

        const newOption: AddOnOptionRequest = {
            name: form.name.trim(),
            price: Number(form.price) || 0,
            is_active: form.is_active,
            type: form.type,
        };

        setAddOns((prev) =>
            prev.map((item, index) =>
                index === selectedAddOnIndex
                    ? {
                        ...item,
                        add_on_options: [...(item.add_on_options ?? []), newOption],
                    }
                    : item
            )
        );

        closeModal();
    };

    const handleDeleteOption = (groupIndex: number, optionIndex: number) => {
        setAddOns((prev) =>
            prev.map((item, index) =>
                index === groupIndex
                    ? {
                        ...item,
                        add_on_options: (item.add_on_options ?? []).filter(
                            (_, optIndex) => optIndex !== optionIndex
                        ),
                    }
                    : item
            )
        );
    };

    return (
        <div className="p-5">
            <div className="mb-5 flex justify-between">
                <h1 className="text-2xl font-bold">Add On Page</h1>
            </div>

            <div className="block rounded-base border border-default bg-white p-6 shadow-xs">
                <div className="relative overflow-x-auto rounded-base border border-default bg-neutral-primary-soft shadow-xs">
                    <div className="flex flex-column flex-wrap items-center justify-between space-y-4 p-4 md:flex-row md:space-y-0">
                        <label htmlFor="search-addon" className="sr-only">
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
                                id="search-addon"
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full max-w-96 rounded-base border border-default-medium bg-neutral-secondary-medium ps-9 pe-3 py-2 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
                                placeholder="Search add on / option"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm text-body rtl:text-right">
                        <thead className="border-b border-t border-default-medium bg-neutral-secondary-medium text-sm text-body">
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
                            {paginatedData.length > 0 ? (
                                paginatedData.map((addOn, index) => {
                                    const originalIndex = addOns.findIndex((item) => item === addOn);

                                    return (
                                        <tr
                                            key={`${addOn.title}-${index}`}
                                            className="border-b border-default bg-neutral-primary-soft align-top hover:bg-neutral-secondary-medium"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-heading">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-heading">
                                                {addOn.title}
                                            </td>

                                            <td className="px-6 py-4">
                                                {addOn.description ?? "-"}
                                            </td>

                                            <td className="px-6 py-4">
                                                {addOn.is_required ? (
                                                    <Badge color="failure">Required</Badge>
                                                ) : (
                                                    <Badge color="gray">Optional</Badge>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {addOn.min_select} / {addOn.max_select}
                                            </td>

                                            <td className="px-6 py-4">
                                                {(addOn.add_on_options ?? []).length > 0 ? (
                                                    <div className="space-y-3">
                                                        {(addOn.add_on_options ?? []).map((option, optionIndex) => (
                                                            <div
                                                                key={`${option.name}-${optionIndex}`}
                                                                className="flex items-center justify-between rounded-lg border border-default p-3"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-heading">
                                                                        {option.name}
                                                                    </p>

                                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                                        <Badge color="info">{option.type}</Badge>
                                                                        {option.is_active ? (
                                                                            <Badge color="success">Active</Badge>
                                                                        ) : (
                                                                            <Badge color="failure">Inactive</Badge>
                                                                        )}
                                                                    </div>

                                                                    <p className="mt-2 text-sm text-body">
                                                                        Rp {option.price.toLocaleString("id-ID")}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteOption(originalIndex, optionIndex)
                                                                    }
                                                                    className="font-medium text-red-600 hover:underline"
                                                                >
                                                                    Hapus Option
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-body">
                                                        Belum ada option.
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openAddOptionModal(originalIndex)}
                                                >
                                                    Tambah Option
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-6 text-center text-sm text-body"
                                    >
                                        Data add on tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex items-center overflow-x-auto p-5 sm:justify-between">
                        <span className="mb-4 block w-full text-sm font-normal text-body md:mb-0 md:inline md:w-auto">
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
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            showIcons
                        />
                    </div>
                </div>
            </div>

            <Modal dismissible show={openModal} size="lg" onClose={closeModal}>
                <ModalHeader>
                    Tambah Option {selectedAddOn ? `- ${selectedAddOn.title}` : ""}
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
                                    setForm((prev) => ({ ...prev, name: e.target.value }))
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
                                    setForm((prev) => ({ ...prev, price: e.target.value }))
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
                                        type: e.target.value as AddOnOptionType,
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
                    <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                        Simpan Option
                    </Button>

                    <Button color="gray" onClick={closeModal}>
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AddOnPage;