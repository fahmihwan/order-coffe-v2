
type QuantityStepperProps = {
    menuQty: number,
    onPlus: React.MouseEventHandler<HTMLButtonElement>,
    onMinus: React.MouseEventHandler<HTMLButtonElement>,
}

export default function QuantityStepper({
    menuQty,
    onPlus,
    onMinus
}: QuantityStepperProps) {
    return (
        <div className="flex justify-center border-2 rounded-2xl bg-blue-100 border-blue-700  w-20">
            <button
                type="button"
                className=" w-8 text-xl"
                onClick={onMinus}>-</button>
            <div className="text-xl w-5 text-center">{menuQty}</div>
            <button
                type="button"
                className=" w-8 text-xl"
                onClick={onPlus}>+</button>
        </div>
    )
}