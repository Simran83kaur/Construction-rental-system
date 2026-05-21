import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Issue", "Return"], required: true },
    item: { type: String, required: true },
    size: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    date: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    transactions: [transactionSchema],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
