const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,   // ✅ auto convert to UPPERCASE
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    customerType: {
      type: String,
      enum: ["RPD", "Wholesale", "Retailer"],
      default: "RPD",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);