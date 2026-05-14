const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  customerName: { type: String },
  ownerName: { type: String },
  phone: { type: String },
  address: { type: String },
  collectionDate: { type: Date, required: true },
  collectionAmount: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  purpose: { type: String, required: true }, // <-- new field
}, { timestamps: true });

module.exports = mongoose.model("Collection", collectionSchema);
