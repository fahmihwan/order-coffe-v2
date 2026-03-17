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
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { getMasterMenu } from "../../../../redux/features/menuSlice";
import type { Menu } from "../../../../types/menu";
import { formatRupiah } from "../../../../utils/cartUtils";

type MenuForm = {
    id: string;
    name: string;
    price: string;
    image: File | null;
};

const initialForm: MenuForm = {
    id: "",
    name: "",
    price: "",
    image: null,
};

const MenuPage = () => {
    const dispatch = useAppDispatch();
    const masterMenu = useAppSelector((state) => state.menu.masterMenus);

    const [currentPage, setCurrentPage] = useState(1);
    const onPageChange = (page: number) => setCurrentPage(page);

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const [data, setData] = useState<Menu[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const [form, setForm] = useState<MenuForm>(initialForm);
    const [preview, setPreview] = useState("");

    useEffect(() => {
        dispatch(getMasterMenu());
    }, [dispatch]);

    const resetForm = () => {
        setForm(initialForm);
        setPreview("");
        setSelectedIndex(null);
        setModalMode("add");
    };

    const openAddModal = () => {
        resetForm();
        setModalMode("add");
        setOpenModal(true);
    };

    const openEditModal = (item: Menu, index: number) => {
        setModalMode("edit");
        setSelectedIndex(index);

        setForm({
            id: String(item.id ?? ""),
            name: item.name ?? "",
            price: String(item.price ?? ""),
            image: null,
        });

        setPreview(item.image ?? "");
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setForm((prev) => ({
            ...prev,
            image: file,
        }));

        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
    };

    const handleSubmit = () => {
        const payload = {
            id: Number(form.id),
            name: form.name,
            price: Number(form.price),
            image: preview,
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

    // sementara gabungkan data lokal + masterMenu
    const tableData = data.length > 0 ? data : masterMenu;

    return (
        <div className="p-5">
            <div className="mb-5 flex justify-between">
                <h1 className="text-2xl font-bold">Master Menu</h1>

                <Button onClick={openAddModal}>Tambah Data</Button>
            </div>

            <div className="bg-neutral-primary-soft block rounded-base border border-default bg-white p-6 shadow-xs">
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
                                className="block w-full max-w-96 rounded-base border border-default-medium bg-neutral-secondary-medium ps-9 pe-3 py-2 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
                                placeholder="Search"
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
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Image
                                </th>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {tableData?.map((d: Menu, i: number) => (
                                <tr
                                    key={i}
                                    className="border-b border-default bg-neutral-primary-soft hover:bg-neutral-secondary-medium"
                                >
                                    <th
                                        scope="row"
                                        className="flex items-center whitespace-nowrap px-6 py-4 text-heading"
                                    >
                                        {i + 1}
                                    </th>

                                    <td className="px-6 py-4">
                                        {d.name}
                                    </td>

                                    <td className="px-6 py-4">
                                        <img
                                            src={d.image}
                                            alt={d.name}
                                            className="h-20 w-32 rounded-md object-cover"
                                        />
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="me-2 h-2.5 w-2.5 rounded-full bg-success" />
                                            {formatRupiah(d.price)}
                                        </div>
                                    </td>

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
                                            className="ml-5 font-medium text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex items-center overflow-x-auto p-5 sm:justify-between">
                        <span className="mb-4 block w-full text-sm font-normal text-body md:mb-0 md:inline md:w-auto">
                            Showing <span className="font-semibold text-heading">1-10</span> of{" "}
                            <span className="font-semibold text-heading">1000</span>
                        </span>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={100}
                            onPageChange={onPageChange}
                            showIcons
                        />
                    </div>
                </div>
            </div>

            <Modal dismissible show={openModal} size="4xl" onClose={closeModal}>
                <ModalHeader>
                    {modalMode === "add" ? "Tambah Produk" : "Edit Produk"}
                </ModalHeader>

                <ModalBody>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="id">ID</Label>
                                </div>
                                <TextInput
                                    id="id"
                                    type="number"
                                    value={form.id}
                                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                                    placeholder="Masukkan id"
                                />
                            </div>

                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="name">Nama Produk</Label>
                                </div>
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Masukkan nama produk"
                                />
                            </div>

                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="price">Harga</Label>
                                </div>
                                <TextInput
                                    id="price"
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    placeholder="Masukkan harga"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="dropzone-file-2">Upload Gambar</Label>
                            </div>

                            {preview ? (
                                <div className="rounded-lg border p-3">
                                    <p className="mb-3 text-sm font-medium">Preview Gambar</p>
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-56 w-full rounded-lg object-cover"
                                    />

                                    <div className="mt-3">
                                        <Button
                                            color="light"
                                            size="sm"
                                            onClick={() =>
                                                document.getElementById("dropzone-file-2")?.click()
                                            }
                                        >
                                            Ganti Gambar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex w-full items-center justify-center">
                                    <div className="flex h-56 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4">
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5 text-center">
                                            <svg
                                                className="mb-4 h-8 w-8 text-gray-500"
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
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 5v9m-5 0H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2M8 9l4-5 4 5m1 8h.01"
                                                />
                                            </svg>

                                            <p className="mb-2 text-sm text-gray-600">
                                                Click tombol di bawah untuk upload gambar
                                            </p>
                                            <p className="mb-4 text-xs text-gray-500">
                                                Max. File Size: <span className="font-semibold">30MB</span>
                                            </p>

                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    document.getElementById("dropzone-file-2")?.click()
                                                }
                                            >
                                                Browse file
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <input
                                id="dropzone-file-2"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
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

export default MenuPage;