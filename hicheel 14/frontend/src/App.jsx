import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:4000`;

function App() {
  const [students, setStudents] = useState([]);
  const [source, setSource] = useState("-");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);

  const total = useMemo(() => students.length, [students]);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/students`);
      const json = await res.json();
      setStudents(json.data || []);
      setSource(json.source || "db");
    } catch (err) {
      setError("Could not reach backend API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name || !email) {
      setError("Name and email are required");
      return;
    }

    try {
      setError("");
      const url = editingId
        ? `${API_BASE}/students/${editingId}`
        : `${API_BASE}/students`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Request failed");
      }

      resetForm();
      fetchStudents();
    } catch (err) {
      setError(err.message || "Request failed");
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setName(student.name);
    setEmail(student.email);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" });
      fetchStudents();
    } catch (err) {
      setError("Delete failed");
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Day 1 • Docker + Containers</p>
          <h1>Backend + Frontend Demo</h1>
          <p className="lead">
            A tiny CRUD app backed by MySQL and cached with Redis.
          </p>
        </div>
        <div className="stats">
          <div>
            <span className="label">Total Students</span>
            <span className="value">{total}</span>
          </div>
          <div>
            <span className="label">Data Source</span>
            <span className="value">{source}</span>
          </div>
        </div>
      </header>

      <section className="panel">
        <h2>{editingId ? "Update Student" : "Add Student"}</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sara"
            />
          </label>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sara@email.com"
            />
          </label>
          <div className="actions">
            <button className="primary" type="submit">
              {editingId ? "Save" : "Create"}
            </button>
            {editingId ? (
              <button type="button" className="ghost" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Students</h2>
          <button className="ghost" onClick={fetchStudents}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : students.length === 0 ? (
          <p className="muted">No students yet</p>
        ) : (
          <ul className="grid">
            {students.map((student) => (
              <li key={student.id} className="card">
                <div>
                  <p className="title">{student.name}</p>
                  <p className="muted">{student.email}</p>
                </div>
                <div className="card-actions">
                  <button className="ghost" onClick={() => handleEdit(student)}>
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => handleDelete(student.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">
        API: <span>{API_BASE}</span>
      </footer>
    </div>
  );
}

export default App;