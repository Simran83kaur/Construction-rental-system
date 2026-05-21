import { useEffect, useState } from "react";
import api from "../api";

export default function RecycleBinPage({ onChanged }) {
  const [data, setData] = useState({ customers: [], bills: [], transactions: [] });
  const [message, setMessage] = useState("");

  const loadDeleted = async () => {
    const res = await api.get("/recycle-bin");
    setData(res.data);
  };

  useEffect(() => {
    loadDeleted().catch(() => setMessage("Could not load recycle bin."));
  }, []);

  const restore = async (url) => {
    await api.put(url);
    await loadDeleted();
    onChanged();
  };

  const removeForever = async (url) => {
    await api.delete(url);
    await loadDeleted();
    onChanged();
  };

  return (
    <section className="page">
      <div className="page-header">
        <h2>Recycle Bin</h2>
        <p>Restore deleted records or permanently remove old mistakes.</p>
      </div>

      {message && <p className="entry-message">{message}</p>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name / Detail</th>
              <th>Deleted At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.customers.map((customer) => (
              <tr key={customer._id}>
                <td>Customer</td>
                <td>{customer.name} - {customer.mobile}</td>
                <td>{new Date(customer.deletedAt).toLocaleString()}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => restore(`/recycle-bin/customers/${customer._id}/restore`)}>Restore</button>
                    <button className="delete-button" type="button" onClick={() => removeForever(`/recycle-bin/customers/${customer._id}/permanent`)}>
                      Permanent Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {data.bills.map((bill) => (
              <tr key={bill._id}>
                <td>Bill</td>
                <td>{bill.billNumber || "No Bill No"} - {bill.customerName}</td>
                <td>{new Date(bill.deletedAt).toLocaleString()}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => restore(`/recycle-bin/bills/${bill._id}/restore`)}>Restore</button>
                    <button className="delete-button" type="button" onClick={() => removeForever(`/recycle-bin/bills/${bill._id}/permanent`)}>
                      Permanent Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {data.transactions.map((entry) => (
              <tr key={entry._id}>
                <td>Rental Entry</td>
                <td>{entry.customerName}: {entry.type} {entry.quantity} {entry.item} {entry.size || ""}</td>
                <td>{new Date(entry.deletedAt).toLocaleString()}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => restore(`/recycle-bin/customers/${entry.customerId}/transactions/${entry._id}/restore`)}>
                      Restore
                    </button>
                    <button className="delete-button" type="button" onClick={() => removeForever(`/recycle-bin/customers/${entry.customerId}/transactions/${entry._id}/permanent`)}>
                      Permanent Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!data.customers.length && !data.bills.length && !data.transactions.length && (
              <tr>
                <td colSpan="4">Recycle bin is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
