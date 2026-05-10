import { useEffect, useState } from "react";
import api from "../api";
import itemImageMap from "../itemImages";

export default function ItemsPage({ isOwner }) {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  const loadItems = async () => {
    try {
      const res = await api.get("/items");
      setItems(res.data);
    } catch {
      setMessage("Could not load items.");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const deleteItem = async (id) => {
    if (!isOwner) return;
    await api.delete(`/items/${id}`);
    loadItems();
  };

  const priceText = (item) => {
    if (item.variants?.length) {
      return item.variants.map((variant) => `${variant.size}: Rs. ${variant.price}`).join(", ");
    }
    return `Rs. ${item.price || 0}`;
  };

  return (
    <section className="page">
      <div className="page-header">
        <h2>Items</h2>
        <p>{isOwner ? "Owner item list with database prices." : "Owner Access Restricted"}</p>
      </div>

      {message && <p className="entry-message">{message}</p>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Item Name</th>
              {isOwner && <th>Price per Day</th>}
              {isOwner && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item._id || item.id || item.name}>
                <td>{index + 1}</td>
                <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {itemImageMap[item.imageKey || item.name] && (
                    <img src={itemImageMap[item.imageKey || item.name]} alt={item.name} width="40" height="40" style={{ borderRadius: "5px" }} />
                  )}
                  {item.name}
                </td>
                {isOwner && <td>{priceText(item)}</td>}
                {isOwner && (
                  <td>
                    <button className="details-button remove-button" type="button" onClick={() => deleteItem(item._id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
