import { useState } from "react";
import itemImageMap from "../itemImages";

const items = [
  {
    name: "Shuttering Plate",
    price: 5,
    sizes: ["4x2", "4x18", "4x12", "4x15", "4x9", "4x6", "3x2", "3x18", "3x12", "3x15", "3x9", "3x6","Mixed"],
  },
  { name: "Channel", price: 5, sizes: ["12ft", "11ft", "10ft", "9ft", "8ft", "7ft", "6ft", "5ft"] },
  { name: "Spot", price: 2, sizes: ["12ft", "11ft", "10ft", "9ft"] },
  { name: "Chali", price: 10, sizes: ["10ft"] },
  { name: "Gadar", price: 5, sizes: ["13ft", "12ft", "11ft", "10ft", "9ft", "8ft"] },
  { name: "Farma", price: 60, sizes: ["9x9"] },
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
  { name: "Lifting Machine", price: 500 },
  { name: "Cutter", price: 100 },
  { name: "Grinder", price: 100 },
];

export default function CustomerViewPage() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <section className="customer-view">
      <div className="customer-hero">
        <div>
          <h1>Welcome to Baba Deep Singh Shuttering Store</h1>
          <p>View rental items and available sizes before contacting the shop.</p>
        </div>
        <div className="owner-card">
          <p><strong>Owner:</strong> Krishan Singh</p>
          <p>📞 +91 98144-24655</p>
          <p>📍 Smalsar, Moga, Punjab</p>
        </div>
      </div>

      <div className="customer-item-grid">
        {items.map((item) => (
          <button className="customer-item-card" key={item.name} type="button" onClick={() => setSelectedItem(item)}>
            <img
              alt={item.name}
              src={itemImageMap[item.name] || "/images/item-placeholder.svg"}
              onError={(event) => {
                event.currentTarget.src = "/images/item-placeholder.svg";
              }}
            />
            <h3>{item.name}</h3>
            <p>View available sizes</p>
          </button>
        ))}
      </div>

      {selectedItem && (
        <div className="card">
          <img
            alt={selectedItem.name}
            className="selected-item-image"
            src={itemImageMap[selectedItem.name] || "/images/item-placeholder.svg"}
            onError={(event) => {
              event.currentTarget.src = "/images/item-placeholder.svg";
            }}
          />
          <h3>{selectedItem.name}</h3>
          <p>
            <strong>Sizes:</strong>{" "}
            {selectedItem.priceOptions
              ? selectedItem.priceOptions.map((option) => option.size).join(", ")
              : selectedItem.sizes?.join(", ") || "No size"}
          </p>
        </div>
      )}
    </section>
  );
}
