const crypto = require('crypto');

const deviceStore = require('../store/deviceStore');
const { HEARTBEAT_TIMEOUT_MS } = require('../config');

function getStatus(lastHeartbeat) {
  if (!lastHeartbeat) {
    return 'OFFLINE';
  }

  const lastHeartbeatTime = new Date(lastHeartbeat).getTime();
  const now = Date.now();

  return now - lastHeartbeatTime <= HEARTBEAT_TIMEOUT_MS
    ? 'ONLINE'
    : 'OFFLINE';
}

function addStatus(device) {
  return {
    ...device,
    status: getStatus(device.lastHeartbeat)
  };
}

function registerDevice({ name }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const error = new Error('Device name is required');
    error.statusCode = 400;
    throw error;
  }

  const device = {
    id: crypto.randomUUID(),
    name: name.trim(),
    registeredAt: new Date().toISOString(),
    lastHeartbeat: null
  };

  deviceStore.create(device);

  return addStatus(device);
}

function heartbeat(deviceId) {
  const device = deviceStore.findById(deviceId);

  if (!device) {
    const error = new Error('Device not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedDevice = deviceStore.update(deviceId, {
    lastHeartbeat: new Date().toISOString()
  });

  return addStatus(updatedDevice);
}

function getDevice(deviceId) {
  const device = deviceStore.findById(deviceId);

  if (!device) {
    const error = new Error('Device not found');
    error.statusCode = 404;
    throw error;
  }

  return addStatus(device);
}

function listDevices() {
  return deviceStore.findAll().map(addStatus);
}

function getFleetSummary() {
  const devices = listDevices();

  const online = devices.filter(
    (device) => device.status === 'ONLINE'
  ).length;

  const offline = devices.filter(
    (device) => device.status === 'OFFLINE'
  ).length;

  return {
    total: devices.length,
    online,
    offline
  };
}

module.exports = {
  registerDevice,
  heartbeat,
  getDevice,
  listDevices,
  getFleetSummary,
  getStatus
};
