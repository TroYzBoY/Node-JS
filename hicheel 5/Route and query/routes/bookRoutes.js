const express = require("express")
const router = express.Router()

// GET /books?author=John&page=2
router.get("/", (req, res) => {
  const { author, page } = req.query

  console.log("Author:", author)
  console.log("Page:", page)

  res.send(`Author: ${author}, Page: ${page}`)
})

module.exports = router