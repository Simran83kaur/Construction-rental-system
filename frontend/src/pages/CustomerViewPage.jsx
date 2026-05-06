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
