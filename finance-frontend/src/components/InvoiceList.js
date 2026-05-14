import { useEffect, useState } from "react";
import API from "../services/api";
import InvoiceForm from "./InvoiceForm";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);

  const fetchInvoices = async () => {
    try {
      const res = await API.get("/invoices");
      setInvoices(res.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div>
      <InvoiceForm />
      <div className="card p-3 my-2">
        <h5>Invoices</h5>
        {invoices.length === 0 && <p>No invoices yet.</p>}
        <ul>
          {invoices.map((inv) => (
            <li key={inv._id}>
              {inv.billNo} - Customer: {inv.customerName} | Billed: ₹
              {inv.invoiceAmount} | Remaining Due: ₹{inv.remainingDue}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
