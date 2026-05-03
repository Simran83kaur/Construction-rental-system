import { useState } from "react";

const items = [
  { name: "Shuttering Plate", price: 5 },
  { name: "Channel", price: 5 },
  { name: "Spot", price: 2 },
  { name: "Chali", price: 10 },
  { name: "Gadar", price: 5 },
  { name: "Farma", price: 60 },
  {
    name: "Scaffolding Frame",
    priceOptions: [
      { size: "5ft", price: 30 },
      { size: "6ft", price: 40 },
      { size: "10ft", price: 50 },
    ],
  },
  { name: "Kainchi", price: 0 },
  { name: "Danda", price: 0 },
  { name: "Durmat Machine", price: 500 },
  { name: "Lifting Machine", price: 300 },
  { name: "Cutter", price: 100 },
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

  Object.values(groups).forEach((dateMap) => {
    const dates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
    let activeQty = 0;

    dates.forEach((date, index) => {
      const entry = dateMap[date];
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
  });

  return {
    breakdown,
    grandTotal: breakdown.reduce((total, row) => total + row.amount, 0),
  };
};

export default function DashboardPage({ customers, onDeleteCustomer, isOwner }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  const viewTransactions = (customerId) => {
    setSelectedCustomerId(customerId);
    setTimeout(() => {
      document.getElementById("transaction-details")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  return (
    <section className="page">
      <div className="page-header">
        <h2>Ledger</h2>
        <p>{isOwner ? "View customers, pending rent, and saved issue/return entries." : "Owner Access Restricted"}</p>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Customer Name</th>
              <th>Mobile Number</th>
              {isOwner && <th>Pending Payment</th>}
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer.id}>
                <td>{index + 1}</td>
                <td>{customer.name}</td>
                <td>{customer.mobile}</td>
                {isOwner && <td>Rs. {calculateBill(customer.transactions).grandTotal.toLocaleString("en-IN")}</td>}
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => viewTransactions(customer.id)}>
                      View Entries
                    </button>
                    {isOwner && (
                      <button className="delete-button" type="button" onClick={() => onDeleteCustomer(customer.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="card" id="transaction-details">
          <h3>Entries: {selectedCustomer.name}</h3>
          {selectedCustomer.transactions.length > 0 ? (
            <div className="table-card nested-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Quantity</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...selectedCustomer.transactions]
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <span className={transaction.type === "Issue" ? "status issue" : "status return"}>
                            {transaction.type}
                          </span>
                        </td>
                        <td>{transaction.item}</td>
                        <td>{transaction.size || "-"}</td>
                        <td>{transaction.quantity}</td>
                        <td>{transaction.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-text">No entries found for this customer yet.</p>
          )}
        </div>
      )}
    </section>
  );
}
