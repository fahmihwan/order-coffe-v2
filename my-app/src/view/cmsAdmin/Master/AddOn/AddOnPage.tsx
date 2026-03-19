import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Pagination,
    TextInput,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { getMasterAddOn } from "../../../../redux/features/addOnSlice";
import { formatRupiah } from "../../../../utils/cartUtils";
import type { AddOn, AddOnType } from "../../../../types/addOn";

type AddOnForm = {
    id: string;
    title: string;
    description: string;
    type: AddOnType;
    isRequired: boolean;
    options: {
        id: string;
        name: string;
        price: string;
    }[];
};

const initialForm: AddOnForm = {
    id: "",
    title: "",
    description: "",
    type: "radio",
    isRequired: false,
    options: [
        {
            id: "",
            name: "",
            price: "0",
        },
    ],
};

const AddOnPage = () => {
    const dispatch = useAppDispatch();
    const masterAddOn = useAppSelector((state) => state.addOn.masterAddOn) as AddOn[];

    const [currentPage, setCurrentPage] = useState(1);
    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [localData, setLocalData] = useState<AddOn[]>([]);
    const [form, setForm] = useState<AddOnForm>(initialForm);

    useEffect(() => {
        dispatch(getMasterAddOn());
    }, [dispatch]);

    const onPageChange = (page: number) => setCurrentPage(page);

    const sourceData = localData.length > 0 ? localData : masterAddOn;

    const filteredData = useMemo(() => {
        return sourceData.filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [sourceData, search]);

    const resetForm = () => {
        setForm(initialForm);
        setSelectedIndex(null);
        setModalMode("add");
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    const openAddModal = () => {
        resetForm();
        setModalMode("add");
        setOpenModal(true);
    };

    const openEditModal = (item: AddOn, index: number) => {
        setModalMode("edit");
        setSelectedIndex(index);

        const optionType: AddOnType = item.options?.[0]?.type ?? "radio";

        setForm({
            id: String(item.id),
            title: item.title,
            description: item.description,
            type: optionType,
            isRequired: item.isRequired,
            options: item.options.map((opt) => ({
                id: String(opt.id),
                name: opt.name,
                price: String(opt.price),
            })),
        });

        setOpenModal(true);
    };

    const handleChangeForm = (
        key: keyof Omit<AddOnForm, "options">,
        value: string | boolean
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleOptionChange = (
        index: number,
        key: "id" | "name" | "price",
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            options: prev.options.map((opt, i) =>
                i === index ? { ...opt, [key]: value } : opt
            ),
        }));
    };

    const handleAddOption = () => {
        setForm((prev) => ({
            ...prev,
            options: [
                ...prev.options,
                {
                    id: "",
                    name: "",
                    price: "0",
                },
            ],
        }));
    };

    const handleRemoveOption = (index: number) => {
        setForm((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = () => {
        if (!form.id || !form.title || !form.description) {
            alert("ID, title, dan description wajib diisi.");
            return;
        }

        if (form.options.length === 0) {
            alert("Minimal harus ada 1 option.");
            return;
        }

        const hasEmptyOption = form.options.some(
            (opt) => !opt.id || !opt.name || opt.price === ""
        );

        if (hasEmptyOption) {
            alert("Semua field option wajib diisi.");
            return;
        }

        const payload: AddOn = {
            id: Number(form.id),
            title: form.title,
            description: form.description,
            isRequired: form.isRequired,
            options: form.options.map((opt) => ({
                id: Number(opt.id),
                name: opt.name,
                price: Number(opt.price),
                add_on_id: Number(form.id),
                type: form.type,
            })),
        };

        if (modalMode === "add") {
            setLocalData((prev) => [...prev, payload]);
        } else {
            setLocalData((prev) => {
                const base = prev.length > 0 ? prev : masterAddOn;
                return base.map((item, index) =>
                    index === selectedIndex ? payload : item
                );
            });
        }

        closeModal();
    };

    const handleDelete = (index: number) => {
        setLocalData((prev) => {
            const base = prev.length > 0 ? prev : masterAddOn;
            return base.filter((_, i) => i !== index);
        });
    };

    return (
        <div className="p-5">
            <div className="mb-5 flex justify-between">
                <h1 className="text-2xl font-bold">Master AddOn</h1>
                <Button onClick={openAddModal}>Tambah Data</Button>
            </div>

            <div className="block rounded-base border border-default bg-white p-6 shadow-xs">
                <div className="relative overflow-x-auto rounded-base border border-default bg-neutral-primary-soft shadow-xs">
                    <div className="flex flex-column flex-wrap items-center justify-between space-y-4 p-4 md:flex-row md:space-y-0">
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
                                className="block w-full max-w-96 rounded-base border border-default-medium bg-neutral-secondary-medium ps-9 pe-3 py-2 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
                                placeholder="Search add on"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm text-body rtl:text-right">
                        <thead className="border-b border-t border-default-medium bg-neutral-secondary-medium text-sm text-body">
                            <tr>
                                <th className="px-6 py-3 font-medium">No</th>
                                <th className="px-6 py-3 font-medium">Title</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium">Options</th>
                                <th className="px-6 py-3 font-medium">Wajib di isi</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((d, i) => (
                                <tr
                                    key={`${d.id}-${i}`}
                                    className="border-b border-default bg-neutral-primary-soft hover:bg-neutral-secondary-medium"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-heading">
                                        {i + 1}
                                    </td>
                                    <td className="px-6 py-4">{d.title}</td>
                                    <td className="px-6 py-4">{d.description}</td>

                                    <td className="w-[500px] px-6 py-4">
                                        {d.options?.map((opt, j) => (
                                            <div className="mb-2 flex justify-between gap-4" key={j}>
                                                {opt.type === "radio" ? (
                                                    <div className="flex items-center">
                                                        <input
                                                            disabled
                                                            type="radio"
                                                            name={`radio-${d.id}`}
                                                            className="h-4 w-4 appearance-none rounded-full border border-default-medium bg-neutral-secondary-medium checked:border-brand focus:outline-none focus:ring-2 focus:ring-brand-subtle"
                                                        />
                                                        <label className="ms-2 select-none text-lg font-medium text-heading">
                                                            {opt.name}
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <input
                                                            disabled
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded-xs border border-default-medium bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
                                                        />
                                                        <label className="ms-2 select-none text-lg font-medium text-heading">
                                                            {opt.name}
                                                        </label>
                                                    </div>
                                                )}

                                                <span className="text-lg">
                                                    + {formatRupiah(opt.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </td>

                                    <td className="px-6 py-4">{d.isRequired ? "Ya" : "Tidak"}</td>

                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(d, i)}
                                            className="font-medium text-fg-brand hover:underline"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(i)}
                                            className="ml-5 font-medium text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredData.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
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
                                {filteredData.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-heading">
                                {sourceData.length}
                            </span>
                        </span>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={1}
                            onPageChange={onPageChange}
                            showIcons
                        />
                    </div>
                </div>
            </div>

            <Modal dismissible show={openModal} size="4xl" onClose={closeModal}>
                <ModalHeader>
                    {modalMode === "add" ? "Tambah Add On" : "Edit Add On"}
                </ModalHeader>

                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="id">ID</Label>
                            <TextInput
                                id="id"
                                type="number"
                                value={form.id}
                                onChange={(e) => handleChangeForm("id", e.target.value)}
                                placeholder="Masukkan id"
                            />
                        </div>
                        <div className="w-full flex">
                            <div className="w-1/2 mr-5">
                                <Label htmlFor="title">Title</Label>
                                <TextInput
                                    id="title"
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => handleChangeForm("title", e.target.value)}
                                    placeholder="Masukkan title"
                                />
                            </div>
                            <div className="w-1/2">
                                <Label htmlFor="description">Description</Label>
                                <TextInput
                                    id="description"
                                    type="text"
                                    value={form.description}
                                    onChange={(e) =>
                                        handleChangeForm("description", e.target.value)
                                    }
                                    placeholder="Masukkan description"
                                />
                            </div>
                        </div>

                        <div className="w-full flex items-center">
                            <div className="w-1/2 mr-5">
                                <Label htmlFor="type">Type <span className="text-gray-400">(Type ini akan diterapkan ke semua option)</span></Label>
                                <select
                                    id="type"
                                    value={form.type}
                                    onChange={(e) =>
                                        handleChangeForm("type", e.target.value as AddOnType)
                                    }
                                    className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                >
                                    <option value="radio">radio</option>
                                    <option value="checkbox">checkbox</option>
                                </select>

                            </div>
                            <div className="w-1/2">
                                <div className="flex items-center ">
                                    <input
                                        className="mr-2"
                                        id="isRequired"
                                        type="checkbox"
                                        checked={form.isRequired}
                                        onChange={(e) =>
                                            handleChangeForm("isRequired", e.target.checked)
                                        }
                                    />
                                    <Label htmlFor="isRequired">Wajib di isi</Label>
                                </div>
                            </div>

                        </div>



                        <div className="mt-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Options</h2>
                                <Button size="sm" onClick={handleAddOption}>
                                    Tambah Option
                                </Button>
                            </div>

                            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                Semua option di bawah ini otomatis bertipe <b>{form.type}</b>.
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">No</th>
                                            <th className="px-4 py-3 font-medium">Option ID</th>
                                            <th className="px-4 py-3 font-medium">Option Name</th>
                                            <th className="px-4 py-3 font-medium">Price</th>
                                            <th className="px-4 py-3 font-medium text-center">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {form.options.length > 0 ? (
                                            form.options.map((opt, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-4 py-3">{index + 1}</td>

                                                    <td className="min-w-[120px] px-4 py-3">
                                                        <TextInput
                                                            type="number"
                                                            value={opt.id}
                                                            onChange={(e) =>
                                                                handleOptionChange(index, "id", e.target.value)
                                                            }
                                                            placeholder="ID"
                                                        />
                                                    </td>

                                                    <td className="min-w-[220px] px-4 py-3">
                                                        <TextInput
                                                            type="text"
                                                            value={opt.name}
                                                            onChange={(e) =>
                                                                handleOptionChange(index, "name", e.target.value)
                                                            }
                                                            placeholder="Nama option"
                                                        />
                                                    </td>

                                                    <td className="min-w-[180px] px-4 py-3">
                                                        <TextInput
                                                            type="number"
                                                            value={opt.price}
                                                            onChange={(e) =>
                                                                handleOptionChange(index, "price", e.target.value)
                                                            }
                                                            placeholder="Harga"
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            color="failure"
                                                            size="xs"
                                                            onClick={() => handleRemoveOption(index)}
                                                            disabled={form.options.length === 1}
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                                    Belum ada option.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={handleSubmit}>
                        {modalMode === "add" ? "Simpan" : "Update"}
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