import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

// Проверка на аутентификацию
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const isAuthenticated = false;

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}

export default ProtectedRoute;
