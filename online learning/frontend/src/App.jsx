import { useState } from "react";
import "./App.css";
import { API } from "./api";

function App() {
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerResult, setRegisterResult] = useState("");
  const [loginResult, setLoginResult] = useState("");

  const submitRegister = async (e) => {
    e.preventDefault();
    setRegisterResult("");

    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json().catch(() => ({}));
      setRegisterResult(`Register -> ${res.status}: ${data.message || "No message"}`);
    } catch (err) {
      setRegisterResult(`Register -> NETWORK_ERROR: ${err.message}`);
    }
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoginResult("");

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json().catch(() => ({}));
      setLoginResult(`Login -> ${res.status}: ${data.message || "No message"}`);
    } catch (err) {
      setLoginResult(`Login -> NETWORK_ERROR: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 920, margin: "40px auto" }}>
      <h2>Auth Check</h2>
      <div className="auth-grid">
        <section className="auth-card">
          <h3>Register</h3>
          <form onSubmit={submitRegister} className="form">
            <input
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              placeholder="Name (optional)"
            />
            <input
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              placeholder="Email"
              type="email"
            />
            <input
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              placeholder="Password"
              type="password"
            />
            <button type="submit">Register</button>
          </form>
          {registerResult && <p className="result-line">{registerResult}</p>}
        </section>

        <section className="auth-card">
          <h3>Login</h3>
          <form onSubmit={submitLogin} className="form">
            <input
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="Email"
              type="email"
            />
            <input
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="Password"
              type="password"
            />
            <button type="submit">Login</button>
          </form>
          {loginResult && <p className="result-line">{loginResult}</p>}
        </section>
      </div>
    </div>
  );
}

export default App;
