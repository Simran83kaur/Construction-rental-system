import express from "express";
import { Rental } from "../models/Rental.js";
import { Item } from "../models/Item.js";

const router = express.Router();

// 🔥 CREATE BILL
router.post("/", async (req, res) => {
  try {
    const { customerName, phone, address, items } = req.body;

    let grandTotal = 0;

    const processedItems = await Promise.all(
      items.map(async (i) => {
        const itemData = await Item.findById(i.item);

        const pricePerDay = itemData.pricePerDay;

        const issue = new Date(i.issueDate);
        const ret = new Date(i.returnDate);

        const totalDays =
          Math.ceil((ret - issue) / (1000 * 60 * 60 * 24)) || 1;

        const totalCost = totalDays * pricePerDay * i.quantity;

        grandTotal += totalCost;

        return {
          item: i.item,
          quantity: i.quantity,
          issueDate: issue,
          returnDate: ret,
          pricePerDay,
          totalDays,
          totalCost,
        };
      })
    );

    const rental = new Rental({
      customerName,
      phone,
      address,
      items: processedItems,
      grandTotal,
    });

    await rental.save();

    res.json(rental);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating bill" });
  }
});

export default router;