const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const diffInDays = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diff = Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY);
  return Math.max(diff, 1);
};

export const calculateRentalFinancials = (rental, asOf = new Date()) => {
  const issueDate = new Date(rental.issueDate);
  const sortedReturns = [...(rental.returns || [])].sort(
    (a, b) => new Date(a.returnDate) - new Date(b.returnDate)
  );

  const returnHistory = sortedReturns.map((entry) => {
    const totalDays = diffInDays(issueDate, entry.returnDate);
    const entryBill = entry.quantityReturned * rental.pricePerDay * totalDays;

    return {
      ...entry.toObject?.(),
      quantityReturned: entry.quantityReturned,
      returnDate: entry.returnDate,
      totalDays,
      entryBill,
    };
  });

  const returnedBill = returnHistory.reduce(
    (sum, entry) => sum + entry.entryBill,
    0
  );
  const totalReturned = returnHistory.reduce(
    (sum, entry) => sum + entry.quantityReturned,
    0
  );
  const remaining = Math.max(rental.quantityGiven - totalReturned, 0);
  const activeDays = remaining > 0 ? diffInDays(issueDate, asOf) : 0;
  const activeBill = remaining * rental.pricePerDay * activeDays;
  const totalBill = returnedBill + activeBill;
  const amountPaid = rental.amountPaid || 0;
  const remainingAmount = Math.max(totalBill - amountPaid, 0);

  return {
    totalReturned,
    remaining,
    activeDays,
    returnedBill,
    activeBill,
    totalBill,
    amountPaid,
    remainingAmount,
    paymentStatus: remainingAmount > 0 ? "unpaid" : "paid",
    returnHistory,
  };
};
