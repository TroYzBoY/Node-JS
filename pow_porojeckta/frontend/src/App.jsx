import { useEffect, useState } from "react";

const API_BASE = "/api";

function App() {
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [filters, setFilters] = useState({ search: "", role: "", page: 1 });
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Ready");

  const setStatusValue = (value) => {
    setStatus(typeof value === "string" ? value : JSON.stringify(value, null, 2));
  };

  const saveToken = (token) => {
    if (token) localStorage.setItem("token", token);
  };

  const getToken = () => localStorage.getItem("token") || "";

  const request = async (path, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const loadUsers = async () => {
    try {
      const qs = new URLSearchParams();
      if (filters.search) qs.append("search", filters.search);
      if (filters.role) qs.append("role", filters.role);
      qs.append("page", String(filters.page || 1));
      qs.append("limit", "10");

      const data = await request(`/users?${qs.toString()}`);
      setUsers(data?.data?.users || []);
      setStatusValue({
        status: data.status,
        page: data?.pagination?.page,
        pages: data?.pagination?.pages,
        total: data?.pagination?.total
      });
    } catch (err) {
      setUsers([]);
      setStatusValue(err.message);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm)
      });
      saveToken(data.token);
      setStatusValue(data);
      loadUsers();
    } catch (err) {
      setStatusValue(err.message);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm)
      });
      saveToken(data.token);
      setStatusValue(data);
      loadUsers();
    } catch (err) {
      setStatusValue(err.message);
    }
  };

  const onFilter = async (e) => {
    e.preventDefault();
    loadUsers();
  };

  const onDeleteUser = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      await request(`/users/${id}`, { method: "DELETE" });
      setStatusValue(`User deleted: ${id}`);
      loadUsers();
    } catch (err) {
      setStatusValue(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main className="container">
      <h1>Mini Production App</h1>
      <p className="subtitle">Simple React frontend for register, login, and user list.</p>

      <section className="card">
        <h2>Register</h2>
        <form onSubmit={onRegister}>
          <input
            type="text"
            placeholder="Username"
            required
            value={registerForm.username}
            onChange={(e) => setRegisterForm((p) => ({ ...p, username: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={registerForm.email}
            onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            minLength={6}
            required
            value={registerForm.password}
            onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
          />
          <button type="submit">Register</button>
        </form>
      </section>

      <section className="card">
        <h2>Login</h2>
        <form onSubmit={onLogin}>
          <input
            type="email"
            placeholder="Email"
            required
            value={loginForm.email}
            onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={loginForm.password}
            onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
          />
          <button type="submit">Login</button>
        </form>
      </section>

      <section className="card">
        <h2>Users</h2>
        <form className="inline" onSubmit={onFilter}>
          <input
            type="text"
            placeholder="Search username/email"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
          />
          <select value={filters.role} onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}>
            <option value="">All roles</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <input
            type="number"
            min="1"
            value={filters.page}
            onChange={(e) => setFilters((p) => ({ ...p, page: Number(e.target.value || 1) }))}
          />
          <button type="submit">Load</button>
        </form>

        <div id="users">
          {users.length === 0 && <p>No users found.</p>}
          {users.map((u) => (
            <div className="user-item" key={u.id}>
              <div className="user-top">
                <div>
                  <strong>{u.username}</strong> ({u.role})
                  <br />
                  <span>{u.email}</span>
                  <br />
                  <small>{new Date(u.createdAt).toLocaleString()}</small>
                </div>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDeleteUser(u.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Status</h2>
        <pre>{status}</pre>
      </section>
    </main>
  );
}

export default App;
