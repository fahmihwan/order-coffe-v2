import type { AddOnGroup, AddOnOption } from "../../../../types/addOn";
import type { Menu } from "../../../../types/menu";
import { formatRupiah } from "../../../../utils/cartUtils";

type AddONModalProps = {
    menuWithAddOn: Menu;
    handleCloseAddOnModal: () => void;
    setQtyDrawer: React.Dispatch<React.SetStateAction<number>>;
    drawerSelectedOptions: AddOnOption[];
    handleSelectOption: (group: AddOnGroup, option: AddOnOption) => void;
    addOnErrors: Record<string, string>;
    addOnTotalPreview: number;
    qtyDrawer: number;
    handleConfirmAddOn: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// AddOnModal.tsx
const AddOnModal = ({ menuWithAddOn, handleCloseAddOnModal, setQtyDrawer, drawerSelectedOptions, handleSelectOption, addOnErrors, addOnTotalPreview, qtyDrawer, handleConfirmAddOn }: AddONModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b p-4">
                    <div>
                        <h2 className="text-xl font-bold">Pilih Add On</h2>
                        <p className="text-sm text-gray-500">{menuWithAddOn.name}</p>
                    </div>

                    <button
                        onClick={handleCloseAddOnModal}
                        className="rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
                    >
                        Tutup
                    </button>
                </div>

                <div className=" space-y-6 overflow-y-auto p-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={menuWithAddOn.image}
                                alt={menuWithAddOn.name}
                                className="h-20 w-20 rounded-lg object-cover"
                            />
                            <div>
                                <h3 className="text-lg font-semibold">{menuWithAddOn.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {menuWithAddOn.description}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-green-600">
                                    {formatRupiah(menuWithAddOn.price)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Qty
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setQtyDrawer((prev) => Math.max(prev - 1, 1))}
                                className="h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100"
                            >
                                -
                            </button>
                            <span className="min-w-[32px] text-center text-sm font-medium">
                                {qtyDrawer}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQtyDrawer((prev) => prev + 1)}
                                className="h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {(menuWithAddOn.add_on_groups || []).map((group) => {
                        const currentSelected = drawerSelectedOptions.filter(
                            (item) => item.add_on_group_id === group.id
                        );

                        return (
                            <div
                                key={group.id}
                                className="space-y-3 rounded-lg border border-gray-200 p-4"
                            >
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {group.title}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {group.description}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Min {group.min_select} - Max {group.max_select}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {group.add_on_options
                                        .filter((option) => option.is_active)
                                        .map((option) => {
                                            const isChecked = currentSelected.some(
                                                (item) => item.id === option.id
                                            );

                                            return (
                                                <label
                                                    key={option.id}
                                                    className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type={option.type}
                                                            checked={isChecked}
                                                            onChange={() =>
                                                                handleSelectOption(group, option)
                                                            }
                                                        />
                                                        <span className="text-sm text-gray-800">
                                                            {option.name}
                                                        </span>
                                                    </div>

                                                    <span className="text-sm font-medium text-green-600">
                                                        {option.price > 0
                                                            ? `+ ${formatRupiah(option.price)}`
                                                            : "Gratis"}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                </div>

                                {addOnErrors[group.id] && (
                                    <p className="text-sm text-red-500">
                                        {addOnErrors[group.id]}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between border-t p-4">
                    <div>
                        <p className="text-sm text-gray-500">Total per item</p>
                        <p className="text-lg font-bold text-green-600">
                            {formatRupiah(
                                (menuWithAddOn.price + addOnTotalPreview) * qtyDrawer
                            )}
                        </p>
                    </div>

                    <button
                        onClick={handleConfirmAddOn}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                        Simpan ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    )

}



export default AddOnModal;