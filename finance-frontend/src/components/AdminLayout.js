import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";


const logo = process.env.PUBLIC_URL + "/logo.jpeg";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const adminName = localStorage.getItem("name") || "User";
  const userRole = localStorage.getItem("role") || "admin";

  const [openMenu, setOpenMenu] = useState("");
  const [backupStatus, setBackupStatus] = useState(""); // "success" or "error"
  const [showModal, setShowModal] = useState(false);

  const handleMenuClick = (menu) => setOpenMenu(openMenu === menu ? "" : menu);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const activeStyle = { backgroundColor: "#0d6efd", borderRadius: "6px" };

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/admin" || location.pathname === "/manager";
    return location.pathname === path;
  };

  const handleBackup = async () => {
    try {
      const res = await API.post("/backup");
      setBackupStatus(res.ok ? "success" : "error");
    } catch {
      setBackupStatus("error");
    }
    setShowModal(true);
  };

  return (
    <div className="d-flex vh-100 overflow-hidden">

      {/* SIDEBAR */}
      <div className="bg-dark text-white d-flex flex-column" style={{ width: "230px" }}>
        <div className="text-center py-4">
          <img
            src={logo}
            alt="logo"
            style={{ width: "80px", cursor: "pointer" }}
            onClick={() => navigate(userRole === "admin" ? "/admin" : "/manager")}
          />
        </div>

        <ul className="nav flex-column px-2">
          <li className="nav-item">
            <span
              className="nav-link text-white fw-bold"
              style={{ cursor: "pointer", ...(isActive("/dashboard") && activeStyle) }}
              onClick={() => navigate(userRole === "admin" ? "/admin" : "/manager")}
            >
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </span>
          </li>

          {(userRole === "admin" || userRole === "manager") && (
            <li className="nav-item mt-2">
              <span
                className="nav-link text-white fw-bold"
                style={{ cursor: "pointer", ...(isActive("/statement") && activeStyle) }}
                onClick={() => navigate("/statement")}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Statement
              </span>
            </li>
          )}

          {/* MASTER MENU */}
          <li className="nav-item mt-2">
            <div
              className="nav-link text-white fw-bold d-flex justify-content-between"
              style={{ cursor: "pointer" }}
              onClick={() => handleMenuClick("master")}
            >
              <span>
                <i className="bi bi-folder2-open me-2"></i>
                Master
              </span>
              <span>{openMenu === "master" ? "▲" : "▼"}</span>
            </div>

            {openMenu === "master" && (
              <ul className="nav flex-column ms-3">
                {userRole === "admin" && (
                  <li
                    className="nav-link text-white"
                    style={{ cursor: "pointer", ...(isActive("/customer-create") && activeStyle) }}
                    onClick={() => navigate("/customer-create")}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Customer Create
                  </li>
                )}

                {(userRole === "admin" || userRole === "manager") && (
                  <li
                    className="nav-link text-white"
                    style={{ cursor: "pointer", ...(isActive("/customer-list") && activeStyle) }}
                    onClick={() => navigate("/customer-list")}
                  >
                    <i className="bi bi-people me-2"></i>
                    Customer View / Update
                  </li>
                )}
              </ul>
            )}
          </li>

          {/* DATA ENTRY & UPDATE ENTRY - admin only */}
          {userRole === "admin" && (
            <>
              <li className="nav-item mt-2">
                <div
                  className="nav-link text-white fw-bold d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleMenuClick("dataEntry")}
                >
                  <span>
                    <i className="bi bi-pencil-square me-2"></i>
                    Data Entry
                  </span>
                  <span>{openMenu === "dataEntry" ? "▲" : "▼"}</span>
                </div>

                {openMenu === "dataEntry" && (
                  <ul className="nav flex-column ms-3">
                    <li
                      className="nav-link text-white"
                      style={{ cursor: "pointer", ...(isActive("/invoice-entry") && activeStyle) }}
                      onClick={() => navigate("/invoice-entry")}
                    >
                      <i className="bi bi-receipt me-2"></i>
                      Invoice Entry
                    </li>

                    <li
                      className="nav-link text-white"
                      style={{ cursor: "pointer", ...(isActive("/collection-entry") && activeStyle) }}
                      onClick={() => navigate("/collection-entry")}
                    >
                      <i className="bi bi-cash-stack me-2"></i>
                      Collection Entry
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-item mt-2">
                <div
                  className="nav-link text-white fw-bold d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleMenuClick("updateEntry")}
                >
                  <span>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Update Entry
                  </span>
                  <span>{openMenu === "updateEntry" ? "▲" : "▼"}</span>
                </div>

                {openMenu === "updateEntry" && (
                  <ul className="nav flex-column ms-3">
                    <li
                      className="nav-link text-white"
                      style={{ cursor: "pointer", ...(isActive("/update-invoice") && activeStyle) }}
                      onClick={() => navigate("/update-invoice")}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Invoice Update
                    </li>

                    <li
                      className="nav-link text-white"
                      style={{ cursor: "pointer", ...(isActive("/update-collection") && activeStyle) }}
                      onClick={() => navigate("/update-collection")}
                    >
                      <i className="bi bi-cash me-2"></i>
                      Collection Update
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}
        </ul>

        {/* BACKUP BUTTON */}
        <div className="text-center mt-auto mb-3 px-2">
          <button className="btn btn-warning w-100" onClick={handleBackup}>
            Backup Now
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-grow-1 d-flex flex-column">
        <nav className="navbar navbar-dark bg-dark px-4 position-relative">
          <div className="position-absolute top-50 start-50 translate-middle text-white">
            <h5 className="m-0">Welcome, {adminName}</h5>
          </div>
          <button className="btn btn-danger ms-auto" onClick={handleLogout}>Sign Out</button>
        </nav>

        <div className="p-4 overflow-auto">
          <Outlet />
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div
          className="modal d-block fade show"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Backup Status</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {backupStatus === "success"
                  ? "Backup started successfully!"
                  : "Backup failed. Please try again."}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}