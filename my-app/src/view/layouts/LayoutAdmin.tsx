import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import type { Dispatch, SetStateAction, RefObject } from "react";
import { Avatar, Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { navMenus } from "../../config/menuDashboard";

type MenuName = "master" | "kelola" | null;

export default function LayoutAdmin() {
    const { pathname } = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [openMenu, setOpenMenu] = useState<MenuName>(null);

    const masterRef = useRef<HTMLDivElement | null>(null);
    const kelolaRef = useRef<HTMLDivElement | null>(null);

    const toggleMenu = (menuName: Exclude<MenuName, null>) => {
        setOpenMenu((prev) => (prev === menuName ? null : menuName));
    };

    const closeAllMenu = () => {
        setOpenMenu(null);
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            const clickedOutsideMaster =
                masterRef.current && !masterRef.current.contains(target);
            const clickedOutsideKelola =
                kelolaRef.current && !kelolaRef.current.contains(target);

            if (clickedOutsideMaster && clickedOutsideKelola) {
                setOpenMenu(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-white">
            <HeaderCompt setMobileMenuOpen={setMobileMenuOpen} />

            {pathname != '/admin/order-cashier' && (
                <DesktopMenuNav
                    masterRef={masterRef}
                    toggleMenu={toggleMenu}
                    openMenu={openMenu}
                    kelolaRef={kelolaRef}
                />
            )}


            {mobileMenuOpen && (
                <MobileMenuNav
                    closeAllMenu={closeAllMenu}
                    masterRef={masterRef}
                    toggleMenu={toggleMenu}
                    openMenu={openMenu}
                    kelolaRef={kelolaRef}
                />
            )}

            <div className=" bg-[#f1f5f9] " >

                <Outlet />



            </div>
        </div>
    );
}

type MenuRefs = RefObject<HTMLDivElement | null>;



interface DesktopMenuNavProps {
    masterRef: MenuRefs;
    kelolaRef: MenuRefs;
    toggleMenu: (menuName: Exclude<MenuName, null>) => void;
    openMenu: MenuName;
}

const DesktopMenuNav = ({
    masterRef,
    toggleMenu,
    openMenu,
    kelolaRef,
}: DesktopMenuNavProps) => {
    const menuRefs: Record<Exclude<MenuName, null>, MenuRefs> = {
        master: masterRef,
        kelola: kelolaRef,
    };
    const { pathname } = useLocation()

    return (
        <div className="hidden md:flex  border  py-2 justify-center" >
            <div className="flex">
                {navMenus.map((menu) => {
                    if (menu.type === "link") {

                        const isActive = pathname === menu.to;

                        return (
                            <div
                                key={menu.to}
                                className={
                                    isActive
                                        ? "mr-3 py-2 px-2 flex items-center justify-center w-[150px] text-center border border-gray-400 text-gray-700 bg-gray-50 "
                                        : "mr-3 py-2 px-2 flex items-center justify-center w-[150px] text-center border"}
                            >
                                <Link to={menu.to}>{menu.label}</Link>
                            </div>
                        );
                    }

                    const isActiveGroup = menu.items.some((item) => pathname === item.to);


                    return (
                        <div
                            key={menu.key}
                            className="relative mr-3 min-w-[150px]"
                            ref={menuRefs[menu.key]}
                        >
                            <button
                                type="button"
                                onClick={() => toggleMenu(menu.key)}
                                className={
                                    isActiveGroup
                                        ? "w-full py-2 px-2 border border-gray-400 text-gray-700 bg-gray-50  flex items-center justify-between"
                                        : "w-full py-2 px-2 border flex items-center justify-between"
                                }
                            >
                                <span className="px-2">{menu.label}</span>
                                <span>{openMenu === menu.key ? "▲" : "▼"}</span>
                            </button>

                            {openMenu === menu.key && (
                                <div className="absolute left-0 top-full mt-1 w-[220px] bg-white border rounded shadow-lg z-50">
                                    <ul className="py-2">
                                        {menu.items.map((item) => {
                                            const isActiveChild = pathname === item.to;

                                            return (
                                                <li key={item.to}>
                                                    <Link
                                                        to={item.to}
                                                        className={
                                                            isActiveChild
                                                                ? "block px-4 py-2 bg-gray-100 text-gray-700 font-medium"
                                                                : "block px-4 py-2 hover:bg-gray-100"
                                                        }
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div >
    );
};



interface MobileMenuNavProps {
    closeAllMenu: () => void;
    masterRef: MenuRefs;
    kelolaRef: MenuRefs;
    toggleMenu: (menuName: Exclude<MenuName, null>) => void;
    openMenu: MenuName;
}


const MobileMenuNav = ({
    closeAllMenu,
    masterRef,
    toggleMenu,
    openMenu,
    kelolaRef,
}: MobileMenuNavProps) => {
    const menuRefs: Record<Exclude<MenuName, null>, MenuRefs> = {
        master: masterRef,
        kelola: kelolaRef,
    };

    const { pathname } = useLocation()

    return (
        <div className="md:hidden shadow border-t bg-white">
            <div className="flex flex-col p-3 space-y-2">
                {navMenus.map((menu) => {
                    if (menu.type === "link") {

                        const isActive = pathname === menu.to;

                        return (
                            <Link
                                key={menu.to}
                                to={menu.to}
                                onClick={closeAllMenu}
                                className={
                                    isActive
                                        ? "py-2 px-3 border border-blue-700 text-blue-700 rounded"
                                        : "py-2 px-3 border rounded"
                                }
                            >
                                {menu.label}
                            </Link>
                        );
                    }

                    const isActiveGroup = menu.items.some((item) => pathname === item.to);

                    return (
                        <div
                            key={menu.key}
                            className={
                                isActiveGroup
                                    ? "border border-blue-700 rounded"
                                    : "border rounded"
                            }
                            ref={menuRefs[menu.key]}
                        >
                            <button
                                type="button"
                                onClick={() => toggleMenu(menu?.key)}
                                className={
                                    isActiveGroup
                                        ? "w-full flex justify-between items-center py-2 px-3 text-blue-700"
                                        : "w-full flex justify-between items-center py-2 px-3"
                                }
                            >
                                <span>{menu.label}</span>
                                <span>{openMenu === menu.key ? "-" : "+"}</span>
                            </button>

                            {openMenu === menu.key && (
                                <div className="px-3 pb-3 flex flex-col space-y-2">
                                    {menu.items.map((item) => {
                                        const isActiveChild = pathname === item.to;

                                        return (
                                            <Link
                                                key={item.to}
                                                to={item.to}
                                                className={
                                                    isActiveChild
                                                        ? "pl-2 py-1 text-blue-700 font-medium"
                                                        : "pl-2 py-1"
                                                }
                                                onClick={closeAllMenu}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
interface HeaderComptProps {
    setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

const HeaderCompt = ({ setMobileMenuOpen }: HeaderComptProps) => {
    const { pathname } = useLocation()

    return (
        <div className="flex justify-between items-center p-3  shadow-lg border-b-2">
            <span className="font-semibold ">Seacoff</span>

            <div className="flex items-center">
                {!pathname.startsWith('/admin/order-cashier') || !pathname.startsWith('/admin/history') && (

                    <div className="mr-5 ">
                        <Link
                            className="mr-5"
                            to="/admin/dashboard">Dashboard</Link>
                        <span className="">
                            Riwayat
                        </span>
                    </div>
                )}

                <div className="mr-5">
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded />
                        }
                    >
                        <DropdownHeader>
                            <span className="block text-sm">Bonnie Green</span>
                            <span className="block truncate text-sm font-medium">name@flowbite.com</span>
                        </DropdownHeader>
                        <DropdownItem>Dashboard</DropdownItem>
                        <DropdownItem>Settings</DropdownItem>
                        <DropdownItem>Earnings</DropdownItem>

                        <DropdownItem>Sign out</DropdownItem>
                    </Dropdown>

                </div>
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded border "
                >
                    <span className="block w-5 h-0.5 bg-black mb-1"></span>
                    <span className="block w-5 h-0.5 bg-black mb-1"></span>
                    <span className="block w-5 h-0.5 bg-black"></span>
                </button>

            </div>
        </div>
    );
};