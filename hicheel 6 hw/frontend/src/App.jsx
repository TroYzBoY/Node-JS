import { useState } from "react";
import "./App.css";

const API_BASE = "/api";

function App() {
  const [registerForm, setRegisterForm] = useState({
    name: "Ravjaa",
    email: "ravjaa@school.mn",
    password: "Test123!",
    role: "STUDENT",
  });
  const [loginForm, setLoginForm] = useState({
    email: "ravjaa@school.mn",
    password: "Test123!",
  });
  const [status, setStatus] = useState("Ready");
  const [me, setMe] = useState(null);
  const [students, setStudents] = useState([]);

  const setStatusValue = (value) => {
    setStatus(typeof value === "string" ? value : JSON.stringify(value, null, 2));
  };

  const getToken = () => localStorage.getItem("token") || "";

  const saveToken = (token) => {
    if (token) localStorage.setItem("token", token);
  };

  const request = async (path, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed: ${res.status}`);
    }

    return data;
  };

  const onRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      });
      saveToken(data.token);
      setStatusValue(data);
    } catch (error) {
      setStatusValue(error.message);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      saveToken(data.token);
      setStatusValue(data);
    } catch (error) {
      setStatusValue(error.message);
    }
  };

  const onMe = async () => {
    try {
      const data = await request("/auth/me");
      setMe(data.user || null);
      setStatusValue(data);
    } catch (error) {
      setStatusValue(error.message);
    }
  };

  const onStudents = async () => {
    try {
      const data = await request("/students");
      setStudents(data.students || []);
      setStatusValue({ count: data.students?.length || 0 });
    } catch (error) {
      setStudents([]);
      setStatusValue(error.message);
    }
  };

  const onDeleteStudent = async (id) => {
    try {
      const data = await request(`/students/${id}`, { method: "DELETE" });
      setStatusValue(data);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      setStatusValue(error.message);
    }
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    setMe(null);
    setStudents([]);
    setStatusValue("Logged out");
  };

  return (
    <main className="container">
      <h1>Hicheel 6 HW</h1>
      <p className="subtitle">Auth + JWT + RBAC test frontend</p>

      <section className="card">
        <h2>Register</h2>
        <form onSubmit={onRegister}>
          <input
            type="text"
            placeholder="Name"
            required
            value={registerForm.name}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={registerForm.email}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={registerForm.password}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <select
            value={registerForm.role}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="TEACHER">TEACHER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
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
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <button type="submit">Login</button>
        </form>
      </section>

      <section className="card">
        <h2>Protected</h2>
        <div className="actions">
          <button type="button" onClick={onMe}>GET /api/auth/me</button>
          <button type="button" onClick={onStudents}>GET /api/students</button>
          <button type="button" onClick={onLogout}>Logout</button>
        </div>
        {me && (
          <div className="me-box">
            <strong>Current User:</strong> {me.name} ({me.role}) - {me.email}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Students</h2>
        {students.length === 0 && <p>No students loaded.</p>}
        {students.map((student) => (
          <div className="student-item" key={student.id}>
            <div>
              <strong>{student.name}</strong> ({student.role})<br />
              <span>{student.email}</span>
            </div>
            <button type="button" onClick={() => onDeleteStudent(student.id)}>Delete</button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Status</h2>
        <pre>{status}</pre>
      </section>
    </main>
  );
}

export default App;
