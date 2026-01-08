import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import PrivateRoute from "./components/PrivateRoute";

export const router = createBrowserRouter([
    { path: "/", element: <Signin /> },
    { path: "/signup", element: <Signup /> },
    { path: "/signin", element: <Signin /> },
    { path: "/dashboard", element: <PrivateRoute><Dashboard /></PrivateRoute> },
    { path: "/settings", element: <PrivateRoute><Settings /></PrivateRoute> },
])
