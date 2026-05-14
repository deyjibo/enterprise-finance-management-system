import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Select from "react-select";
import API from "../services/api";
export default function Statement() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [collections, setCollections] = useState([]);
  const [totals, setTotals] = useState({
    totalPurchaseAll: 0,
    totalPaidAll: 0,
    dueAmountAll: 0,
    totalPurchaseDate: 0,
    totalPaidDate: 0,
    dueAmountDate: 0,
  });
  const [message, setMessage] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const token = localStorage.getItem("token");

  // ================= FETCH CUSTOMERS =================
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await API.get("/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setCustomers(data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load customers");
      }
    };
    fetchCustomers();
  }, [token]);

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!selectedCustomer) return;

    const fetchData = async () => {
      try {
        const invoiceRes = await API.get(
          `/invoices/customer/${selectedCustomer}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const invoiceData = invoiceRes.data;

        const collectionRes = await API.get(
          `/collections/customer/${selectedCustomer}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const collectionData = collectionRes.data;

        const totalPurchaseAll = invoiceData.reduce(
          (sum, inv) => sum + inv.invoiceAmount,
          0,
        );

        const totalPaidAll = collectionData.reduce(
          (sum, col) => sum + col.collectionAmount,
          0,
        );

        const dueAmountAll = totalPurchaseAll - totalPaidAll;

        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        const filteredInvoices =
          from || to
            ? invoiceData.filter((inv) => {
                const d = new Date(inv.invoiceDate);
                return (!from || d >= from) && (!to || d <= to);
              })
            : invoiceData;

        const filteredCollections =
          from || to
            ? collectionData.filter((col) => {
                const d = new Date(col.collectionDate);
                return (!from || d >= from) && (!to || d <= to);
              })
            : collectionData;

        const totalPurchaseDate = filteredInvoices.reduce(
          (sum, inv) => sum + inv.invoiceAmount,
          0,
        );

        const totalPaidDate = filteredCollections.reduce(
          (sum, col) => sum + col.collectionAmount,
          0,
        );

        const dueAmountDate = totalPurchaseDate - totalPaidDate;

        setInvoices(filteredInvoices);
        setCollections(filteredCollections);

        setTotals({
          totalPurchaseAll,
          totalPaidAll,
          dueAmountAll,
          totalPurchaseDate,
          totalPaidDate,
          dueAmountDate,
        });
      } catch (err) {
        console.error(err);
        setMessage("Failed to load statement data");
      }
    };

    fetchData();
  }, [selectedCustomer, fromDate, toDate, token]);

  // ================= EXPORT EXCEL =================
  const exportAsExcel = () => {
    if (!selectedCustomer) return alert("Select a customer first");

    const wb = XLSX.utils.book_new();
    const sheetData = [];
    const maxRows = Math.max(invoices.length, collections.length);

    for (let i = 0; i < maxRows; i++) {
      sheetData.push({
        "Bill No": invoices[i]?.billNo || "",
        "Invoice Date": invoices[i]
          ? new Date(invoices[i].invoiceDate).toLocaleDateString()
          : "",
        "Invoice Amount": invoices[i]?.invoiceAmount || "",
        "Collection Date": collections[i]
          ? new Date(collections[i].collectionDate).toLocaleDateString()
          : "",
        "Collection Amount": collections[i]?.collectionAmount || "",
        "Payment Mode": collections[i]?.paymentMode || "",
        Purpose: collections[i]?.purpose || "",
      });
    }

    sheetData.push({
      "Bill No": "Totals",
      "Invoice Amount": totals.totalPurchaseDate,
      "Collection Amount": totals.totalPaidDate,
      "Payment Mode": `Due: ${totals.dueAmountDate}`,
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Statement");
    XLSX.writeFile(wb, `customer_${selectedCustomer}_statement.xlsx`);
  };

  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  return (
    <div className="container-fluid py-4" style={{ overflow: "visible" }}>
      <h3 className="text-center mb-4">Customer Statement</h3>

      {message && <div className="alert alert-info text-center">{message}</div>}

      {/* Filters */}
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
            placeholder="Search Customer..."
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "38px",
              }),
              menu: (base) => ({
                ...base,
                maxHeight: "none",
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: "none",
                overflow: "visible",
              }),
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

        <div className="col-md-2 mt-2">
          <button className="btn btn-success w-100" onClick={exportAsExcel}>
            Export as Excel
          </button>
        </div>
      </div>

      {selectedCustomer && (
        <>
          {/* CARDS */}
          <div className="row mb-4 g-3">
            <div className="col-md-4">
              <div className="card text-center p-3 shadow-sm bg-danger text-white">
                <h6>Total Purchase (All)</h6>
                <h5>₹{totals.totalPurchaseAll}</h5>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center p-3 shadow-sm bg-info text-white">
                <h6>Total Paid (All)</h6>
                <h5>₹{totals.totalPaidAll}</h5>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center p-3 shadow-sm bg-warning">
                <h6>Due Amount (All)</h6>
                <h5>₹{totals.dueAmountAll}</h5>
              </div>
            </div>
          </div>

          {/* TABLES */}
          <div className="row g-3" style={{ overflow: "visible" }}>
            <div className="col-md-6">
              <table className="table table-bordered table-striped text-center">
                <thead className="table-dark">
                  <tr>
                    <th>Bill No</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv._id}>
                        <td>{inv.billNo || "-"}</td>
                        <td>
                          {new Date(inv.invoiceDate).toLocaleDateString()}
                        </td>
                        <td>₹{inv.invoiceAmount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No invoices</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="col-md-6">
              <table className="table table-bordered table-striped text-center">
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.length > 0 ? (
                    collections.map((col) => (
                      <tr key={col._id}>
                        <td>
                          {new Date(col.collectionDate).toLocaleDateString()}
                        </td>
                        <td>₹{col.collectionAmount}</td>
                        <td>{col.paymentMode}</td>
                        <td>{col.purpose}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No collections</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
