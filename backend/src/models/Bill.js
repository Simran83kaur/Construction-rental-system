import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema(
  {
    item: String,
    size: String,
    quantity: Number,
    issueDate: String,
    returnDate: String,
    period: String,
    days: Number,
    price: Number,
    total: Number,
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true },
    items: [billItemSchema],
    grandTotal: { type: Number, default: 0 },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
