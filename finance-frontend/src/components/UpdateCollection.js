import { useEffect, useState } from "react";
import Select from "react-select";

export default function UpdateCollection() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [collections, setCollections] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deleteId, setDeleteId] = useState(null); // <-- for modal

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
        setMessage("Failed to load customers");
      }
    };
    fetchCustomers();
  }, [token]);

  // Convert to options
  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  // Fetch collections
  useEffect(() => {
    if (!selectedCustomer) {
      setCollections([]);
      return;
    }

    const fetchCollections = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/collections/customer/${selectedCustomer}`,
          { headers: { Authorization: token } }
        );
        const data = await res.json();

        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        const filtered = data.filter((col) => {
          const colDate = new Date(col.collectionDate);
          return (!from || colDate >= from) && (!to || colDate <= to);
        });

        setCollections(filtered);
      } catch (err) {
        setMessage("Failed to load collections");
      }
    };

    fetchCollections();
  }, [selectedCustomer, fromDate, toDate, token]);

  // Edit handlers
  const handleChange = (field, value) => {
    setCollections((prev) =>
      prev.map((col) =>
        col._id === editingId ? { ...col, [field]: value } : col
      )
    );
  };

  const handleEdit = (id) => setEditingId(id);
  const handleCancel = () => setEditingId(null);

  const handleSave = async (col) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/collections/${col._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(col),
        }
      );

      if (!res.ok) throw new Error("Failed to update collection");

      const updated = await res.json();
      setCollections((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );

      setEditingId(null);
      setMessage("Collection updated successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/collections/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      setCollections((prev) => prev.filter((col) => col._id !== id));
      setDeleteId(null); // close modal
      setMessage("Collection deleted successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="text-center mb-4">Update Collection</h3>

      {message && <div className="alert alert-info text-center">{message}</div>}

      {/* FILTER */}
      <div className="row mb-3 g-2 align-items-end">
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
            <th>Collection Date</th>
            <th>Amount</th>
            <th>Payment Mode</th>
            <th>Purpose</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {collections.length > 0 ? (
            collections.map((col) => (
              <tr key={col._id}>
                <td>
                  {editingId === col._id ? (
                    <input
                      type="date"
                      value={col.collectionDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        handleChange("collectionDate", e.target.value)
                      }
                    />
                  ) : (
                    new Date(col.collectionDate).toLocaleDateString()
                  )}
                </td>
                <td>
                  {editingId === col._id ? (
                    <input
                      type="number"
                      value={col.collectionAmount || ""}
                      onChange={(e) =>
                        handleChange("collectionAmount", e.target.value)
                      }
                    />
                  ) : (
                    col.collectionAmount
                  )}
                </td>
                <td>
                  {editingId === col._id ? (
                    <select
                      className="form-select"
                      value={col.paymentMode || ""}
                      onChange={(e) =>
                        handleChange("paymentMode", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                    </select>
                  ) : (
                    col.paymentMode
                  )}
                </td>
                <td>
                  {editingId === col._id ? (
                    <select
                      className="form-select"
                      value={col.purpose || ""}
                      onChange={(e) => handleChange("purpose", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Market">Market</option>
                      <option value="Damage Collection">Damage Collection</option>
                      <option value="Market Return">Market Return</option>
                    </select>
                  ) : (
                    col.purpose
                  )}
                </td>
                <td>
                  {editingId === col._id ? (
                    <>
                      <button
                        className="btn btn-success me-2"
                        onClick={() => handleSave(col)}
                      >
                        Save
                      </button>
                      <button className="btn btn-secondary me-2" onClick={handleCancel}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary me-2"
                        onClick={() => handleEdit(col._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => setDeleteId(col._id)} // open modal
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No collections found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
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
                  onClick={() => setDeleteId(null)}
                ></button>
              </div>
              <div className="modal-body text-center">
                Are you sure you want to delete this collection?
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>
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