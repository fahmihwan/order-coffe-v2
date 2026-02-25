import { Outlet } from "react-router-dom";

import '../../index.css'
export default function LayoutCustomer() {

    return (
        <div className="tw ">

            <div className="flex items-center justify-center ">
                <div className="min-h-screen w-[450px] max-w-full  bg-white  shadow-xl border border-slate-200 relative">
                    <Outlet />
                </div>
            </div>

        </div>
    )

}