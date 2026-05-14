import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import API from "../services/api";
export default function ManagerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedType, setSelectedType] = useState("RPD");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totals, setTotals] = useState({
    totalInvoicesDate: 0,
    totalPaidDate: 0,
    totalDueDate: 0,
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await API.get("/customers", {
          headers: { Authorization: token },
        });
        const data = res.data;

        const customersWithType = data.map((c) => ({
          ...c,
          customerType: (c.customerType || "RPD").trim(),
        }));

        setCustomers(customersWithType);
        setAddresses([...new Set(customersWithType.map((c) => c.address))]);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load customers");
      }
    };
    fetchCustomers();
  }, [token]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const filteredCustomers = customers.filter((c) => {
          const typeMatch = selectedType
            ? c.customerType.toLowerCase() === selectedType.toLowerCase()
            : true;
          const addressMatch = selectedAddress
            ? c.address === selectedAddress
            : true;
          return typeMatch && addressMatch;
        });

        if (filteredCustomers.length === 0) {
          setSummary([]);
          setTotals({
            totalInvoicesDate: 0,
            totalPaidDate: 0,
            totalDueDate: 0,
          });
          return;
        }

        let totalInvoicesDate = 0,
          totalPaidDate = 0,
          totalDueDate = 0;

        const summaryData = [];

        for (const c of filteredCustomers) {
          const invoiceRes = await API.get(`/invoices/customer/${c._id}`, {
            headers: { Authorization: token },
          });
          const invoices = invoiceRes.data;

          const collectionRes = await API.get(
            `/collections/customer/${c._id}`,
            {
              headers: { Authorization: token },
            },
          );
          const collections = collectionRes.data;

          const totalInvAllCustomer = invoices.reduce(
            (sum, inv) => sum + inv.invoiceAmount,
            0,
          );
          const totalPaidAllCustomer = collections.reduce(
            (sum, col) => sum + col.collectionAmount,
            0,
          );
          const totalDueAllCustomer =
            totalInvAllCustomer - totalPaidAllCustomer;

          const from = fromDate ? new Date(fromDate) : null;
          const to = toDate ? new Date(toDate) : null;

          const invoicesDate = invoices.filter(
            (inv) =>
              (!from || new Date(inv.invoiceDate) >= from) &&
              (!to || new Date(inv.invoiceDate) <= to),
          );
          const collectionsDate = collections.filter(
            (col) =>
              (!from || new Date(col.collectionDate) >= from) &&
              (!to || new Date(col.collectionDate) <= to),
          );

          const totalInvDate = invoicesDate.reduce(
            (sum, inv) => sum + inv.invoiceAmount,
            0,
          );
          const totalPaidDateCustomer = collectionsDate.reduce(
            (sum, col) => sum + col.collectionAmount,
            0,
          );
          const dueDateCustomer = totalInvDate - totalPaidDateCustomer;

          totalInvoicesDate += totalInvDate;
          totalPaidDate += totalPaidDateCustomer;
          totalDueDate += dueDateCustomer;

          summaryData.push({
            ...c,
            totalDue: totalDueAllCustomer,
            dueDateRange: dueDateCustomer,
          });
        }

        setSummary(summaryData);
        setTotals({ totalInvoicesDate, totalPaidDate, totalDueDate });
      } catch (err) {
        console.error(err);
        setMessage("Failed to load dashboard summary");
      }
    };

    if (customers.length > 0) fetchSummary();
  }, [customers, selectedAddress, selectedType, fromDate, toDate, token]);

  const exportToExcel = () => {
    if (summary.length === 0) return alert("No data to export");

    const wb = XLSX.utils.book_new();
    const sheetData = summary.map((c) => ({
      Name: c.name,
      Phone: c.phone,
      Address: c.address,
      Type: c.customerType,
      "Total Due": c.totalDue,
      "Due (Date Range)": c.dueDateRange,
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
    XLSX.writeFile(wb, "dashboard_summary.xlsx");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">Manager Dashboard</h3>

      {message && <div className="alert alert-danger">{message}</div>}

      {/* Filters */}
      <div className="row g-3 mb-3">
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
        <div className="col-md-3">
          <label className="form-label">Filter by Address</label>
          <select
            className="form-select"
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
          >
            <option value="">-- All Addresses --</option>
            {addresses.map((addr) => (
              <option key={addr} value={addr}>
                {addr}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Filter by Type</label>
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All</option>
            <option value="RPD">RPD</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Retailer">Retailer</option>
          </select>
        </div>
      </div>

      {/* Date Range Cards with color */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div
            className="card text-center p-3 shadow-sm"
            style={{ backgroundColor: "#FF6B6B", color: "white" }}
          >
            <h6>Total Invoice (Date Range)</h6>
            <h5>₹{totals.totalInvoicesDate}</h5>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card text-center p-3 shadow-sm"
            style={{ backgroundColor: "#4ECDC4", color: "white" }}
          >
            <h6>Total Paid (Date Range)</h6>
            <h5>₹{totals.totalPaidDate}</h5>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card text-center p-3 shadow-sm"
            style={{ backgroundColor: "#FFD93D", color: "black" }}
          >
            <h6>Total Due (Date Range)</h6>
            <h5>₹{totals.totalDueDate}</h5>
          </div>
        </div>
      </div>

      {/* Customer Table (unchanged) */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Type</th>
              <th>Total Due</th>
              <th>Due (Date Range)</th>
            </tr>
          </thead>
          <tbody>
            {summary.length > 0 ? (
              summary.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.address}</td>
                  <td>{c.customerType}</td>
                  <td>₹{c.totalDue}</td>
                  <td>₹{c.dueDateRange}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Excel button */}
      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-success" onClick={exportToExcel}>
          Export to Excel
        </button>
      </div>
    </div>
  );
}
