const deviceService = require('../services/deviceService');

function registerDevice(req, res, next) {
  try {
    const device = deviceService.registerDevice(req.body);

    res.status(201).json(device);
  } catch (error) {
    next(error);
  }
}

function heartbeat(req, res, next) {
  try {
    const device = deviceService.heartbeat(req.params.id);

    res.status(200).json(device);
  } catch (error) {
    next(error);
  }
}

function listDevices(req, res, next) {
  try {
    const devices = deviceService.listDevices();

    res.status(200).json({
      devices
    });
  } catch (error) {
    next(error);
  }
}

function getDevice(req, res, next) {
  try {
    const device = deviceService.getDevice(req.params.id);

    res.status(200).json(device);
  } catch (error) {
    next(error);
  }
}

function getFleetSummary(req, res, next) {
  try {
    const summary = deviceService.getFleetSummary();

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerDevice,
  heartbeat,
  listDevices,
  getDevice,
  getFleetSummary
};
