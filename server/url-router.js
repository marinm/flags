// Serve static files

const express = require('express')
const router = express.Router()

require('dotenv').config()

router.use('/', express.static(__dirname + '/../browser'))

module.exports = router