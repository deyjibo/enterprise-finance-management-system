import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const role = localStorage.getItem("role"); // admin or manager

  if (!role || !allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    return <Navigate to={role === "manager" ? "/manager" : "/admin"} replace />;
  }

  return children;
}