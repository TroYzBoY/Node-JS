import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:3000";

function App() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState({ students: false, courses: false });
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const isGatewayUp = useMemo(
    () => !error && (students.length > 0 || courses.length > 0),
    [error, students, courses]
  );

  const fetchStudents = async () => {
    setLoading((prev) => ({ ...prev, students: true }));
    setError("");
    try {
      const response = await fetch(`${API_BASE}/students`);
      if (!response.ok) {
        throw new Error("Students service error");
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError("Gateway эсвэл service ажиллахгүй байна.");
    } finally {
      setLoading((prev) => ({ ...prev, students: false }));
    }
  };

  const fetchCourses = async () => {
    setLoading((prev) => ({ ...prev, courses: true }));
    setError("");
    try {
      const response = await fetch(`${API_BASE}/courses`);
      if (!response.ok) {
        throw new Error("Courses service error");
      }
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError("Gateway эсвэл service ажиллахгүй байна.");
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  const addStudent = async (event) => {
    event.preventDefault();
    setWarning("");
    setError("");
    const name = studentName.trim();
    if (!name) return;

    try {
      const response = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Command service error");
      }
      const data = await response.json();
      if (data.warning) {
        setWarning(data.warning);
      }
      setStudentName("");
      await fetchStudents();
    } catch (err) {
      setError("Student нэмэх үед алдаа гарлаа.");
    }
  };

  const addCourse = async (event) => {
    event.preventDefault();
    setError("");
    const title = courseTitle.trim();
    if (!title) return;

    try {
      const response = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        throw new Error("Course service error");
      }
      setCourseTitle("");
      await fetchCourses();
    } catch (err) {
      setError("Course нэмэх үед алдаа гарлаа.");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Microservice Architecture + API Gateway + CQRS</p>
          <h1>High-Load Demo Lab</h1>
          <p className="subtitle">
            Gateway-аар дамжуулж Student ба Course service рүү хандана.
            Student-д CQRS загвар хэрэглэж, read/write тусдаа endpoint байна.
          </p>
        </div>
        <div className="status-card">
          <h3>Gateway Status</h3>
          <p className={isGatewayUp ? "status ok" : "status down"}>
            {isGatewayUp ? "Online" : "Offline"}
          </p>
          <div className="status-actions">
            <button type="button" onClick={fetchStudents}>
              Refresh Students
            </button>
            <button type="button" onClick={fetchCourses}>
              Refresh Courses
            </button>
          </div>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}
      {warning && <div className="alert warning">{warning}</div>}

      <section className="grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Students (Query)</h2>
            <span className="pill">GET /students</span>
          </div>
          <ul className="list">
            {loading.students && <li className="muted">Loading...</li>}
            {!loading.students && students.length === 0 && (
              <li className="muted">No students yet</li>
            )}
            {students.map((student) => (
              <li key={student.id}>
                <span className="code">#{student.id}</span>
                <span>{student.name}</span>
              </li>
            ))}
          </ul>

          <form className="form" onSubmit={addStudent}>
            <label htmlFor="studentName">Add student (Command)</label>
            <div className="form-row">
              <input
                id="studentName"
                type="text"
                placeholder="Temuulen"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
              />
              <button type="submit">POST /students</button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Courses</h2>
            <span className="pill">GET /courses</span>
          </div>
          <ul className="list">
            {loading.courses && <li className="muted">Loading...</li>}
            {!loading.courses && courses.length === 0 && (
              <li className="muted">No courses yet</li>
            )}
            {courses.map((course) => (
              <li key={course.id}>
                <span className="code">#{course.id}</span>
                <span>{course.title}</span>
              </li>
            ))}
          </ul>

          <form className="form" onSubmit={addCourse}>
            <label htmlFor="courseTitle">Add course</label>
            <div className="form-row">
              <input
                id="courseTitle"
                type="text"
                placeholder="System Design"
                value={courseTitle}
                onChange={(event) => setCourseTitle(event.target.value)}
              />
              <button type="submit">POST /courses</button>
            </div>
          </form>
        </div>
      </section>

      <section className="notes">
        <h3>Flow Summary</h3>
        <div className="note-grid">
          <div>
            <h4>Command (Write)</h4>
            <p>
              `POST /students` → Student Service (write model). Дараа нь
              read model update хийхийг симуляци хийж байна.
            </p>
          </div>
          <div>
            <h4>Query (Read)</h4>
            <p>
              `GET /students` → Student Query Service (read model) ашиглана.
              Read ихтэй үед тусад нь scale хийх боломжтой.
            </p>
          </div>
          <div>
            <h4>Gateway</h4>
            <p>
              Client нэг URL мэднэ. Auth, logging, rate limiting зэрэг
              cross-cutting issue-үүдийг gateway дээр төвлөрүүлнэ.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
