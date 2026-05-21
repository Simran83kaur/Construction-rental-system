const items = [
  { name: "Shuttering Plate", price: 5 },
  { name: "Channel", price: 5 },
  {
    name: "Spot",
    priceOptions: [
      { size: "11ft", price: 2 },
      { size: "10ft", price: 2 },
      { size: "9ft", price: 2 },
      { size: "8ft", price: 2 },
      { size: "7ft", price: 2 },
      { size: "12ft", price: 3 },
      { size: "13ft", price: 3 },
      { size: "Mixed", price: 3 },
    ],
  },
  { name: "Chali", price: 10 },
  { name: "Ghan", price: 20 },
  { name: "Paudi", price: 0 },
  { name: "Peti", price: 2 },
  { name: "Drum", price: 25 },
  { name: "Vaans", price: 5 },
  { name: "Gadar", price: 5 },
  {
    name: "Farma",
    priceOptions: [
      { size: "9x9 - 6ft", price: 100 },
      { size: "9x6 - 4ft", price: 80 },
      { size: "9x12 - 4ft", price: 80 },
    ],
  },
  {
    name: "Scaffolding Frame",
    priceOptions: [
      { size: "5ft", price: 15 },
      { size: "6ft", price: 20 },
      { size: "10ft", price: 30 },
    ],
  },
  { name: "Kainchi", price: 0 },
  { name: "Danda", price: 0 },
  { name: "Fatti", price: 2 },
  { name: "Helti", price: 500 },
  { name: "Vibrator", price: 300 },
  { name: "Durmat Machine", price: 500 },
  { name: "Lifting Machine", price: 500 },
  {
    name: "Cutter",
    priceOptions: [
      { size: "5'", price: 100 },
      { size: "6'", price: 150 },
    ],
  },
  { name: "Grinder", price: 100 },
];

const clean = (value) => String(value || "").trim();

const getPrice = (itemName, size) => {
  const item = items.find((currentItem) => currentItem.name.toLowerCase() === clean(itemName).toLowerCase());
  if (!item) return 0;
  if (item.priceOptions) {
    return item.priceOptions.find((option) => option.size === clean(size))?.price || item.priceOptions[0].price;
  }
  return item.price || 0;
};

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

const displayDate = (date) => {
  const value = new Date(date);
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  return `${day}-${month}-${year}`;
};

const inclusiveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 0;
};

const makeRow = ({ lot, quantity, returnDate, status }) => {
  const days = inclusiveDays(lot.issueDate, returnDate);
  const price = getPrice(lot.item, lot.size);

  return {
    item: lot.item,
    size: lot.size,
    issueDate: lot.issueDate,
    returnDate,
    period: `${lot.issueDate} to ${returnDate}`,
    displayPeriod: `${displayDate(lot.issueDate)} to ${displayDate(returnDate)} (${days} days)`,
    quantity,
    returnedQuantity: status === "Returned" ? quantity : 0,
    days,
    price,
    status,
    amount: days * quantity * price,
  };
};

const calculateBill = (transactions) => {
  const activeTransactions = (transactions || [])
    .filter((transaction) => !transaction.deletedAt)
    .sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      if (a.type === b.type) return 0;
      return a.type === "Issue" ? -1 : 1;
    });

  const openLots = [];
  const breakdown = [];

  activeTransactions.forEach((transaction) => {
    const quantity = Number(transaction.quantity) || 0;
    if (!quantity || !transaction.date) return;

    if (transaction.type === "Issue") {
      openLots.push({
        item: transaction.item,
        size: transaction.size || "",
        quantity,
        remaining: quantity,
        issueDate: transaction.date,
        status: "Issued",
      });
      return;
    }

    let returnQuantity = quantity;
    openLots.forEach((lot) => {
      const sameItem = clean(lot.item).toLowerCase() === clean(transaction.item).toLowerCase();
      const sameSize = clean(lot.size) === clean(transaction.size);
      if (!sameItem || !sameSize || lot.remaining <= 0 || returnQuantity <= 0) return;

      const closedQuantity = Math.min(lot.remaining, returnQuantity);
      breakdown.push(makeRow({ lot, quantity: closedQuantity, returnDate: transaction.date, status: "Returned" }));
      lot.remaining -= closedQuantity;
      returnQuantity -= closedQuantity;
    });
  });

  const today = formatDate(new Date());
  const pendingItems = openLots
    .filter((lot) => lot.remaining > 0)
    .map((lot) => ({
      item: lot.item,
      size: lot.size,
      quantity: lot.remaining,
      issueDate: lot.issueDate,
    }));

  pendingItems.forEach((item) => {
    breakdown.push(
      makeRow({
        lot: { item: item.item, size: item.size, issueDate: item.issueDate },
        quantity: item.quantity,
        returnDate: today,
        status: "Issued",
      })
    );
  });

  return {
    breakdown,
    pendingItems,
    grandTotal: breakdown.reduce((total, row) => total + row.amount, 0),
  };
};

export default {
  calculateBill,
  displayDate,
  formatDate,
  getPrice,
};
