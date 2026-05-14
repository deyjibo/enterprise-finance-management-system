import { useEffect, useState } from "react";
import Select from "react-select";
import API from "../services/api";
export default function InvoiceForm() {
  const [customers, setCustomers] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    customer: "",
    customerName: "",
    ownerName: "",
    address: "",
    phone: "",
    invoiceDate: "",
    invoiceAmount: "",
    billNo: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ================= FETCH CUSTOMERS =================
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await API.get("/customers");

        const data = res.data;
        setCustomers(data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load customers");
      }
    };
    fetchCustomers();
  }, [token]);

  // ================= HANDLE SELECT =================
  const handleCustomerChange = (selected) => {
    if (!selected) return;

    const customer = customers.find((c) => c._id === selected.value);

    if (customer) {
      setInvoiceData({
        ...invoiceData,
        customer: customer._id,
        customerName: customer.name,
        ownerName: customer.ownerName,
        address: customer.address,
        phone: customer.phone,
      });
    }
  };

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await API.post("/invoices", invoiceData);

      setMessage("Invoice saved successfully!");

      setInvoiceData({
        customer: "",
        customerName: "",
        ownerName: "",
        address: "",
        phone: "",
        invoiceDate: "",
        invoiceAmount: "",
        billNo: "",
      });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= OPTIONS =================
  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  return (
    <div className="d-flex justify-content-center align-items-start py-4">
      <div className="card shadow-sm p-4 w-100" style={{ maxWidth: "700px" }}>
        <h3 className="text-center mb-4">Invoice Entry</h3>

        {message && (
          <div className="alert alert-info text-center">{message}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ✅ UPDATED CUSTOMER SELECT */}
          <div className="mb-3">
            <label className="form-label">Customer Name</label>

            <Select
              options={customerOptions}
              value={
                customerOptions.find(
                  (opt) => opt.value === invoiceData.customer,
                ) || null
              }
              onChange={handleCustomerChange}
              placeholder="Search Customer..."
              isClearable
              // 🔥 SAME FIX AS STATEMENT
              menuPortalTarget={document.body}
              menuPosition="fixed"
              menuShouldScrollIntoView={false}
              styles={{
                menuList: (base) => ({
                  ...base,
                  maxHeight: "none",
                  overflow: "visible",
                }),
              }}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Owner Name</label>
              <input
                type="text"
                className="form-control"
                value={invoiceData.ownerName}
                readOnly
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                value={invoiceData.phone}
                readOnly
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              value={invoiceData.address}
              readOnly
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                className="form-control"
                value={invoiceData.invoiceDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Bill No</label>
              <input
                type="text"
                name="billNo"
                className="form-control"
                value={invoiceData.billNo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Invoice Amount</label>
            <input
              type="number"
              name="invoiceAmount"
              className="form-control"
              value={invoiceData.invoiceAmount}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}
