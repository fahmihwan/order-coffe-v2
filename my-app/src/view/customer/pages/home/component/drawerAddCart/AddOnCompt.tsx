
import type { AddOnOption, } from "../../../../../../types/addOn";


interface AddOnComptProps {
    opt: AddOnOption;
    inputId: string;
    name: string; // name untuk group radio/checkbox
    type?: "radio" | "checkbox";
    checked: boolean,
    onClick: React.MouseEventHandler<HTMLLIElement>;
    formatRupiah: (value: number) => string
}

const AddOnCompt = ({ opt, inputId, name, type, checked, onClick, formatRupiah }: AddOnComptProps) => {
    return (
        <li
            className={`flex justify-between cursor-pointer rounded-md px-2 py-2 ${checked ? "bg-blue-50" : ""
                }`}
            onClick={onClick}
        >
            <span
                className={`text-lg cursor-pointer ${checked ? "text-blue-600 font-medium" : "text-gray-900 font-light"
                    }`}
            >
                {opt.name}
            </span>

            <div className="flex items-center mb-0">
                <span
                    className={`me-2 text-lg cursor-pointer ${checked ? "text-blue-600 font-medium" : "text-gray-900 font-light"
                        }`}
                >
                    +{formatRupiah(opt.price)}
                </span>

                <input
                    id={inputId}
                    type={type}
                    name={name}
                    checked={checked}
                    readOnly
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
            </div>
        </li>
    )
}

export default AddOnCompt