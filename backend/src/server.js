import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import Customer from "./models/Customer.js";
import Item from "./models/Item.js";
import Bill from "./models/Bill.js";
import { loginAdmin, requireAdmin } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Baba Deep Singh Shuttering Store API running" });
});

app.post("/api/auth/login", loginAdmin);

app.get("/api/items", async (req, res) => {
  const items = await Item.find().sort({ name: 1 });
  res.json(items);
});

app.post("/api/items", requireAdmin, async (req, res) => {
  const item = await Item.create(req.body);
  res.status(201).json(item);
});

app.put("/api/items/:id", requireAdmin, async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

app.delete("/api/items/:id", requireAdmin, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item deleted" });
});

app.get("/api/customers", requireAdmin, async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
});

app.post("/api/customers", requireAdmin, async (req, res) => {
  const customer = await Customer.create({ ...req.body, transactions: [] });
  res.status(201).json(customer);
});

app.put("/api/customers/:id", requireAdmin, async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(customer);
});

app.delete("/api/customers/:id", requireAdmin, async (req, res) => {
  await Bill.deleteMany({ customer: req.params.id });
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Customer deleted" });
});

app.post("/api/customers/:id/transactions", requireAdmin, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  customer.transactions.push(...req.body.entries);
  await customer.save();
  res.status(201).json(customer);
});

app.put("/api/customers/:customerId/transactions/:transactionId", requireAdmin, async (req, res) => {
  const customer = await Customer.findById(req.params.customerId);
  const transaction = customer.transactions.id(req.params.transactionId);
  Object.assign(transaction, req.body);
  await customer.save();
  res.json(customer);
});

app.delete("/api/customers/:customerId/transactions/:transactionId", requireAdmin, async (req, res) => {
  const customer = await Customer.findById(req.params.customerId);
  customer.transactions.id(req.params.transactionId).deleteOne();
  await customer.save();
  res.json(customer);
});

app.get("/api/bills", requireAdmin, async (req, res) => {
  const bills = await Bill.find().sort({ createdAt: -1 });
  res.json(bills);
});

app.post("/api/bills", requireAdmin, async (req, res) => {
  const bill = await Bill.create(req.body);
  res.status(201).json(bill);
});

app.put("/api/bills/:id", requireAdmin, async (req, res) => {
  const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(bill);
});

app.delete("/api/bills/:id", requireAdmin, async (req, res) => {
  await Bill.findByIdAndDelete(req.params.id);
  res.json({ message: "Bill deleted" });
});

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
