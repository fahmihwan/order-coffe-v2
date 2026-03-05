import { decrementMenu } from "../../../../../redux/features/cartSlice";
import { useAppDispatch } from "../../../../../redux/hooks";
import type { Menu } from "../../../../../types/menu"
import { formatRupiah } from "../../../../../utils/cartUtils";
import QuantityStepper from "../../../../shared/component/QuantityStepper";

interface CardMenuProps {

    menu: Menu,
    menuQty: number,
    onPreviewMenu: React.MouseEventHandler<HTMLButtonElement>,
    viewRepeatMenuDrawer: (menuId: number) => void,
}

const CardMenu = ({
    menu, menuQty, onPreviewMenu, viewRepeatMenuDrawer,
}: CardMenuProps) => {

    const dispatch = useAppDispatch();


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
                    <p>{formatRupiah(menu?.price)} </p>
                    {menuQty == 0 ? (<button
                        onClick={onPreviewMenu}
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 "
                    >
                        Tambah
                    </button>) : (
                        <QuantityStepper
                            onPlus={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                viewRepeatMenuDrawer(menu?.id)
                            }}
                            menuQty={menuQty}
                            onMinus={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                dispatch(decrementMenu({ menuId: menu.id, cartKey: null }))
                            }}
                        />
                    )}
                </div >

            </div >
        </a >

    )
}

export default CardMenu