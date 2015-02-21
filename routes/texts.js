'use strict';

// Routes for all text message app components

var express = require('express');
var router = express.Router();

var textsController = require('../controllers/texts');

router.all('/', textsController.receiveText);

module.exports = router;
