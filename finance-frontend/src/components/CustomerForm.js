import { useState } from "react";

export default function CustomerForm() {
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    address: "",
    customerType: "RPD", // ← NEW FIELD
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not authenticated");

      const response = await fetch("http://127.0.0.1:5000/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save customer");
      }

      setMessage("Customer saved successfully!");
      setFormData({
        name: "",
        ownerName: "",
        phone: "",
        address: "",
        customerType: "RPD",
      });
    } catch (err) {
      setMessage(err.message || "Error saving customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-start"
      style={{ minHeight: "80vh" }}
    >
      <div className="card p-4 w-100" style={{ maxWidth: "500px" }}>
        <h3 className="text-center mb-4">Create Customer</h3>

        <form onSubmit={handleSubmit}>
          {/* Business Name */}
          <div className="mb-3">
            <label className="form-label">Business Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Owner Name */}
          <div className="mb-3">
            <label className="form-label">Owner Name</label>
            <input
              type="text"
              name="ownerName"
              className="form-control"
              value={formData.ownerName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Address */}
          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* Customer Type Dropdown */}
          <div className="mb-3">
            <label className="form-label">Customer Type</label>
            <select
              name="customerType"
              className="form-select"
              value={formData.customerType}
              onChange={handleChange}
            >
              <option value="RPD">RPD</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Retailer">Retailer</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>

          {/* Message */}
          {message && (
            <div className="mt-3 alert alert-info text-center">{message}</div>
          )}
        </form>
      </div>
    </div>
  );
}
