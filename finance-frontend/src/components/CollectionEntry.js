import { useEffect, useState } from "react";
import Select from "react-select";

export default function CollectionEntry() {
  const [customers, setCustomers] = useState([]);
  const [collectionData, setCollectionData] = useState({
    customer: "",
    customerName: "",
    ownerName: "",
    phone: "",
    address: "",
    collectionDate: "",
    collectionAmount: "",
    paymentMode: "",
    purpose: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    data: c,
  }));

  // Handle select
  const handleCustomerSelect = (selected) => {
    if (selected) {
      const customer = selected.data;
      setCollectionData({
        ...collectionData,
        customer: customer._id,
        customerName: customer.name,
        ownerName: customer.ownerName || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    } else {
      setCollectionData({
        ...collectionData,
        customer: "",
        customerName: "",
        ownerName: "",
        phone: "",
        address: "",
      });
    }
  };

  const handleChange = (e) => {
    setCollectionData({ ...collectionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(collectionData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save collection");
      }

      setMessage("Collection saved successfully!");
      setCollectionData({
        customer: "",
        customerName: "",
        ownerName: "",
        phone: "",
        address: "",
        collectionDate: "",
        collectionAmount: "",
        paymentMode: "",
        purpose: "",
      });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="text-center mb-4">Collection Entry</h3>

      {message && (
        <div className="alert alert-info text-center">{message}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          
          {/* LEFT SIDE */}
          <div className="col-md-6">
            <div className="card p-3 h-100 shadow-sm">

              {/* ✅ SEARCHABLE DROPDOWN */}
              <div className="mb-3">
                <label className="form-label">Customer</label>

                <Select
                  options={customerOptions}
                  value={
                    customerOptions.find(
                      (opt) => opt.value === collectionData.customer
                    ) || null
                  }
                  onChange={handleCustomerSelect}
                  placeholder="Search Customer..."
                  isClearable

                  // 🔥 IMPORTANT FIX (no scrollbar, no UI change)
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}

                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: "none",
                      overflow: "visible",
                    }),
                  }}
                />
              </div>

              {/* Auto Fields */}
              <div className="mb-3">
                <label className="form-label">Owner Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={collectionData.ownerName}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={collectionData.phone}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  value={collectionData.address}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-md-6">
            <div className="card p-3 h-100 shadow-sm">

              <div className="mb-3">
                <label className="form-label">Collection Date</label>
                <input
                  type="date"
                  name="collectionDate"
                  className="form-control"
                  value={collectionData.collectionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Collection Amount</label>
                <input
                  type="number"
                  name="collectionAmount"
                  className="form-control"
                  value={collectionData.collectionAmount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Payment Mode</label>
                <select
                  name="paymentMode"
                  className="form-select"
                  value={collectionData.paymentMode}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Purpose</label>
                <select
                  name="purpose"
                  className="form-select"
                  value={collectionData.purpose}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="Damage Collection">Damage Collection</option>
                  <option value="From Market">From Market</option>
                  <option value="Market Return">Market Return</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mt-3"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Collection"}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}