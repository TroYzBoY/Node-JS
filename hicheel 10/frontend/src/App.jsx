import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const jsonTryParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const formatMs = (ms) => (ms ? `${ms.toFixed(0)} ms` : "—");

function App() {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [inputs, setInputs] = useState({
    studentsLimit: 50,
    studentsNoPoolLimit: 50,
    byEmail: "s100@mail.com",
    byEmailExplain: false,
    byYear: 2024,
    byYearMode: "bad",
    byYearExplain: false,
    byYearLimit: 1000,
    nplus1Limit: 1000,
    joinLimit: 1000,
    courseName: "",
  });

  const apiInfo = useMemo(
    () => ({
      base: API_BASE,
      healthUrl: `${API_BASE}/health`,
    }),
    []
  );

  const setInput = (key, value) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const callApi = async (id, path, options = {}) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    const started = performance.now();
    try {
      const res = await fetch(`${API_BASE}${path}`, options);
      const duration = performance.now() - started;
      const text = await res.text();
      const data = jsonTryParse(text);
      setResponses((prev) => ({
        ...prev,
        [id]: {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          ms: duration,
          data,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } catch (error) {
      const duration = performance.now() - started;
      setResponses((prev) => ({
        ...prev,
        [id]: {
          ok: false,
          status: 0,
          statusText: "Network error",
          ms: duration,
          data: { error: error.message },
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const checkHealth = () => callApi("health", "/health");

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 15000);
    return () => clearInterval(timer);
  }, []);

  const responseCard = (id) => {
    const resp = responses[id];
    if (!resp) {
      return (
        <div className="response empty">
          <div className="response-meta">No response yet.</div>
        </div>
      );
    }

    return (
      <div className={`response ${resp.ok ? "ok" : "bad"}`}>
        <div className="response-meta">
          <span>
            {resp.status} {resp.statusText}
          </span>
          <span>{formatMs(resp.ms)}</span>
          <span>{resp.timestamp}</span>
        </div>
        <pre>{JSON.stringify(resp.data, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Database Performance Lab</p>
          <h1>Backend Status & Task Runner</h1>
          <p className="sub">
            Hicheel 10 backend endpoints to check slow queries, pooling,
            caching, and rate limiting. Base URL:{" "}
            <span className="mono">{apiInfo.base}</span>
          </p>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={checkHealth}
              disabled={loading.health}
            >
              {loading.health ? "Checking..." : "Check Health"}
            </button>
            <button
              className="ghost"
              onClick={() => setResponses({})}
              disabled={Object.keys(responses).length === 0}
            >
              Clear Responses
            </button>
          </div>
        </div>
        <div className="status-card">
          <div className="status-title">Service Health</div>
          <div className="status-row">
            <span className="dot" data-ok={responses.health?.ok} />
            <div>
              <div className="status-main">
                {responses.health?.ok ? "Online" : "Unknown"}
              </div>
              <div className="status-sub">
                {responses.health
                  ? `${responses.health.status} ${responses.health.statusText}`
                  : apiInfo.healthUrl}
              </div>
            </div>
          </div>
          <div className="status-foot">
            <span>Last check</span>
            <span>{responses.health?.timestamp || "—"}</span>
          </div>
        </div>
      </header>

      <section className="grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Task 1: Slow Query</h2>
            <p>Email lookup + EXPLAIN.</p>
          </div>
          <div className="panel-body">
            <label>
              Email
              <input
                value={inputs.byEmail}
                onChange={(e) => setInput("byEmail", e.target.value)}
              />
            </label>
            <label className="inline">
              <input
                type="checkbox"
                checked={inputs.byEmailExplain}
                onChange={(e) => setInput("byEmailExplain", e.target.checked)}
              />
              Explain
            </label>
            <button
              onClick={() =>
                callApi(
                  "byEmail",
                  `/students/by-email?email=${encodeURIComponent(
                    inputs.byEmail
                  )}&explain=${inputs.byEmailExplain ? 1 : 0}`
                )
              }
              disabled={loading.byEmail}
            >
              {loading.byEmail ? "Loading..." : "Run Query"}
            </button>
            {responseCard("byEmail")}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Task 2: Query Optimization</h2>
            <p>Bad vs good index-friendly range query.</p>
          </div>
          <div className="panel-body">
            <div className="row">
              <label>
                Year
                <input
                  type="number"
                  value={inputs.byYear}
                  onChange={(e) => setInput("byYear", e.target.value)}
                />
              </label>
              <label>
                Mode
                <select
                  value={inputs.byYearMode}
                  onChange={(e) => setInput("byYearMode", e.target.value)}
                >
                  <option value="bad">bad</option>
                  <option value="good">good</option>
                </select>
              </label>
              <label>
                Limit
                <input
                  type="number"
                  value={inputs.byYearLimit}
                  onChange={(e) => setInput("byYearLimit", e.target.value)}
                />
              </label>
            </div>
            <label className="inline">
              <input
                type="checkbox"
                checked={inputs.byYearExplain}
                onChange={(e) => setInput("byYearExplain", e.target.checked)}
              />
              Explain
            </label>
            <button
              onClick={() =>
                callApi(
                  "byYear",
                  `/students/by-year?year=${inputs.byYear}&mode=${
                    inputs.byYearMode
                  }&explain=${inputs.byYearExplain ? 1 : 0}&limit=${
                    inputs.byYearLimit
                  }`
                )
              }
              disabled={loading.byYear}
            >
              {loading.byYear ? "Loading..." : "Run Query"}
            </button>
            {responseCard("byYear")}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Task 3: Connection Pool</h2>
            <p>Compare pooled vs single connection.</p>
          </div>
          <div className="panel-body">
            <label>
              Limit
              <input
                type="number"
                value={inputs.studentsLimit}
                onChange={(e) => setInput("studentsLimit", e.target.value)}
              />
            </label>
            <button
              onClick={() =>
                callApi("students", `/students?limit=${inputs.studentsLimit}`)
              }
              disabled={loading.students}
            >
              {loading.students ? "Loading..." : "GET /students"}
            </button>
            {responseCard("students")}
            <label>
              Limit (no pool)
              <input
                type="number"
                value={inputs.studentsNoPoolLimit}
                onChange={(e) => setInput("studentsNoPoolLimit", e.target.value)}
              />
            </label>
            <button
              onClick={() =>
                callApi(
                  "studentsNoPool",
                  `/students-nopool?limit=${inputs.studentsNoPoolLimit}`
                )
              }
              disabled={loading.studentsNoPool}
            >
              {loading.studentsNoPool ? "Loading..." : "GET /students-nopool"}
            </button>
            {responseCard("studentsNoPool")}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Task 4: N+1 vs JOIN</h2>
            <p>Compare query counts and payload sizes.</p>
          </div>
          <div className="panel-body">
            <label>
              Limit
              <input
                type="number"
                value={inputs.nplus1Limit}
                onChange={(e) => setInput("nplus1Limit", e.target.value)}
              />
            </label>
            <button
              onClick={() =>
                callApi(
                  "nplus1",
                  `/students/with-grades/nplus1?limit=${inputs.nplus1Limit}`
                )
              }
              disabled={loading.nplus1}
            >
              {loading.nplus1 ? "Loading..." : "GET N+1"}
            </button>
            {responseCard("nplus1")}
            <label>
              Limit (JOIN)
              <input
                type="number"
                value={inputs.joinLimit}
                onChange={(e) => setInput("joinLimit", e.target.value)}
              />
            </label>
            <button
              onClick={() =>
                callApi(
                  "join",
                  `/students/with-grades/join?limit=${inputs.joinLimit}`
                )
              }
              disabled={loading.join}
            >
              {loading.join ? "Loading..." : "GET JOIN"}
            </button>
            {responseCard("join")}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Task 5-6: Redis Cache</h2>
            <p>Courses cache + invalidation.</p>
          </div>
          <div className="panel-body">
            <button
              onClick={() => callApi("courses", "/courses")}
              disabled={loading.courses}
            >
              {loading.courses ? "Loading..." : "GET /courses"}
            </button>
            {responseCard("courses")}
            <label>
              Course name (optional)
              <input
                placeholder="Course-Analytics"
                value={inputs.courseName}
                onChange={(e) => setInput("courseName", e.target.value)}
              />
            </label>
            <button
              onClick={() =>
                callApi("coursesPost", "/courses", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: inputs.courseName || undefined,
                  }),
                })
              }
              disabled={loading.coursesPost}
            >
              {loading.coursesPost ? "Loading..." : "POST /courses"}
            </button>
            {responseCard("coursesPost")}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Task 7: Rate Limiting</h2>
            <p>POST /login to trigger Redis limiter.</p>
          </div>
          <div className="panel-body">
            <button
              onClick={() => callApi("login", "/login", { method: "POST" })}
              disabled={loading.login}
            >
              {loading.login ? "Loading..." : "POST /login"}
            </button>
            {responseCard("login")}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Bonus: Dashboard Cache</h2>
            <p>Cached counts for major tables.</p>
          </div>
          <div className="panel-body">
            <button
              onClick={() => callApi("dashboard", "/dashboard")}
              disabled={loading.dashboard}
            >
              {loading.dashboard ? "Loading..." : "GET /dashboard"}
            </button>
            {responseCard("dashboard")}
          </div>
        </article>
      </section>
    </div>
  );
}

export default App;
