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
import type { Category } from "../../../../types/category";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { getMasterCategory } from "../../../../redux/features/categorySlice";

type CategoryForm = {
    id: string;
    category_name: string;
};

const initialForm: CategoryForm = {
    id: "",
    category_name: "",
};

const CategoryPage = () => {
    const dispatch = useAppDispatch();
    const masterCategories = useAppSelector((state) => state.category.masterCategories);


    const [currentPage, setCurrentPage] = useState(1);
    const onPageChange = (page: number) => setCurrentPage(page);

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const [search, setSearch] = useState("");
    const [data, setData] = useState<Category[]>([]);
    const [form, setForm] = useState<CategoryForm>(initialForm);


    useEffect(() => {
        dispatch(getMasterCategory());
    }, [dispatch]);

    const resetForm = () => {
        setForm(initialForm);
        setSelectedIndex(null);
        setModalMode("add");
    };

    const openAddModal = () => {
        resetForm();
        setModalMode("add");
        setOpenModal(true);
    };

    const openEditModal = (item: Category, index: number) => {
        setModalMode("edit");
        setSelectedIndex(index);

        setForm({
            id: String(item.id ?? ""),
            category_name: item.category_name ?? "",
        });

        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    const handleSubmit = () => {
        const payload: Category = {
            id: Number(form.id),
            category_name: form.category_name,
        };

        if (modalMode === "add") {
            setData((prev) => [...prev, payload]);
        } else {
            setData((prev) =>
                prev.map((item, index) =>
                    index === selectedIndex ? { ...item, ...payload } : item
                )
            );
        }

        closeModal();
    };

    const handleDelete = (index: number) => {
        setData((prev) => prev.filter((_, i) => i !== index));
    };

    const filteredData = useMemo(() => {
        return data.filter((item) =>
            item.category_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);


    // sementara gabungkan data lokal + masterCategories
    const tableData = data.length > 0 ? data : masterCategories;
    return (
        <div className="p-5">
            <div className="mb-5 flex justify-between">
                <h1 className="text-2xl font-bold">Master Category</h1>

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
                                placeholder="Search category"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm text-body rtl:text-right">
                        <thead className="border-b border-t border-default-medium bg-neutral-secondary-medium text-sm text-body">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    No
                                </th>

                                <th scope="col" className="px-6 py-3 font-medium">
                                    Category Name
                                </th>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {tableData?.map((d: Menu, i: number) => (
                                <tr
                                    key={`${d.id}-${i}`}
                                    className="border-b border-default bg-neutral-primary-soft hover:bg-neutral-secondary-medium"
                                >
                                    <th
                                        scope="row"
                                        className="whitespace-nowrap px-6 py-4 text-heading"
                                    >
                                        {i + 1}
                                    </th>



                                    <td className="px-6 py-4">{d.category_name}</td>

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
                                        colSpan={4}
                                        className="px-6 py-6 text-center text-sm text-body"
                                    >
                                        Data category tidak ditemukan.
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
                                {data.length}
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

            <Modal dismissible show={openModal} size="lg" onClose={closeModal}>
                <ModalHeader>
                    {modalMode === "add" ? "Tambah Category" : "Edit Category"}
                </ModalHeader>

                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="id">ID</Label>
                            </div>
                            <TextInput
                                id="id"
                                type="number"
                                value={form.id}
                                onChange={(e) =>
                                    setForm({ ...form, id: e.target.value })
                                }
                                placeholder="Masukkan id"
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="category_name">Nama Category</Label>
                            </div>
                            <TextInput
                                id="category_name"
                                type="text"
                                value={form.category_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category_name: e.target.value,
                                    })
                                }
                                placeholder="Masukkan nama category"
                            />
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

export default CategoryPage;