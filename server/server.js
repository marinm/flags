const express = require('express')
const app = express()
const minesweeper = require('./url-router.js')

require('dotenv').config()

app.use('/minesweeper', minesweeper)
app.listen(process.env.WEBSITE_PORT)