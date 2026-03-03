
import type { AddOnOption, } from "../../../../../../types/addOn";


interface AddOnComptProps {
    opt: AddOnOption;
    inputId: string;
    name: string; // name untuk group radio/checkbox
    type?: "radio" | "checkbox";
    checked: boolean,
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    formatRupiah: (value: number) => string
}

const AddOnCompt = ({ opt, inputId, name, type, checked, onChange, formatRupiah }: AddOnComptProps) => {
    return (
        <li className="flex justify-between" ><span className="font-light text-lg">{opt.name}</span>
            <div className="flex items-center mb-4">
                <label
                    htmlFor="default-radio-1"
                    className="me-2 text-lg font-light text-gray-900 "
                >
                    +{formatRupiah(opt.price)}
                </label>
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 "
                />

            </div>
        </li>
    )
}

export default AddOnCompt