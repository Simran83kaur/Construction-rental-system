import mongoose from "mongoose";
import dotenv from "dotenv";
import { Item } from "./models/Item.js";

// ✅ .env load (VERY IMPORTANT)
dotenv.config({ path: "../.env" });

// ✅ correct variable
const MONGO_URI = "mongodb://127.0.0.1:27017/construction-rental-store";

const seedItems = async () => {
  try {
    // 🔍 debug check
    console.log("Mongo URI:", MONGO_URI);

    await mongoose.connect(MONGO_URI);

    await Item.deleteMany();

    const plateSizes = ["4x2","4x18","4x15","4x12","4x9","4x6","3x2","3x18","3x15","3x12","3x9","3x6","Mixed"];
    const spotSizes = ["12ft","11ft","10ft","9ft"];
    const channelSizes = ["14ft","12ft","11ft","10ft","9ft","8ft","7ft","6ft","5ft"];

    const items = [
      { name: "Frame 5ft", category: "Scaffolding", pricePerDay: 30, totalQuantity: 0 },
      { name: "Frame 6ft", category: "Scaffolding", pricePerDay: 30, totalQuantity: 0 },
      { name: "Frame 10ft", category: "Scaffolding", pricePerDay: 30, totalQuantity: 0 },
      { name: "Kainchi", category: "Scaffolding", pricePerDay: 0, totalQuantity: 0 },
      { name: "Danda", category: "Scaffolding", pricePerDay: 0, totalQuantity: 0 },
      { name: "Chali", category: "Scaffolding", pricePerDay: 10, totalQuantity: 0 },

      ...plateSizes.map(size => ({
        name: `Plate ${size}`,
        category: "Plates",
        pricePerDay: 5,
        totalQuantity: 0
      })),

      ...spotSizes.map(size => ({
        name: `Spot ${size}`,
        category: "Spot",
        pricePerDay: 2,
        totalQuantity: 0
      })),

      ...channelSizes.map(size => ({
        name: `Channel ${size}`,
        category: "Channel",
        pricePerDay: 5,
        totalQuantity: 0
      })),

      { name: "Frame 9x9", category: "Frame", pricePerDay: 30, totalQuantity: 0 },

      { name: "Vibrator", category: "Machine", pricePerDay: 200, totalQuantity: 0 },
      { name: "Lifting Machine", category: "Machine", pricePerDay: 500, totalQuantity: 0 },
      { name: "Durmat Machine", category: "Machine", pricePerDay: 500, totalQuantity: 0 },
      { name: "Cutter", category: "Machine", pricePerDay: 100, totalQuantity: 0 },
      { name: "Grinder", category: "Machine", pricePerDay: 100, totalQuantity: 0 },
    ];

    await Item.insertMany(items);

    console.log("✅ Items inserted successfully");
    process.exit();
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
};

seedItems();