const express = require("express")
const app = express()

// Middleware
app.use(express.json())

// Routes
const studentRoutes = require("./routes/studentRoutes")
const bookRoutes = require("./routes/bookRoutes")

app.use("/students", studentRoutes)
app.use("/books", bookRoutes)

// Server
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})