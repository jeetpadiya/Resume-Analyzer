import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoutes = () => {
    const { token, loading } = useAuth();

    if (loading) {
        return null; // or loader
    }

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;