

const SearchFilter = () => {
    return (
        <>
            <div className="w-full  justify-end flex mb-5">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">Meja 15</span>
            </div>

            <div className="w-full flex">
                <div className="w-9/12">
                    <form className="max-w-md mx-auto mr-2">
                        <label
                            htmlFor="default-search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                        >
                            Search
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-500 "
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="search"
                                id="default-search"
                                className="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 "
                                placeholder="Search Mockups, Logos..."

                            />

                        </div>
                    </form>
                </div>

                <div className="w-3/12">
                    <button
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm  py-2.5 border-0 h-full w-full "
                    >
                        Menu
                    </button>
                </div>

            </div>
        </>
    )
}

export default SearchFilter