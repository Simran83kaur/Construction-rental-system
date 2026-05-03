import mongoose from "mongoose";

const rentalItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  quantity: Number,
  issueDate: Date,
  returnDate: Date,

  pricePerDay: Number,
  totalDays: Number,
  totalCost: Number,
});

const rentalSchema = new mongoose.Schema(
  {
    customerName: String,
    phone: String,
    address: String,

    items: [rentalItemSchema],

    grandTotal: Number,
  },
  { timestamps: true }
);

export const Rental = mongoose.model("Rental", rentalSchema);