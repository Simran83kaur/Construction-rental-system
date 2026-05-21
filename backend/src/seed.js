import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import Item from "./models/Item.js";

dotenv.config();

const items = [
  {
    name: "Shuttering Plate",
    price: 5,
    sizes: ["4x2", "4x18", "4x12", "4x15", "4x9", "4x6", "3x2", "3x18", "3x12", "3x15", "3x9", "3x6"],
    imageKey: "Shuttering Plate",
  },
  { name: "Channel", price: 5, sizes: ["12ft", "11ft", "10ft", "9ft", "8ft", "7ft", "6ft", "5ft"] },
  { name: "Spot", price: 2, sizes: ["12ft", "11ft", "10ft", "9ft"], imageKey: "Spot" },
  { name: "Chali", price: 10, sizes: ["10ft"] },
  { name: "Gadar", price: 5, sizes: ["13ft", "12ft", "11ft", "10ft", "9ft", "8ft"] },
  { name: "Farma", price: 60, sizes: ["9x9"] },
  {
    name: "Scaffolding Frame",
    variants: [
      { size: "5ft", price: 30 },
      { size: "6ft", price: 40 },
      { size: "10ft", price: 50 },
    ],
    imageKey: "Scaffolding Frame",
  },
  { name: "Kainchi", price: 0 },
  { name: "Danda", price: 0 },
  { name: "Durmat Machine", price: 500, imageKey: "Durmat Machine" },
  { name: "Lifting Machine", price: 300, imageKey: "Lifting Machine" },
  { name: "Cutter", price: 100, imageKey: "Cutter" },
  { name:"Vibrator", price: 300, imageKey: "Vibrator" },
  { name: "Grinder", price: 100, imageKey: "Grinder" },
];

const seed = async () => {
  await connectDatabase();
  await Item.deleteMany({});
  await Item.insertMany(items);
  console.log("Items seeded");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
