import { useMemo, useState } from 'react'
import './App.css'

const initialForm = {
  bookTitle: '',
  bookAuthor: '',
  userName: '',
  borrowUserId: '',
  borrowBookId: '',
  returnBorrowId: ''
}

function App() {
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000')
  const [books, setBooks] = useState([])
  const [users, setUsers] = useState([])
  const [borrows, setBorrows] = useState([])
  const [stats, setStats] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const api = useMemo(() => baseUrl.replace(/\/$/, ''), [baseUrl])

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const request = async (path, options) => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(`${api}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Request failed')
      return data
    } catch (err) {
      setStatus(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const loadBooks = async () => {
    const data = await request('/books')
    if (data) setBooks(data)
  }

  const loadUsers = async () => {
    const data = await request('/users')
    if (data) setUsers(data)
  }

  const loadBorrows = async () => {
    const data = await request('/borrows')
    if (data) setBorrows(data)
  }

  const loadStats = async () => {
    const data = await request('/stats')
    if (data) setStats(data)
  }

  const addBook = async (e) => {
    e.preventDefault()
    const data = await request('/books', {
      method: 'POST',
      body: JSON.stringify({ title: form.bookTitle, author: form.bookAuthor })
    })
    if (data) {
      setForm((f) => ({ ...f, bookTitle: '', bookAuthor: '' }))
      loadBooks()
      loadStats()
    }
  }

  const addUser = async (e) => {
    e.preventDefault()
    const data = await request('/users', {
      method: 'POST',
      body: JSON.stringify({ name: form.userName })
    })
    if (data) {
      setForm((f) => ({ ...f, userName: '' }))
      loadUsers()
    }
  }

  const borrowBook = async (e) => {
    e.preventDefault()
    const data = await request('/borrow', {
      method: 'POST',
      body: JSON.stringify({
        userId: Number(form.borrowUserId),
        bookId: Number(form.borrowBookId)
      })
    })
    if (data) {
      setForm((f) => ({ ...f, borrowUserId: '', borrowBookId: '' }))
      loadBooks()
      loadBorrows()
      loadStats()
    }
  }

  const returnBook = async (e) => {
    e.preventDefault()
    const data = await request('/return', {
      method: 'POST',
      body: JSON.stringify({ borrowId: Number(form.returnBorrowId) })
    })
    if (data) {
      setForm((f) => ({ ...f, returnBorrowId: '' }))
      loadBooks()
      loadBorrows()
      loadStats()
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Library Demo</p>
          <h1>Microservice Library</h1>
          <p className="sub">Simple UI to test your gateway endpoints.</p>
        </div>
        <div className="base-url">
          <label>API Base URL</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:3000"
          />
          <button onClick={loadStats} disabled={loading}>Ping /stats</button>
        </div>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Books</h2>
          <div className="actions">
            <button onClick={loadBooks} disabled={loading}>Load</button>
            <button onClick={loadStats} disabled={loading}>Stats</button>
          </div>
          <ul className="list">
            {books.map((b) => (
              <li key={b.id}>
                <span>#{b.id} {b.title}</span>
                <span className={b.available ? 'ok' : 'bad'}>
                  {b.available ? 'available' : 'borrowed'}
                </span>
              </li>
            ))}
          </ul>
          {stats && (
            <div className="stats">
              <span>Total: {stats.totalBooks}</span>
              <span>Borrowed: {stats.borrowedBooks}</span>
              <span>Available: {stats.availableBooks}</span>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Users</h2>
          <div className="actions">
            <button onClick={loadUsers} disabled={loading}>Load</button>
          </div>
          <ul className="list">
            {users.map((u) => (
              <li key={u.id}>#{u.id} {u.name}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Borrows</h2>
          <div className="actions">
            <button onClick={loadBorrows} disabled={loading}>Load</button>
          </div>
          <ul className="list">
            {borrows.map((b) => (
              <li key={b.id}>
                <span>#{b.id} user {b.userId} ? book {b.bookId}</span>
                <span className={b.active ? 'bad' : 'ok'}>
                  {b.active ? 'active' : 'returned'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Add Book</h2>
          <form onSubmit={addBook} className="form">
            <input value={form.bookTitle} onChange={setField('bookTitle')} placeholder="Title" />
            <input value={form.bookAuthor} onChange={setField('bookAuthor')} placeholder="Author" />
            <button disabled={loading}>Create</button>
          </form>
        </div>

        <div className="card">
          <h2>Add User</h2>
          <form onSubmit={addUser} className="form">
            <input value={form.userName} onChange={setField('userName')} placeholder="Name" />
            <button disabled={loading}>Create</button>
          </form>
        </div>

        <div className="card">
          <h2>Borrow / Return</h2>
          <form onSubmit={borrowBook} className="form split">
            <input value={form.borrowUserId} onChange={setField('borrowUserId')} placeholder="User ID" />
            <input value={form.borrowBookId} onChange={setField('borrowBookId')} placeholder="Book ID" />
            <button disabled={loading}>Borrow</button>
          </form>
          <form onSubmit={returnBook} className="form">
            <input value={form.returnBorrowId} onChange={setField('returnBorrowId')} placeholder="Borrow ID" />
            <button disabled={loading}>Return</button>
          </form>
        </div>
      </section>

      {status && <div className="status">{status}</div>}
    </div>
  )
}

export default App
