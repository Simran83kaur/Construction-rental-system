import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, default: 0 },
    sizes: [{ type: String }],
    variants: [variantSchema],
    imageKey: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
