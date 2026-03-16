import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Pagination } from "flowbite-react"
import { useState } from "react";


const MenuPage = () => {

    const [currentPage, setCurrentPage] = useState(1);

    const onPageChange = (page: number) => setCurrentPage(page);

    const [openModal, setOpenModal] = useState(false);

    return (<div className="p-5">
        <div className="mb-5 flex justify-between">
            <h1 className="text-2xl font-bold">Master Menu</h1>

            <Button onClick={() => setOpenModal(true)}>Tambah Data</Button>
        </div>

        <div className="bg-neutral-primary-soft block  p-6 border border-default rounded-base shadow-xs bg-white">
            <div className="">
                <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                    <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 p-4">

                        <label htmlFor="input-group-1" className="sr-only">
                            Search
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-body"
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
                                className="block w-full max-w-96 ps-9 pe-3 py-2 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
                                placeholder="Search"
                            />
                        </div>
                    </div>


                    <table className="w-full text-sm text-left rtl:text-right text-body">
                        <thead className="text-sm text-body bg-neutral-secondary-medium border-b border-t border-default-medium">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Position
                                </th>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                                <th
                                    scope="row"
                                    className="flex items-center px-6 py-4 text-heading whitespace-nowrap"
                                >
                                    <div className="ps-3">
                                        <div className="text-base font-semibold">Neil Sims</div>
                                        <div className="font-normal text-body">neil.sims@flowbite.com</div>
                                    </div>
                                </th>
                                <td className="px-6 py-4">React Developer</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-2.5 w-2.5 rounded-full bg-success me-2" /> Online
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {/* Modal toggle */}
                                    <a
                                        href="#"
                                        type="button"
                                        data-modal-target="editUserModal"
                                        data-modal-show="editUserModal"
                                        className="font-medium text-fg-brand hover:underline"
                                    >
                                        Edit user
                                    </a>
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <div className="flex overflow-x-auto sm:justify-between items-center p-5">
                        <span className="text-sm font-normal text-body mb-4 md:mb-0 block w-full md:inline md:w-auto">
                            Showing <span className="font-semibold text-heading">1-10</span> of{" "}
                            <span className="font-semibold text-heading">1000</span>
                        </span>

                        <Pagination currentPage={currentPage} totalPages={100} onPageChange={onPageChange} showIcons />
                    </div>

                </div>

            </div >
        </div>


        <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
            <ModalHeader>Terms of Service</ModalHeader>
            <ModalBody>
                <div className="space-y-6">
                    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        With less than a month to go before the European Union enacts new consumer privacy laws for its citizens,
                        companies around the world are updating their terms of service agreements to comply.
                    </p>
                    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant
                        to ensure a common set of data rights in the European Union. It requires organizations to notify users as
                        soon as possible of high-risk data breaches that could personally affect them.
                    </p>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button onClick={() => setOpenModal(false)}>I accept</Button>
                <Button color="alternative" onClick={() => setOpenModal(false)}>
                    Decline
                </Button>
            </ModalFooter>
        </Modal>
    </div>)
}

export default MenuPage