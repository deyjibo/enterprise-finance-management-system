const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  customerName: { type: String, required: true },
  ownerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  invoiceAmount: { type: Number, required: true },
  billNo: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
