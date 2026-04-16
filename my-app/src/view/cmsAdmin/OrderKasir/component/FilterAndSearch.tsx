

type CategoryWithAll = {
    id: string;
    category_name: string;
};
// SearchFilter.tsx
type FilterAndSearchProps = {
    search: string,
    setSearch: (value: string) => void;
    categoriesWithAll: CategoryWithAll[];
    selectedCategoryId: string;
    handleCategoryClick: (categoryId: string) => void;
};

const FilterAndSearch = ({ search, setSearch, categoriesWithAll, selectedCategoryId, handleCategoryClick }: FilterAndSearchProps) => {
    return (
        <>
            <div>
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
                        className="block w-full rounded-lg border-default-medium border-gray-300 py-3 ps-9 pe-3 text-sm text-heading shadow-xs placeholder:text-body focus:border-brand focus:ring-brand"
                        placeholder="Search"
                    />
                </div>
            </div>

            <div>
                <div className="flex flex-wrap gap-2">
                    {categoriesWithAll.map((category) => {
                        const isActive = String(selectedCategoryId) === String(category.id);

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryClick(String(category.id))}
                                className={`rounded-base border px-4 py-2.5 text-sm font-medium leading-5 shadow-xs transition ${isActive
                                    ? "border-brand bg-purple-500 text-white focus:ring-brand/30"
                                    : "border-default-medium bg-white text-body hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-neutral-tertiary"
                                    }`}
                            >
                                {category.category_name}
                            </button>
                        );
                    })}
                </div>
            </div>

        </>

    )
}

export default FilterAndSearch;