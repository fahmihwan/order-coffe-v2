import type { Menu } from "../../../../../types/menu"

interface CardMenuProps {
    menu: Menu,
    menuQty: number,
    onPreviewMenu: React.MouseEventHandler<HTMLButtonElement>,
    handleDecMenu: (menuId: number) => void,
    handleIncMenu: (menu: Menu) => void
}

const CardMenu = ({
    handleDecMenu,
    handleIncMenu,
    menu, menuQty, onPreviewMenu
}: CardMenuProps) => {
    return (

        <a href="#" className="flex flex-row items-center bg-white border   rounded-lg shadow-sm max-w-xl hover:bg-gray-100 p-2">
            <div className="mr-2">
                <img
                    className="object-cover w-60 h-auto rounded-lg"
                    src={menu?.image}
                    alt=""
                />
            </div>
            <div className="flex w-full flex-col">
                <div className="flex flex-col  h-20 justify-between   pt-2">
                    <h5 className="text-lg  font-bold  text-gray-900 dark:text-white">
                        {menu?.name}
                    </h5>

                </div>
                <div className=" flex  justify-between items-center ">
                    <p>Rp. {menu?.price}</p>
                    {menuQty == 0 ? (<button
                        onClick={onPreviewMenu}
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 "
                    >
                        Tambah
                    </button>) : (
                        <div className="flex justify-center border-2 rounded-2xl bg-blue-100 border-blue-700  w-20">
                            <button
                                type="button"
                                className=" w-8 text-xl"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDecMenu(menu.id)
                                }}>-</button>
                            <div className="text-xl w-5 text-center">{menuQty}</div>
                            <button
                                type="button"
                                className=" w-8 text-xl"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleIncMenu(menu)
                                }}>+</button>
                        </div>
                    )}


                </div>

            </div>
        </a>

    )
}

export default CardMenu