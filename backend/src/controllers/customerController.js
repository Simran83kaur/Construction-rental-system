import { Customer } from "../models/Customer.js";
import { Rental } from "../models/Rental.js";
import { enrichRental } from "../services/enrichRental.js";

export const getCustomers = async (_req, res) => {
  const customers = await Customer.find().sort({ name: 1 });
  res.json(customers);
};

export const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const rentals = await Rental.find({ customer: customer._id })
    .populate("item")
    .sort({ issueDate: -1 });

  res.json({
    customer,
    rentals: rentals.map(enrichRental),
  });
};
