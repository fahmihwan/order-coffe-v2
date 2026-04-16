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
import { useEffect, useState } from "react";
import type { Category, CreateCategoryPayload } from "../../../../types/category";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import {
    createCategory,
    deleteCategory,
    getMasterCategory,
    updateCategory,
} from "../../../../redux/features/categorySlice";


const LIMIT = 5;

const CategoryPage = () => {
    const dispatch = useAppDispatch();
    const { masterCategories, status, error, pagination } = useAppSelector(
        (state) => state.category
    );;

    const [currentPage, setCurrentPage] = useState(1);
    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState<CreateCategoryPayload>({
        category_name: "",
    });

    useEffect(() => {
        dispatch(getMasterCategory({ page: currentPage, limit: LIMIT }));
    }, [dispatch, currentPage]);

    const resetForm = () => {
        setForm({
            category_name: "",
        });
        setSelectedCategory(null);
        setModalMode("add");
    };

    const openAddModal = () => {
        resetForm();
        setModalMode("add");
        setOpenModal(true);
    };

    const openEditModal = (item: Category) => {
        setModalMode("edit");
        setSelectedCategory(item);
        setForm({
            category_name: item.category_name ?? "",
        })
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    const handleSubmit = async () => {
        try {
            if (!form.category_name.trim()) return;

            if (modalMode === "add") {
                await dispatch(
                    createCategory({
                        category_name: form.category_name,
                    })
                ).unwrap();
            } else if (selectedCategory) {
                await dispatch(
                    updateCategory({
                        id: selectedCategory.id,
                        data: {
                            category_name: form.category_name,
                        },
                    })
                ).unwrap();
            }

            await dispatch(getMasterCategory({ page: currentPage, limit: LIMIT }));
            closeModal();
        } catch (err) {
            console.error("Submit category failed:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await dispatch(deleteCategory(id)).unwrap();
            await dispatch(getMasterCategory({ page: currentPage, limit: LIMIT }));
        } catch (err) {
            console.error("Delete category failed:", err);
        }
    };

    const filteredData = masterCategories.filter((item) =>
        item.category_name.toLowerCase().includes(search.toLowerCase())
    );

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

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

                    {error && (
                        <div className="px-4 pb-2 text-sm text-red-600">{error}</div>
                    )}

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
                            {filteredData.length > 0 ? (
                                filteredData.map((d, i) => (
                                    <tr
                                        key={d.id}
                                        className="border-b border-default bg-neutral-primary-soft hover:bg-neutral-secondary-medium"
                                    >
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-6 py-4 text-heading"
                                        >
                                            {((pagination?.currentPage ?? 1) - 1) * LIMIT + i + 1}
                                        </th>

                                        <td className="px-6 py-4">{d.category_name}</td>

                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(d)}
                                                className="font-medium text-fg-brand hover:underline"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(d.id)}
                                                className="ml-5 font-medium text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-6 text-center text-sm text-body"
                                    >
                                        {status === "loading"
                                            ? "Loading data..."
                                            : "Data category tidak ditemukan."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex items-center overflow-x-auto p-5 sm:justify-between">
                        <span className="mb-4 block w-full text-sm font-normal text-body md:mb-0 md:inline md:w-auto">
                            Showing{" "}
                            <span className="font-semibold text-heading">
                                {pagination?.from ?? 0}-{pagination?.to ?? 0}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-heading">
                                {pagination?.total ?? 0}
                            </span>
                        </span>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={pagination?.pages ?? 1}
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
                        {modalMode === "edit" && selectedCategory && (
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="id">ID</Label>
                                </div>
                                <TextInput
                                    id="id"
                                    type="text"
                                    value={selectedCategory.id}
                                    disabled
                                />
                            </div>
                        )}

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