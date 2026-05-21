import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema(
  {
    item: String,
    itemName: String,
    size: String,
    quantity: Number,
    issueDate: String,
    returnDate: String,
    period: String,
    days: Number,
    price: Number,
    total: Number,
    returnedQuantity: Number,
    status: String,
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String, unique: true, sparse: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true },
    items: [billItemSchema],
    pendingItems: [
      {
        item: String,
        size: String,
        quantity: Number,
        issueDate: String,
      },
    ],
    grandTotal: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    payableTotal: { type: Number, default: 0 },
    advancePayment: { type: Number, default: 0 },
    paymentMode: { type: String, default: "Cash" },
    finalBalance: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
