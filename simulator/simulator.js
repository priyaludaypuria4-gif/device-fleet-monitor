const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const HEARTBEAT_INTERVAL = 5000;

const devices = [
  'simulator-device-1',
  'simulator-device-2',
  'simulator-device-3',
  'simulator-device-4',
  'simulator-device-5'
];

const runningDevices = new Map();

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`
    );
  }

  return data;
}

async function registerDevice(name) {
  const device = await request(`${API_URL}/devices`, {
    method: 'POST',
    body: JSON.stringify({
      name
    })
  });

  console.log(`Registered ${name}: ${device.id}`);

  return device;
}

async function sendHeartbeat(device) {
  try {
    const result = await request(
      `${API_URL}/devices/${device.id}/heartbeat`,
      {
        method: 'POST'
      }
    );

    console.log(
      `[${new Date().toISOString()}] Heartbeat: ${device.name} -> ${result.status}`
    );
  } catch (error) {
    console.error(
      `Heartbeat failed for ${device.name}: ${error.message}`
    );
  }
}

function startHeartbeat(device) {
  sendHeartbeat(device);

  const interval = setInterval(() => {
    sendHeartbeat(device);
  }, HEARTBEAT_INTERVAL);

  runningDevices.set(device.name, {
    device,
    interval
  });
}

function stopHeartbeat(deviceName) {
  const runningDevice = runningDevices.get(deviceName);

  if (!runningDevice) {
    console.log(`Device "${deviceName}" is not running.`);
    return;
  }

  clearInterval(runningDevice.interval);
  runningDevices.delete(deviceName);

  console.log(
    `Stopped ${deviceName}. It should become OFFLINE after 30 seconds.`
  );
}

async function main() {
  console.log('Starting device simulator...');
  console.log(`API: ${API_URL}`);
  console.log('');

  for (const deviceName of devices) {
    const device = await registerDevice(deviceName);

    startHeartbeat(device);
  }

  console.log('');
  console.log('All 5 devices are running.');
  console.log('');
  console.log('Commands:');
  console.log('  stop <device-name>   Stop a device');
  console.log('  start <device-name>  Restart a device');
  console.log('  status               Show simulator status');
  console.log('  exit                 Stop simulator');
  console.log('');
}

async function startDeviceByName(deviceName) {
  if (runningDevices.has(deviceName)) {
    console.log(`${deviceName} is already running.`);
    return;
  }

  const device = await registerDevice(deviceName);
  startHeartbeat(device);
}

function printStatus() {
  console.log('');

  for (const [name] of runningDevices) {
    console.log(`${name}: RUNNING`);
  }

  console.log('');
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', async (data) => {
  const input = data.trim();

  if (!input) {
    return;
  }

  const [command, deviceName] = input.split(/\s+/);

  try {
    switch (command.toLowerCase()) {
      case 'stop':
        if (!deviceName) {
          console.log('Usage: stop <device-name>');
          break;
        }

        stopHeartbeat(deviceName);
        break;

      case 'start':
        if (!deviceName) {
          console.log('Usage: start <device-name>');
          break;
        }

        await startDeviceByName(deviceName);
        break;

      case 'status':
        printStatus();
        break;

      case 'exit':
      case 'quit':
        console.log('Stopping simulator...');

        for (const [, value] of runningDevices) {
          clearInterval(value.interval);
        }

        process.exit(0);
        break;

      default:
        console.log(
          'Unknown command. Use: stop, start, status, or exit'
        );
    }
  } catch (error) {
    console.error(error.message);
  }
});

main().catch((error) => {
  console.error('Simulator failed:', error);
  process.exit(1);
});
