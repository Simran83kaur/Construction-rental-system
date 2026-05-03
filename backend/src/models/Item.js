import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  totalQuantity: Number,
  pricePerDay: Number, // 🔥 IMPORTANT
  imageUrl: String,
});

export const Item = mongoose.model("Item", itemSchema);