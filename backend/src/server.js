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
const CLIENT_URL = process.env.CLIENT_URL;
const allowedOrigins = CLIENT_URL ? CLIENT_URL.split(",").map((url) => url.trim()) : [];

app.use(
  cors({
    origin: allowedOrigins.length ? [...allowedOrigins, "http://localhost:5173"] : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

const activeOnly = { deletedAt: null };

const getNextBillNumber = async () => {
  const lastBill = await Bill.findOne({ billNumber: /^BILL-/ }).sort({ createdAt: -1 });
  const lastNumber = Number(lastBill?.billNumber?.replace("BILL-", "")) || 1000;
  return `BILL-${lastNumber + 1}`;
};

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
  const customers = await Customer.find(activeOnly).sort({ createdAt: -1 });
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
  const deletedAt = new Date();
  await Bill.updateMany({ customer: req.params.id, deletedAt: null }, { deletedAt });
  await Customer.findByIdAndUpdate(req.params.id, { deletedAt });
  res.json({ message: "Customer deleted" });
});

app.post("/api/customers/:id/transactions", requireAdmin, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  customer.transactions.push(...req.body.entries.map((entry) => ({ ...entry, deletedAt: null })));
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
  const transaction = customer.transactions.id(req.params.transactionId);
  transaction.deletedAt = new Date();
  await customer.save();
  res.json(customer);
});

app.get("/api/bills", requireAdmin, async (req, res) => {
  const bills = await Bill.find(activeOnly).sort({ createdAt: -1 });
  res.json(bills);
});

app.post("/api/bills", requireAdmin, async (req, res) => {
  const bill = await Bill.create({
    ...req.body,
    billNumber: req.body.billNumber || (await getNextBillNumber()),
    pendingAmount: req.body.pendingAmount ?? req.body.pendingPayment ?? 0,
    advancePayment: req.body.advancePayment ?? req.body.paidAmount ?? 0,
    finalBalance: req.body.finalBalance ?? req.body.balanceAmount ?? 0,
    deletedAt: null,
  });
  res.status(201).json(bill);
});

app.put("/api/bills/:id", requireAdmin, async (req, res) => {
  const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(bill);
});

app.delete("/api/bills/:id", requireAdmin, async (req, res) => {
  await Bill.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
  res.json({ message: "Bill deleted" });
});

app.get("/api/recycle-bin", requireAdmin, async (req, res) => {
  const [customers, bills] = await Promise.all([
    Customer.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Bill.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
  ]);

  const transactions = [];
  const activeCustomers = await Customer.find(activeOnly);
  activeCustomers.forEach((customer) => {
    customer.transactions
      .filter((transaction) => transaction.deletedAt)
      .forEach((transaction) => {
        transactions.push({
          ...transaction.toObject(),
          customerId: customer._id,
          customerName: customer.name,
        });
      });
  });

  res.json({ customers, bills, transactions });
});

app.put("/api/recycle-bin/customers/:id/restore", requireAdmin, async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { deletedAt: null }, { new: true });
  res.json(customer);
});

app.delete("/api/recycle-bin/customers/:id/permanent", requireAdmin, async (req, res) => {
  await Bill.deleteMany({ customer: req.params.id });
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Customer permanently deleted" });
});

app.put("/api/recycle-bin/bills/:id/restore", requireAdmin, async (req, res) => {
  const bill = await Bill.findByIdAndUpdate(req.params.id, { deletedAt: null }, { new: true });
  res.json(bill);
});

app.delete("/api/recycle-bin/bills/:id/permanent", requireAdmin, async (req, res) => {
  await Bill.findByIdAndDelete(req.params.id);
  res.json({ message: "Bill permanently deleted" });
});

app.put("/api/recycle-bin/customers/:customerId/transactions/:transactionId/restore", requireAdmin, async (req, res) => {
  const customer = await Customer.findById(req.params.customerId);
  const transaction = customer.transactions.id(req.params.transactionId);
  transaction.deletedAt = null;
  await customer.save();
  res.json(customer);
});

app.delete("/api/recycle-bin/customers/:customerId/transactions/:transactionId/permanent", requireAdmin, async (req, res) => {
  const customer = await Customer.findById(req.params.customerId);
  customer.transactions.id(req.params.transactionId).deleteOne();
  await customer.save();
  res.json(customer);
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
