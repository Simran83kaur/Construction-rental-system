import { Customer } from "../models/Customer.js";
import { Item } from "../models/Item.js";
import { Rental } from "../models/Rental.js";
import { enrichRental } from "../services/enrichRental.js";

const getItemAvailability = async (itemId) => {
  const [item, rentals] = await Promise.all([
    Item.findById(itemId),
    Rental.find({ item: itemId }),
  ]);

  if (!item) {
    return { item: null, availableQuantity: 0 };
  }

  const currentlyRented = rentals
    .map(enrichRental)
    .reduce((sum, rental) => sum + rental.remaining, 0);

  return {
    item,
    availableQuantity: Math.max(item.totalQuantity - currentlyRented, 0),
  };
};

export const getRentals = async (_req, res) => {
  const rentals = await Rental.find()
    .populate("customer")
    .populate("item")
    .sort({ issueDate: -1 });

  res.json(rentals.map(enrichRental));
};

export const createRental = async (req, res) => {
  const { customer, item: itemId, quantity, issueDate, pricePerDay } = req.body;
  const parsedQuantity = Number(quantity);
  const parsedPricePerDay = Number(pricePerDay);

  if (!customer || !itemId || !quantity || !issueDate || !pricePerDay) {
    return res.status(400).json({ message: "All rental fields are required" });
  }

  if (parsedQuantity <= 0 || parsedPricePerDay < 0) {
    return res
      .status(400)
      .json({ message: "Quantity must be positive and price cannot be negative" });
  }

  const [customerDoc, availability] = await Promise.all([
    Customer.findById(customer),
    getItemAvailability(itemId),
  ]);

  if (!customerDoc) {
    return res.status(404).json({ message: "Customer not found" });
  }

  if (!availability.item) {
    return res.status(404).json({ message: "Item not found" });
  }

  if (Number(quantity) > availability.availableQuantity) {
    return res.status(400).json({
      message: `Only ${availability.availableQuantity} units are currently available`,
    });
  }

  if (new Date(issueDate) > new Date()) {
    return res.status(400).json({ message: "Issue date cannot be in the future" });
  }

  const rental = await Rental.create({
    customer,
    item: itemId,
    quantityGiven: parsedQuantity,
    issueDate,
    pricePerDay: parsedPricePerDay,
    remaining: parsedQuantity,
    totalReturned: 0,
    status: "active",
  });

  const savedRental = await Rental.findById(rental._id)
    .populate("customer")
    .populate("item");

  res.status(201).json(enrichRental(savedRental));
};

export const addRentalReturn = async (req, res) => {
  const { quantityReturned, returnDate, amountPaid } = req.body;
  const parsedQuantityReturned = Number(quantityReturned);
  const parsedAmountPaid = Number(amountPaid || 0);

  if (!quantityReturned || !returnDate) {
    return res
      .status(400)
      .json({ message: "Return quantity and return date are required" });
  }

  const rental = await Rental.findById(req.params.id)
    .populate("customer")
    .populate("item");

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }

  if (parsedQuantityReturned <= 0) {
    return res.status(400).json({ message: "Return quantity must be positive" });
  }

  if (new Date(returnDate) < new Date(rental.issueDate)) {
    return res
      .status(400)
      .json({ message: "Return date cannot be earlier than the issue date" });
  }

  if (parsedQuantityReturned > rental.remaining) {
    return res.status(400).json({
      message: `Only ${rental.remaining} units remain for this rental`,
    });
  }

  rental.returns.push({
    quantityReturned: parsedQuantityReturned,
    returnDate,
  });

  rental.totalReturned += parsedQuantityReturned;
  rental.remaining = Math.max(rental.quantityGiven - rental.totalReturned, 0);
  rental.status = rental.remaining === 0 ? "returned" : "active";

  if (parsedAmountPaid > 0) {
    rental.amountPaid += parsedAmountPaid;
  }

  await rental.save();

  const updatedRental = await Rental.findById(rental._id)
    .populate("customer")
    .populate("item");

  res.json(enrichRental(updatedRental));
};
