import { calculateRentalFinancials } from "../utils/rentalMath.js";

export const enrichRental = (rentalDoc) => {
  const rental = rentalDoc.toObject ? rentalDoc.toObject() : rentalDoc;
  const financials = calculateRentalFinancials(rental);

  return {
    ...rental,
    ...financials,
    status: financials.remaining === 0 ? "returned" : "active",
  };
};
