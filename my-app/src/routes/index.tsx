import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

// layouts & guards (contoh import)

// import LayoutCustomer from "../view/layout/LayoutCustomer";
// import LayoutAdmin from "../view/layout/LayoutAdmin";
// import ProtectedRouteUser from "./guards/ProtectedRouteUser";
// import ProtectedRouteAdmin from "./guards/ProtectedRouteAdmin";
// import ProtectedRouteChecker from "./guards/ProtectedRouteChecker";

import LayoutCustomer from "../view/layouts/LayoutCustomer.tsx";
import LayoutAdmin from "../view/layouts/LayoutAdmin.tsx";
import CartPage from "../view/customer/pages/cart/CartPage.tsx"
import MenuAddOnPage from "../view/cmsAdmin/SettingProduct/MenuAddOn/MenuAddOnPage.tsx";
import OrderKasirPage from "../view/cmsAdmin/OrderKasir/OrderKasirPage.tsx";



const DashboardPage = lazy(() => import("../view/cmsAdmin/Dashboard/DashboardPage.tsx"));
const MenuPage = lazy(() => import("../view/cmsAdmin/Master/Menu/MenuPage.tsx"));
const AddOnPage = lazy(() => import("../view/cmsAdmin/Master/AddOn/AddOnPage.tsx"));
const CategoryPage = lazy(() => import("../view/cmsAdmin/Master/Category/CategoriPage.tsx"));

const CategoryMenuPage = lazy(() => import("../view/cmsAdmin/SettingProduct/CategoryMenu/CategoryMenuPage.tsx"));


// // pages (lazy)
const Home = lazy(() => import("../view/customer/pages/home/HomePage.tsx"));


const routes = createBrowserRouter([
    {
        element: <LayoutAdmin />,
        children: [
            { path: "/admin/dashboard", element: <DashboardPage /> },
            { path: "/admin/master/menu", element: <MenuPage /> },
            { path: "/admin/master/add-on", element: <AddOnPage /> },
            { path: "/admin/master/category", element: <CategoryPage /> },

            { path: "/admin/product-setting/category-menu", element: <CategoryMenuPage /> },
            { path: "/admin/product-setting/menu-addon", element: <MenuAddOnPage /> },

            { path: "/admin/order-cashier", element: <OrderKasirPage /> },
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
                path: "/cart", element: <CartPage />
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