import { Item } from "../models/Item.js";
import { Rental } from "../models/Rental.js";
import { enrichRental } from "../services/enrichRental.js";

export const getItems = async (_req, res) => {
  const [items, rentals] = await Promise.all([
    Item.find().sort({ createdAt: -1 }),
    Rental.find(),
  ]);

  const enrichedRentals = rentals.map(enrichRental);

  const payload = items.map((item) => {
    const currentlyRentedQuantity = enrichedRentals
      .filter((rental) => String(rental.item) === String(item._id))
      .reduce((sum, rental) => sum + rental.remaining, 0);

    return {
      ...item.toObject(),
      currentlyRentedQuantity,
      availableQuantity: Math.max(item.totalQuantity - currentlyRentedQuantity, 0),
    };
  });

  res.json(payload);
};
