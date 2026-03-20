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
import type { Category } from "../../../../types/category";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { getMasterCategory } from "../../../../redux/features/categorySlice";
import { getMasterMenu } from "../../../../redux/features/menuSlice";
import type { Menu } from "../../../../types/menu";



type CategoryWithMenus = Category & {
    menus?: Menu[];
};

type RelationForm = {
    menuId: string;
};

const initialForm: RelationForm = {
    menuId: "",
};

const CategoryMenuPage = () => {
    const dispatch = useAppDispatch();

    const masterCategories = useAppSelector((state) => state.category.masterCategories) as CategoryWithMenus[];

    const masterMenus = useAppSelector((state) => state.menu.masterMenus) as Menu[];

    const [currentPage, setCurrentPage] = useState(1);
    const onPageChange = (page: number) => setCurrentPage(page);

    const [openModal, setOpenModal] = useState(false);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState<RelationForm>(initialForm);

    const [selectedCategory, setSelectedCategory] =
        useState<CategoryWithMenus | null>(null);

    // local state untuk simulasi relasi category-menu
    const [categoryMenus, setCategoryMenus] = useState<CategoryWithMenus[]>([]);

    useEffect(() => {
        dispatch(getMasterCategory());
        dispatch(getMasterMenu());
    }, [dispatch]);

    useEffect(() => {
        if (masterCategories?.length > 0) {
            setCategoryMenus(masterCategories);
        }
    }, [masterCategories]);

    const resetForm = () => {
        setForm(initialForm);
        setSelectedCategory(null);
    };

    const openAddMenuModal = (category: CategoryWithMenus) => {
        setSelectedCategory(category);
        setForm(initialForm);
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    const handleSubmit = () => {
        if (!selectedCategory || !form.menuId) return;

        const menuId = Number(form.menuId);
        const selectedMenu = masterMenus.find((menu) => menu.id === menuId);

        if (!selectedMenu) return;

        setCategoryMenus((prev) =>
            prev.map((category) => {
                if (category.id !== selectedCategory.id) return category;

                const existingMenus = category.menus ?? [];
                const isAlreadyExists = existingMenus.some(
                    (menu) => menu.id === selectedMenu.id
                );

                if (isAlreadyExists) return category;

                return {
                    ...category,
                    menus: [...existingMenus, selectedMenu],
                };
            })
        );

        closeModal();
    };

    const handleDeleteRelation = (categoryId: number, menuId: number) => {
        setCategoryMenus((prev) =>
            prev.map((category) => {
                if (category.id !== categoryId) return category;

                return {
                    ...category,
                    menus: (category.menus ?? []).filter(
                        (menu) => menu.id !== menuId
                    ),
                };
            })
        );
    };

    const filteredData = useMemo(() => {
        return categoryMenus.filter((item) => {
            const keyword = search.toLowerCase();

            const matchCategory = item.category_name
                ?.toLowerCase()
                .includes(keyword);

            const matchMenu = (item.menus ?? []).some((menu) =>
                menu.name?.toLowerCase().includes(keyword)
            );

            return matchCategory || matchMenu;
        });
    }, [categoryMenus, search]);

    const availableMenus = useMemo(() => {
        if (!selectedCategory) return masterMenus;

        const usedMenuIds = new Set(
            (selectedCategory.menus ?? []).map((menu) => menu.id)
        );

        return masterMenus.filter((menu) => !usedMenuIds.has(menu.id));
    }, [masterMenus, selectedCategory]);

    return (
        <div className="p-5">
            <div className="mb-5 flex justify-between">
                <h1 className="text-2xl font-bold">Category Menu Relation</h1>
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
                                placeholder="Search category / menu"
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
                                    Menus
                                </th>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((category, i) => (
                                    <tr
                                        key={`${category.id}-${i}`}
                                        className="border-b border-default bg-neutral-primary-soft align-top hover:bg-neutral-secondary-medium"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-heading">
                                            {i + 1}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-heading">
                                            {category.category_name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {(category.menus ?? []).length > 0 ? (
                                                <div className="space-y-3">
                                                    {(category.menus ?? []).map((menu) => (
                                                        <div
                                                            key={menu.id}
                                                            className="flex items-center justify-between rounded-lg border border-default p-3"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={menu.image}
                                                                    alt={menu.name}
                                                                    className="h-12 w-12 rounded-lg object-cover"
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-heading">
                                                                        {menu.name}
                                                                    </p>
                                                                    <p className="text-sm text-body">
                                                                        Rp{" "}
                                                                        {menu.price.toLocaleString(
                                                                            "id-ID"
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteRelation(
                                                                        Number(category.id),
                                                                        menu.id
                                                                    )
                                                                }
                                                                className="font-medium text-red-600 hover:underline"
                                                            >
                                                                Hapus Relasi
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-body">
                                                    Belum ada menu pada category ini.
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <Button
                                                size="sm"
                                                onClick={() => openAddMenuModal(category)}
                                            >
                                                Tambah Menu
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-6 text-center text-sm text-body"
                                    >
                                        Data category/menu tidak ditemukan.
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
                                {categoryMenus.length}
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
                    Tambah Menu ke Category{" "}
                    {selectedCategory ? `- ${selectedCategory.category_name}` : ""}
                </ModalHeader>

                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="menuId">Pilih Menu</Label>
                            </div>
                            <Select
                                id="menuId"
                                value={form.menuId}
                                onChange={(e) =>
                                    setForm({ ...form, menuId: e.target.value })
                                }
                            >
                                <option value="">-- Pilih Menu --</option>
                                {availableMenus.map((menu) => (
                                    <option key={menu.id} value={menu.id}>
                                        {menu.name} - Rp{" "}
                                        {menu.price.toLocaleString("id-ID")}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={handleSubmit}>Simpan Relasi</Button>

                    <Button color="gray" onClick={closeModal}>
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default CategoryMenuPage;