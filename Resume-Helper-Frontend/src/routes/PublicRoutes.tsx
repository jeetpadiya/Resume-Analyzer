import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const PublicRoutes = () => {
  const { token, loading } = useAuth();

  if (loading) return null;

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;