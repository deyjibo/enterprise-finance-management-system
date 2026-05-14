import { useEffect, useState } from "react";
import Select from "react-select";

export default function UpdateInvoice() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [editInvoiceId, setEditInvoiceId] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    billNo: "",
    invoiceDate: "",
    invoiceAmount: "",
  });
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [message, setMessage] = useState("");
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null); // <-- for modal

  const token = localStorage.getItem("token");

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/customers", {
          headers: { Authorization: token },
        });
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load customers");
      }
    };
    fetchCustomers();
  }, [token]);

  // Convert to react-select options
  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  // Fetch invoices
  useEffect(() => {
    if (!selectedCustomer) return;

    const fetchInvoices = async () => {
      try {
        let url = `http://127.0.0.1:5000/api/invoices/customer/${selectedCustomer}`;
        if (fromDate || toDate) {
          const params = new URLSearchParams();
          if (fromDate) params.append("from", fromDate);
          if (toDate) params.append("to", toDate);
          url += `?${params.toString()}`;
        }

        const res = await fetch(url, {
          headers: { Authorization: token },
        });
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load invoices");
      }
    };

    fetchInvoices();
  }, [selectedCustomer, fromDate, toDate, token]);

  // Handle change
  const handleChange = (e) => {
    setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
  };

  const handleEdit = (inv) => {
    setEditInvoiceId(inv._id);
    setInvoiceData({
      billNo: inv.billNo,
      invoiceDate: inv.invoiceDate.split("T")[0],
      invoiceAmount: inv.invoiceAmount,
    });
  };

  const handleCancel = () => {
    setEditInvoiceId(null);
    setInvoiceData({ billNo: "", invoiceDate: "", invoiceAmount: "" });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/invoices/${editInvoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!res.ok) throw new Error("Failed to update invoice");

      setMessage("Invoice updated successfully");
      setEditInvoiceId(null);
      setInvoiceData({ billNo: "", invoiceDate: "", invoiceAmount: "" });

      // Refresh invoices
      const refreshed = await fetch(
        `http://127.0.0.1:5000/api/invoices/customer/${selectedCustomer}`,
        { headers: { Authorization: token } }
      );
      const refreshedData = await refreshed.json();
      setInvoices(refreshedData);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      setInvoices(invoices.filter((inv) => inv._id !== id));
      setDeleteInvoiceId(null); // Close modal
      setMessage("Invoice deleted successfully");
    } catch (err) {
      setMessage("Failed to delete invoice");
    }
  };

  return (
    <div className="container py-4">
      <h3 className="text-center mb-4">Update Invoice</h3>

      {message && (
        <div className="alert alert-info text-center">{message}</div>
      )}

      {/* FILTER SECTION */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label className="form-label">Select Customer</label>
          <Select
            options={customerOptions}
            value={
              customerOptions.find((opt) => opt.value === selectedCustomer) ||
              null
            }
            onChange={(selected) =>
              setSelectedCustomer(selected ? selected.value : "")
            }
            placeholder="Select Customer..."
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
            menuShouldScrollIntoView={false}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menuList: (base) => ({ ...base, maxHeight: "none", overflow: "visible" }),
            }}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <table className="table table-bordered table-striped text-center">
        <thead className="table-dark">
          <tr>
            <th>Bill No</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <tr key={inv._id}>
                {editInvoiceId === inv._id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        name="billNo"
                        value={invoiceData.billNo}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        name="invoiceDate"
                        value={invoiceData.invoiceDate}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="invoiceAmount"
                        value={invoiceData.invoiceAmount}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-success btn-sm me-1"
                        onClick={handleUpdate}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{inv.billNo}</td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td>{inv.invoiceAmount}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-1"
                        onClick={() => handleEdit(inv)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteInvoiceId(inv._id)} // open modal
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No invoices found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteInvoiceId && (
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
                  onClick={() => setDeleteInvoiceId(null)}
                ></button>
              </div>
              <div className="modal-body text-center">
                Are you sure you want to delete this invoice?
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteInvoiceId(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteInvoiceId)}
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