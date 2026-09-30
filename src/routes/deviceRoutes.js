const express = require('express');

const controller = require('../controllers/deviceController');

const router = express.Router();

// Register a device
router.post('/devices', controller.registerDevice);

// Send heartbeat
router.post('/devices/:id/heartbeat', controller.heartbeat);

// List all devices
router.get('/devices', controller.listDevices);

// Fleet summary
router.get('/fleet/summary', controller.getFleetSummary);

// Get a single device
router.get('/devices/:id', controller.getDevice);

module.exports = router;
