import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerViewPage from "./pages/CustomerViewPage";
import ItemsPage from "./pages/ItemsPage";
import RentalsPage from "./pages/RentalsPage";

const IS_OWNER = true;

const pages = [
  { key: "dashboard", label: "Ledger", icon: "📒" },
  { key: "customers", label: "Customers", icon: "👤" },
  { key: "items", label: "Items", icon: "📦" },
  { key: "rentals", label: "Rentals", icon: "🧾" },
];

const initialCustomers = [
  {
    id: 1,
    name: "Ramesh Construction",
    mobile: "9876543210",
    transactions: [
      { id: 1, type: "Issue", item: "Shuttering Plate", size: "4x2", quantity: 10, date: "2026-05-01" },
      { id: 2, type: "Return", item: "Shuttering Plate", size: "4x2", quantity: 4, date: "2026-05-05" },
      { id: 3, type: "Return", item: "Shuttering Plate", size: "4x2", quantity: 6, date: "2026-05-15" },
      { id: 4, type: "Issue", item: "Channel", size: "10ft", quantity: 5, date: "2026-05-01" },
      { id: 5, type: "Return", item: "Channel", size: "10ft", quantity: 5, date: "2026-05-05" },
    ],
  },
  { id: 2, name: "Sharma Builders", mobile: "9123456780", transactions: [] },
  { id: 3, name: "Khan Contractor", mobile: "9988776655", transactions: [] },
  { id: 4, name: "Patel Site Work", mobile: "9090909090", transactions: [] },
];

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (customers, bills) => {
  try {
    localStorage.setItem("rms_customers", JSON.stringify(customers));
    localStorage.setItem(
      "rms_transactions",
      JSON.stringify(customers.flatMap((customer) => customer.transactions.map((entry) => ({ ...entry, customerId: customer.id }))))
    );
    localStorage.setItem("rms_bills", JSON.stringify(bills));
  } catch {
    return;
  }
};

export default function App() {
  const [mode, setMode] = useState(IS_OWNER ? "owner" : "customer");
  const [activePage, setActivePage] = useState("dashboard");
  const [customers, setCustomers] = useState(() => readStorage("rms_customers", initialCustomers));
  const [bills, setBills] = useState(() => readStorage("rms_bills", []));

  const saveCustomers = (nextCustomers) => {
    setCustomers(nextCustomers);
    writeStorage(nextCustomers, bills);
  };

  const saveBills = (nextBills) => {
    setBills(nextBills);
    writeStorage(customers, nextBills);
  };

  const addCustomer = (customer) => {
    if (!IS_OWNER) return;
    saveCustomers([
      ...customers,
      { id: Date.now(), name: customer.name, mobile: customer.mobile, transactions: [] },
    ]);
  };

  const deleteCustomer = (id) => {
    if (!IS_OWNER) return;
    saveCustomers(customers.filter((customer) => customer.id !== id));
  };

  const addTransactions = (customerId, entries) => {
    if (!IS_OWNER) return;
    const nextCustomers = customers.map((customer) =>
      customer.id === Number(customerId)
        ? {
            ...customer,
            transactions: [
              ...customer.transactions,
              ...entries.map((entry, index) => ({ ...entry, id: Date.now() + index })),
            ],
          }
        : customer
    );

    saveCustomers(nextCustomers);
  };

  const saveBill = (bill) => {
    if (!IS_OWNER) return;
    saveBills([{ ...bill, id: Date.now() }, ...bills]);
  };

  const renderOwnerPage = () => {
    if (activePage === "customers") {
      return (
        <CustomersPage
          customers={customers}
          onAddCustomer={addCustomer}
          onDeleteCustomer={deleteCustomer}
          onAddTransactions={addTransactions}
          isOwner={IS_OWNER}
        />
      );
    }
    if (activePage === "items") return <ItemsPage isOwner={IS_OWNER} />;
    if (activePage === "rentals") return <RentalsPage customers={customers} bills={bills} onSaveBill={saveBill} isOwner={IS_OWNER} />;
    return <DashboardPage customers={customers} onDeleteCustomer={deleteCustomer} isOwner={IS_OWNER} />;
  };

  return (
    <div className={mode === "owner" ? "app" : "app customer-app"}>
      {IS_OWNER && mode === "owner" && (
        <aside className="sidebar">
          <div className="shop-card">
            <div className="shop-icon">🏗️</div>
            <h1>Baba Deep Singh Shuttering Store</h1>
            <p>Name: Krishan Singh</p>
            <p>📞 +91 98144-24655</p>
            <p>📍 Smalsar, Moga, Punjab</p>
          </div>
          <nav>
            {pages.map((page) => (
              <button
                key={page.key}
                className={activePage === page.key ? "nav-button active" : "nav-button"}
                onClick={() => setActivePage(page.key)}
                type="button"
              >
                <span>{page.icon}</span>
                {page.label}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <main className={mode === "owner" ? "content" : "content customer-content"}>
        <div className="mode-switch">
          {IS_OWNER && (
            <button className={mode === "owner" ? "active" : ""} type="button" onClick={() => setMode("owner")}>
              Owner View
            </button>
          )}
          <button className={mode === "customer" ? "active" : ""} type="button" onClick={() => setMode("customer")}>
            Customer View
          </button>
        </div>
        {IS_OWNER && mode === "owner" ? renderOwnerPage() : <CustomerViewPage />}
      </main>
    </div>
  );
}
