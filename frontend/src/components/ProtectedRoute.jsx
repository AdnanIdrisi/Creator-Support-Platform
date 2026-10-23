import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spinner } from "./ui";
export default function ProtectedRoute() { const { user, initialized } = useSelector((state) => state.auth); const location = useLocation(); if (!initialized) return <Spinner />; return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />; }
