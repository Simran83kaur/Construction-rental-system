import { useState } from "react";
import itemImageMap from "../itemImages";

const items = [
  {
    name: "Shuttering Plate",
    price: 5,
    sizes: ["4x2", "4x21","4x18", "4x15", "4x12", "4x9", "4x6", "3x2", "3x21", "3x18","3x15", "3x12", "3x9", "3x6","3x4","2x2","24x18","24x15","24x9","18x18","18x15","18x9","12x12","Mixed"],
  },
  { name: "Channel", price: 5, sizes: ["14ft","12ft", "11ft", "10ft", "9ft", "8ft", "7ft", "6ft", "5ft","4ft","3ft"] },
  { name: "Spot", 
    variants: [
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
  { name: "Gadar", price: 5, sizes: ["16ft","15ft","14ft","13ft", "12ft", "11ft", "10ft", "9ft", "8ft","7ft"] },
  { name: "Farma",
    variants: [
      { size: "9x9 - 6ft", price: 100 },
      { size: "9x6 - 4ft", price: 80 },
      { size: "9x12 - 4ft", price: 80 }
    ] 
  },
  {
    name: "Scaffolding Frame",
    variants: [
      { size: "5ft", price: 30 },
      { size: "6ft", price: 40 },
      { size: "10ft", price: 50 },
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
    variants: [
      { size: "5'", price: 100 },
      { size: "6'", price: 150 },
    ] },
  { name: "Grinder", price: 100 },
];

const getSizes = (itemName) => {
  const item = items.find((i) => i.name === itemName);
  if (!item) return [];
  if (item.priceOptions) return item.priceOptions.map((o) => o.size);
  return item.sizes || [];
};

const createRow = () => ({
  id: crypto.randomUUID(),
  type: "Issue",
  item: items[0].name,
  size: getSizes(items[0].name)[0] || "",
  quantity: "",
  date: "",
});

export default function CustomersPage({
  customers,
  onAddCustomer,
  onDeleteCustomer,
  onAddTransactions,
  isOwner,
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [entryRows, setEntryRows] = useState([createRow()]);
  const [message, setMessage] = useState("");

  const addCustomer = (e) => {
    e.preventDefault();
    if (!isOwner) return;
    if (!name || !mobile) return;

    onAddCustomer({ name, mobile });
    setName("");
    setMobile("");
  };

  const addRow = () => {
    setEntryRows((prev) => [...prev, createRow()]);
  };

  const updateRow = (id, field, value) => {
    setEntryRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        if (field === "item") {
          return {
            ...row,
            item: value,
            size: getSizes(value)[0] || "",
          };
        }

        return { ...row, [field]: value };
      })
    );
  };

  const saveEntries = (e) => {
    e.preventDefault();
    if (!isOwner) return;

    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    const entries = entryRows.map((r) => ({
      id: crypto.randomUUID(),
      type: r.type,
      item: r.item,
      size: r.size,
      quantity: Number(r.quantity) || 0,
      date: r.date,
    }));

    onAddTransactions(selectedCustomerId, entries);
    setEntryRows([createRow()]);
    setMessage("Entries saved successfully");
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <section className="page">
      <div className="page-header">
        <h2>Customers</h2>
        <p>{isOwner ? "Add customers and manage entries." : "Owner Access Restricted"}</p>
      </div>

      {/* ADD CUSTOMER */}
      {isOwner && (
        <form className="form-card ledger-form" onSubmit={addCustomer}>
          <input placeholder="Customer Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          <button type="submit">Add Customer</button>
        </form>
      )}

      {/* CUSTOMER LIST */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.mobile}</td>
              <td>
                <div className="row-actions">
                  <button type="button" onClick={() => setSelectedCustomerId(c.id)}>View Entries</button>
                  {isOwner && <button className="delete-button" type="button" onClick={() => onDeleteCustomer(c.id)}>Delete</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ENTRY SYSTEM */}
      {selectedCustomer && (
        <div>
          <h3>{selectedCustomer.name}</h3>

          {isOwner && (
            <form onSubmit={saveEntries}>
              {entryRows.map((row) => (
                <div className="entry-row" key={row.id}>
                
                  <select value={row.type} onChange={(e) => updateRow(row.id, "type", e.target.value)}>
                    <option>Issue</option>
                    <option>Return</option>
                  </select>

                  <select value={row.item} onChange={(e) => updateRow(row.id, "item", e.target.value)}>
                    {items.map((i) => (
                      <option key={i.name}>{i.name}</option>
                    ))}
                  </select>

                  <select value={row.size} onChange={(e) => updateRow(row.id, "size", e.target.value)}>
                    {getSizes(row.item).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                  />

                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateRow(row.id, "date", e.target.value)}
                  />
                </div>
              ))}

              <div className="button-row">
                <button className="secondary-button" type="button" onClick={addRow}>+ Add Row</button>
                <button type="submit">Save Entries</button>
              </div>
            </form>
          )}

          {message && <p>{message}</p>}

          {/* TRANSACTIONS */}
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Item</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {selectedCustomer.transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.type}</td>

                  <td style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {itemImageMap[t.item] && (
                      <img src={itemImageMap[t.item]} width="30" />
                    )}
                    {t.item}
                  </td>

                  <td>{t.size}</td>
                  <td>{t.quantity}</td>
                  <td>{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </section>
  );
}
