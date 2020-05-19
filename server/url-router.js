// Serve static files

const express = require('express')
const app = express()

require('dotenv').config()

app.use('/', express.static(__dirname + '/../browser'))
app.listen(process.env.WEBSITE_PORT)