const express = require("express")
const router = express.Router()

// GET /students/:id
router.get("/:id", (req, res) => {
  const { id } = req.params
  res.send(`Student ID is: ${id}`)
})

module.exports = router