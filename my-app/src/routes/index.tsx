import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

// layouts & guards (contoh import)

// import LayoutCustomer from "../view/layout/LayoutCustomer";
// import LayoutAdmin from "../view/layout/LayoutAdmin";
// import ProtectedRouteUser from "./guards/ProtectedRouteUser";
// import ProtectedRouteAdmin from "./guards/ProtectedRouteAdmin";
// import ProtectedRouteChecker from "./guards/ProtectedRouteChecker";

import LayoutCustomer from "../view/layouts/LayoutCustomer.tsx";
import LayoutAdmin from "../view/layouts/LayoutAdmin.tsx";


const HomeAdmin = lazy(() => import("../view/cmsAdmin/Home.tsx"));

// // pages (lazy)
const Home = lazy(() => import("../view/customer/pages/home/HomePage.tsx"));
const AddMenu = lazy(() => import("../view/customer/pages/AddMenu.tsx"));
// const DetailEvent = lazy(() => import("../view/home/DetailEvent"));
// const CartTicket = lazy(() => import("../view/home/CartTicket"));
// const Checkout = lazy(() => import("../view/transaction/Checkout"));

// const LoginAdmin = lazy(() => import("../view/cmsAdmin/auth/LoginAdmin"));
// const Dashboard = lazy(() => import("../view/cmsAdmin/Dashboard"));

const routes = createBrowserRouter([
    {
        element: <LayoutAdmin />,
        children: [
            {
                path: "/admin", element: <HomeAdmin />
            }
        ]
    },
    {
        // path:"/menu/1?source=qr&tableId=a18&tableNo=A18",
        // element:<div>{{children}}</div>,
        element: <LayoutCustomer />,
        children: [
            {
                path: "/menu", element: <Home />,
            },
            {
                path: "/add-menu", element: <AddMenu />
            }
        ]
    }
    //  {
    //     element: <LayoutCustomer />,
    //     children: [
    //       { path: "/", element: <Home /> },
    //       { path: "/event/:slug", element: <DetailEvent /> },
    //       { path: "/event/:slug/tickets", element: <CartTicket /> },
    //       {
    //         path: "/event/:slug/checkout",
    //         element: <ProtectedRouteUser element={<Checkout />} />,
    //       },
    //     ],
    //   },
    //   {
    //     path: "/admin/login",
    //     element: <LoginAdmin />,
    //   },
    //   {
    //     element: <ProtectedRouteAdmin element={<LayoutAdmin />} />,
    //     children: [
    //       { path: "/admin/dashboard", element: <Dashboard /> },
    //       // dst...
    //     ],
    //   },
    //   {
    //     element: <ProtectedRouteChecker element={<LayoutAdmin />} />,
    //     children: [
    //       // dst...
    //     ],
    //   },
])

export type AppRouter = typeof routes
export default routes;