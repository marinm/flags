const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const minesweeper = require('./url-router.js')

app.use('/minesweeper', minesweeper)
app.listen(process.env.WEBSITE_PORT)