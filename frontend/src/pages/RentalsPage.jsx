import { useEffect, useState } from "react";
import html2canvas from "html2canvas";

const items = [
  {
    name: "Shuttering Plate",
    price: 5,
    sizes: ["4x2", "4x21","4x18", "4x15", "4x12", "4x9", "4x6", "3x2", "3x21", "3x18","3x15", "3x12", "3x9", "3x6","3x4","2x2","24x18","24x15","24x9","18x18","18x15","18x9","12x12","Mixed"],
  },
  { name: "Channel", price: 5, sizes: ["14ft","12ft", "11ft", "10ft", "9ft", "8ft", "7ft", "6ft", "5ft","4ft","3ft"] },
  { name: "Spot", 
    priceOptions: [
      { size: "11ft", price: 2 },
      { size: "10ft", price: 2 },
      { size: "9ft", price: 2 },
      { size: "8ft", price: 2 },
      { size: "7ft", price: 2 },
      { size: "12ft", price: 3 },
      { size: "13ft", price: 3 }
    ]
  },
  { name: "Chali", price: 10, sizes: ["10ft","9ft", "8ft", "7ft", "6ft"] },
  { name: "Ghan", price: 20 },
  { name: "Gadar", price: 5, sizes: ["16ft","15ft","14ft","13ft", "12ft", "11ft", "10ft", "9ft", "8ft","7ft"] },
  { name: "Farma",
    priceOptions: [
      { size: "9x9 - 6ft", price: 100 },
      { size: "9x6 - 4ft", price: 80 },
      { size: "9x12 - 4ft", price: 80 }
    ] 
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
  { name: "Cutter",
    priceOptions: [
      { size: "5'", price: 100 },
      { size: "6'", price: 150 },
    ] },
  { name: "Grinder", price: 100 },
];



const getPrice = (itemName, size) => {
  const item = items.find((currentItem) => currentItem.name === itemName) || items[0];
  if (item.priceOptions) {
    return item.priceOptions.find((option) => option.size === size)?.price || item.priceOptions[0].price;
  }
  return item.price || 0;
};

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

const inclusiveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 0;
};

const calculateBill = (transactions) => {
  const groups = {};

  transactions.forEach((transaction) => {
    const key = `${transaction.item}-${transaction.size}`;
    groups[key] = groups[key] || {};
    groups[key][transaction.date] = groups[key][transaction.date] || {
      item: transaction.item,
      size: transaction.size,
      issue: 0,
      return: 0,
    };

    if (transaction.type === "Issue") {
      groups[key][transaction.date].issue += transaction.quantity;
    } else {
      groups[key][transaction.date].return += transaction.quantity;
    }
  });

  const breakdown = [];
  const pendingItems = [];

  Object.values(groups).forEach((dateMap) => {
    const dates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
    let activeQty = 0;
    let lastEntry = null;

    dates.forEach((date, index) => {
      const entry = dateMap[date];
      lastEntry = entry;
      activeQty += entry.issue;
      activeQty -= entry.return;
      activeQty = Math.max(0, activeQty);

      if (activeQty === 0) return;

      const nextDate = dates[index + 1] || formatDate(new Date());
      const days = inclusiveDays(date, nextDate);
      const price = getPrice(entry.item, entry.size);

      if (days > 0) {
        breakdown.push({
          item: entry.item,
          size: entry.size,
          period: `${date} to ${nextDate}`,
          quantity: activeQty,
          days,
          price,
          amount: days * activeQty * price,
        });
      }
    });

    if (activeQty > 0 && lastEntry) {
      pendingItems.push({
        item: lastEntry.item,
        size: lastEntry.size,
        quantity: activeQty,
      });
    }
  });

  return {
    breakdown,
    pendingItems,
    grandTotal: breakdown.reduce((total, row) => total + row.amount, 0),
  };
};

export default function RentalsPage({ customers, bills, onSaveBill, onDeleteBill, isOwner }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const selectedCustomer = customers.find((customer) => String(customer.id) === String(selectedCustomerId));
  const bill = selectedCustomer ? calculateBill(selectedCustomer.transactions) : { breakdown: [], pendingItems: [], grandTotal: 0 };

  if (!isOwner) {
    return (
      <section className="page">
        <div className="page-header">
          <h2>Rentals</h2>
          <p>Owner Access Restricted</p>
        </div>
        <div className="card">
          <p className="empty-text">Billing and financial calculations are visible only in owner access mode.</p>
        </div>
      </section>
    );
  }

  const saveBill = () => {
    if (!selectedCustomer) return;
    onSaveBill({
      customer: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: formatDate(new Date()),
      items: bill.breakdown.map((row) => ({
        item: row.item,
        size: row.size,
        quantity: row.quantity,
        period: row.period,
        days: row.days,
        price: row.price,
        total: row.amount,
      })),
      pendingItems: bill.pendingItems,
      grandTotal: bill.grandTotal,
    });
    setMessage("Bill saved.");
  };

  const downloadBillImage = async () => {
    const billElement = document.getElementById("bill");
    if (!billElement) return;

    const canvas = await html2canvas(billElement, { backgroundColor: "#ffffff", scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `bill-${selectedCustomer.name.replaceAll(" ", "-")}.png`;
    link.click();
  };

  return (
    <section className="page">
      <div className="page-header">
        <h2>Rentals</h2>
        <p>Automatic bill calculation from issue and return entries.</p>
      </div>

      <div className="card">
        <h3>Generate Customer Bill</h3>
        <div className="customer-line">
          <label>
            Customer
            <select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {selectedCustomer && (
        <div className="card bill-card">
          <div className="invoice-card" id="bill">
            <div className="invoice-watermark">Baba Deep Singh Shuttering Store</div>
            <div className="stamp">Baba Deep Singh Shuttering Store</div>
            <div className="invoice-header">
              <h2>Baba Deep Singh Shuttering Store</h2>
              <p>Smalsar, Moga, Punjab | +91 98144-24655</p>
            </div>
            <div className="invoice-meta">
              <p><strong>Customer Name:</strong> {selectedCustomer.name}</p>
              <p><strong>Date:</strong> {formatDate(new Date())}</p>
            </div>

            {bill.breakdown.length > 0 ? (
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Days</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.breakdown.map((row, index) => (
                    <tr key={`${row.item}-${row.size}-${row.period}-${index}`}>
                      <td>{row.item}</td>
                      <td>{row.size || "-"}</td>
                      <td>{row.quantity}</td>
                      <td>{row.days}</td>
                      <td>Rs. {row.price}</td>
                      <td>Rs. {row.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-text">No completed rental intervals found for this customer yet.</p>
            )}

            <div className="pending-box">
              <h3>Pending Items</h3>
              {bill.pendingItems.length > 0 ? (
                bill.pendingItems.map((item) => (
                  <span className="pending-pill" key={`${item.item}-${item.size}`}>
                    {item.item} ({item.size || "No size"}) → {item.quantity} remaining
                  </span>
                ))
              ) : (
                <span className="returned-pill">All items returned</span>
              )}
            </div>
            <div className="grand-total">Grand Total: Rs. {bill.grandTotal.toLocaleString("en-IN")}</div>
          </div>

          <div className="button-row">
            <button className="return-button" type="button" onClick={saveBill}>
              Save Bill
            </button>
            <button type="button" onClick={downloadBillImage}>
              Download Bill Image
            </button>
          </div>
          {message && <p className="entry-message">{message}</p>}
        </div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((savedBill, index) => (
              <tr key={savedBill.id}>
                <td>{index + 1}</td>
                <td>{savedBill.customerName}</td>
                <td>{savedBill.date}</td>
                <td>Rs. {savedBill.grandTotal.toLocaleString("en-IN")}</td>
                <td>
                  <button className="details-button remove-button" type="button" onClick={() => onDeleteBill(savedBill.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
