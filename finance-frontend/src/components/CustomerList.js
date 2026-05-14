import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import API from "../services/api";
export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCustomer, setEditCustomer] = useState(null);
  const [message, setMessage] = useState("");
  const [deleteCustomerId, setDeleteCustomerId] = useState(null); // <-- For delete modal

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const response = await API.get("/customers");

      const data = response.data;
      setCustomers(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ================= EXPORT EXCEL =================
  const exportAsExcel = () => {
    if (customers.length === 0) {
      alert("No data to export");
      return;
    }

    const data = customers.map((c) => ({
      "Business Name": c.name,
      "Owner Name": c.ownerName,
      Address: c.address,
      Phone: c.phone,
      "Customer Type": c.customerType || "RPD",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "Customer_List.xlsx");
  };

  // Handle input change in modal
  const handleChange = (e) => {
    setEditCustomer({ ...editCustomer, [e.target.name]: e.target.value });
  };

  // Update customer
  const handleUpdate = async () => {
    try {
      
      await API.put(`/customers/${editCustomer._id}`, editCustomer);

      setMessage("Customer updated successfully!");
      setEditCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error updating customer");
    }
  };

  // Delete customer
  const handleDelete = async (id) => {
    try {
      
      await API.delete(`/customers/${id}`);

      setMessage("Customer deleted successfully!");
      setDeleteCustomerId(null); // Close modal
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error deleting customer");
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 text-center">Customer List</h3>

      {message && <div className="alert alert-info text-center">{message}</div>}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <table className="table table-bordered table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th>Business Name</th>
                <th>Owner Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Customer Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.ownerName}</td>
                  <td>{customer.address}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.customerType || "RPD"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => setEditCustomer(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteCustomerId(customer._id)} // Open delete modal
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ BUTTON AT BOTTOM */}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-success" onClick={exportAsExcel}>
              Export as Excel
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editCustomer && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Customer</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditCustomer(null)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control text-center"
                    value={editCustomer.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Owner Name</label>
                  <input
                    type="text"
                    name="ownerName"
                    className="form-control text-center"
                    value={editCustomer.ownerName}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control text-center"
                    value={editCustomer.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control text-center"
                    value={editCustomer.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Customer Type</label>
                  <select
                    name="customerType"
                    className="form-select"
                    value={editCustomer.customerType || "RPD"}
                    onChange={handleChange}
                  >
                    <option value="RPD">RPD</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Retailer">Retailer</option>
                  </select>
                </div>

                <button
                  className="btn btn-success w-100"
                  onClick={handleUpdate}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCustomerId && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteCustomerId(null)}
                ></button>
              </div>
              <div className="modal-body text-center">
                Are you sure you want to delete this customer?
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteCustomerId(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteCustomerId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
