// src/components/ProtectedRoute.js
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const { user, loading, isInitialized } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitialized && !loading && !user) {
      // Redirect ke halaman login dengan return url
      navigate("/signin", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [user, loading, isInitialized, navigate, location]);

  if (loading || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? children : null;
};

export default ProtectedRoute;