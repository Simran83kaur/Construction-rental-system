import { Customer } from "../models/Customer.js";
import { Item } from "../models/Item.js";
import { Rental } from "../models/Rental.js";
import { enrichRental } from "../services/enrichRental.js";

export const getDashboard = async (_req, res) => {
  try {
    const [customers, items, rentals] = await Promise.all([
      Customer.countDocuments(),
      Item.find().sort({ createdAt: -1 }),
      Rental.find().populate("items.item")
    ]);

    // safely enrich rentals
    const enrichedRentals = rentals.map((rental) => {
      try {
        return enrichRental(rental);
      } catch (err) {
        console.log("enrichRental error:", err.message);

        // IMPORTANT: return safe normalized structure
        return {
          ...rental.toObject(),
          remaining: 0,
          totalBill: 0,
          amountPaid: 0,
          remainingAmount: 0,
        };
      }
    });

    // total items currently rented
    const itemsCurrentlyRented = enrichedRentals.reduce(
      (sum, rental) => sum + (rental.remaining || 0),
      0
    );

    // item inventory calculation
    const itemInventory = items.map((item) => {
      const rentedQuantity = enrichedRentals
        .filter((rental) =>
          rental.items?.some(
            (i) => String(i.item?._id) === String(item._id)
          )
        )
        .reduce((sum, rental) => sum + (rental.remaining || 0), 0);

      return {
        ...item.toObject(),
        currentlyRentedQuantity: rentedQuantity,
        availableQuantity: Math.max(item.totalQuantity - rentedQuantity, 0),
      };
    });

    const availableInventory = itemInventory.reduce(
      (sum, item) => sum + item.availableQuantity,
      0
    );

    return res.json({
      stats: {
        totalCustomers: customers,
        totalItems: items.length,
        itemsCurrentlyRented,
        availableInventory,
      },
      items: itemInventory,
      activeRentals: enrichedRentals,
    });

  } catch (error) {
    console.error("Dashboard error:", error.message);
    return res.status(500).json({
      message: "Dashboard failed",
      error: error.message,
    });
  }
};