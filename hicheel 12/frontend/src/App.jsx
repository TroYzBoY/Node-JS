import { useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Registering..." });

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      console.log("Register response:", data);

      if (!res.ok) {
        setStatus({ type: "error", message: data.message || "Register failed." });
        return;
      }

      setStatus({ type: "success", message: data.message });
      setUser(data.user || null);
    } catch (error) {
      console.error("Register error:", error);
      setStatus({ type: "error", message: "Server error." });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Logging in..." });

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        setStatus({ type: "error", message: data.message || "Login failed." });
        return;
      }

      setStatus({ type: "success", message: data.message });
      setUser(data.user || null);
      setToken(data.token || "");
    } catch (error) {
      console.error("Login error:", error);
      setStatus({ type: "error", message: "Server error." });
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Simple Auth Demo</h1>
        <p>Register & Login using Express + Prisma + JWT</p>
      </header>

      <main className="content">
        <section className="card">
          <h2>Register</h2>
          <form onSubmit={handleRegister} className="form">
            <label>
              Name
              <input
                type="text"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                required
              />
            </label>
            <button type="submit">Register</button>
          </form>
        </section>

        <section className="card">
          <h2>Login</h2>
          <form onSubmit={handleLogin} className="form">
            <label>
              Email
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </label>
            <button type="submit">Login</button>
          </form>
        </section>

        <section className="card status">
          <h2>Status</h2>
          <p className={`status__message status__message--${status.type}`}>
            {status.message || "No action yet."}
          </p>
          <div className="status__details">
            <div>
              <strong>User</strong>
              <pre>{user ? JSON.stringify(user, null, 2) : "null"}</pre>
            </div>
            <div>
              <strong>Token</strong>
              <pre>{token ? `${token.slice(0, 24)}...` : "none"}</pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
