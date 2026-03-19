const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Student API v2 ажиллаж байна!')
})

app.listen(3000, () => {
  console.log('Server 3000 port-д ажиллаж байна (v2)')
})
