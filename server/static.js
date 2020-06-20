// Serve static files

const express = require('express')
const app = express()
const path = require('path')

app.use('/minesweeper', express.static(path.join(__dirname, '../browser')))
app.listen(8888)