import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// LOGIN
import Login from "./components/Login";

// ADMIN LAYOUT
import AdminLayout from "./components/AdminLayout";
import Register from "./components/Register";
// DASHBOARDS
import AdminDashboard from "./components/AdminDashboard";
import ManagerDashboard from "./components/ManagerDashboard";

// MASTER / DATA ENTRY
import CustomerForm from "./components/CustomerForm";
import CustomerList from "./components/CustomerList";
import CollectionEntry from "./components/CollectionEntry";
import InvoiceForm from "./components/InvoiceForm"; 
import Statement from "./components/Statement";

// UPDATE ENTRY
import UpdateInvoice from "./components/UpdateInvoice";
import UpdateCollection from "./components/UpdateCollection";

/* ===== PROTECTED ROUTE ===== */
function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "admin" or "manager"

  // Not logged in
  if (!token) return <Navigate to="/" replace />;

  // Role not allowed
  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === "admin" ? "/admin" : "/manager"} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* PROTECTED AREA */}
        <Route element={<AdminLayout />}>
          {/* ADMIN DASHBOARD */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* MANAGER DASHBOARD */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* MASTER MENU */}
          <Route
            path="/customer-create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CustomerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-list"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <CustomerList />
              </ProtectedRoute>
            }
          />

          {/* DATA ENTRY - admin only */}
          <Route
            path="/invoice-entry"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <InvoiceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection-entry"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CollectionEntry />
              </ProtectedRoute>
            }
          />

          {/* STATEMENT - admin & manager */}
          <Route
            path="/statement"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Statement />
              </ProtectedRoute>
            }
          />

          {/* UPDATE ENTRY - admin only */}
          <Route
            path="/update-invoice"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UpdateInvoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-collection"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UpdateCollection />
              </ProtectedRoute>
            }
          />

          {/* ================== CATCH-ALL / INVALID ROUTES ================== */}
          <Route
            path="*"
            element={
              <Navigate
                to={localStorage.getItem("role") === "manager" ? "/manager" : "/admin"}
                replace
              />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;