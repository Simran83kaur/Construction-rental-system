import { useEffect, useState } from "react";
import api, { setAuthToken } from "./api";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerViewPage from "./pages/CustomerViewPage";
import ItemsPage from "./pages/ItemsPage";
import RentalsPage from "./pages/RentalsPage";

const pages = [
  { key: "dashboard", label: "Ledger", icon: "📒" },
  { key: "customers", label: "Customers", icon: "👤" },
  { key: "items", label: "Items", icon: "📦" },
  { key: "rentals", label: "Rentals", icon: "🧾" },
];

const normalizeCustomer = (customer) => ({
  ...customer,
  id: customer._id || customer.id,
  transactions: customer.transactions || [],
});

const normalizeBill = (bill) => ({ ...bill, id: bill._id || bill.id });

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [mode, setMode] = useState(token ? "owner" : "customer");
  const [activePage, setActivePage] = useState("dashboard");
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const isAdmin = Boolean(token);

  const loadAdminData = async (adminToken = token) => {
    if (!adminToken) return;
    setAuthToken(adminToken);
    const [customerRes, billRes] = await Promise.all([api.get("/customers"), api.get("/bills")]);
    setCustomers(customerRes.data.map(normalizeCustomer));
    setBills(billRes.data.map(normalizeBill));
  };

  useEffect(() => {
    if (token) {
      loadAdminData(token).catch(() => setMessage("Could not load admin data."));
    }
  }, [token]);

  const login = async (event) => {
    event.preventDefault();
    try {
      const res = await api.post("/auth/login", loginForm);
      localStorage.setItem("adminToken", res.data.token);
      setAuthToken(res.data.token);
      setToken(res.data.token);
      setMode("owner");
      setMessage("");
    } catch {
      setMessage("Invalid admin credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAuthToken("");
    setToken("");
    setMode("customer");
    setCustomers([]);
    setBills([]);
  };

  const addCustomer = async (customer) => {
    const res = await api.post("/customers", customer);
    setCustomers((current) => [normalizeCustomer(res.data), ...current]);
  };

  const deleteCustomer = async (id) => {
    await api.delete(`/customers/${id}`);
    setCustomers((current) => current.filter((customer) => customer.id !== id));
  };

  const addTransactions = async (customerId, entries) => {
    const res = await api.post(`/customers/${customerId}/transactions`, { entries });
    setCustomers((current) => current.map((customer) => (customer.id === customerId ? normalizeCustomer(res.data) : customer)));
  };

  const deleteTransaction = async (customerId, transactionId) => {
    const res = await api.delete(`/customers/${customerId}/transactions/${transactionId}`);
    setCustomers((current) => current.map((customer) => (customer.id === customerId ? normalizeCustomer(res.data) : customer)));
  };

  const saveBill = async (bill) => {
    const res = await api.post("/bills", bill);
    setBills((current) => [normalizeBill(res.data), ...current]);
  };

  const deleteBill = async (billId) => {
    await api.delete(`/bills/${billId}`);
    setBills((current) => current.filter((bill) => bill.id !== billId));
  };

  const renderOwnerPage = () => {
    if (!isAdmin) {
      return (
        <div className="card">
          <h3>Admin Login</h3>
          <form className="login-form" onSubmit={login}>
            <input
              placeholder="Username"
              value={loginForm.username}
              onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
            />
            <input
              placeholder="Password"
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            />
            <button type="submit">Login</button>
          </form>
          {message && <p className="entry-message">{message}</p>}
        </div>
      );
    }

    if (activePage === "customers") {
      return (
        <CustomersPage
          customers={customers}
          onAddCustomer={addCustomer}
          onDeleteCustomer={deleteCustomer}
          onAddTransactions={addTransactions}
          onDeleteTransaction={deleteTransaction}
          isOwner={isAdmin}
        />
      );
    }
    if (activePage === "items") return <ItemsPage isOwner={isAdmin} />;
    if (activePage === "rentals") return <RentalsPage customers={customers} bills={bills} onSaveBill={saveBill} onDeleteBill={deleteBill} isOwner={isAdmin} />;
    return <DashboardPage customers={customers} onDeleteCustomer={deleteCustomer} isOwner={isAdmin} />;
  };

  return (
    <div className={mode === "owner" ? "app" : "app customer-app"}>
      {isAdmin && mode === "owner" && (
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
          {isAdmin ? (
            <>
              <button className={mode === "owner" ? "active" : ""} type="button" onClick={() => setMode("owner")}>
                Admin View
              </button>
              <button className={mode === "customer" ? "active" : ""} type="button" onClick={() => setMode("customer")}>
                Customer View
              </button>
              <button type="button" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className={mode === "owner" ? "active" : ""} type="button" onClick={() => setMode("owner")}>
              Admin Login
            </button>
          )}
        </div>
        {mode === "owner" ? renderOwnerPage() : <CustomerViewPage />}
      </main>
    </div>
  );
}
