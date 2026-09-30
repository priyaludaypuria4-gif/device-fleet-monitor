# Device Fleet Monitor

A Node.js REST API for registering and monitoring a fleet of devices through heartbeat tracking.

The application allows devices to register with the monitoring service and periodically send heartbeat requests. A device is considered **ONLINE** when its most recent heartbeat was received within the last 30 seconds. Otherwise, it is considered **OFFLINE**.

The project also includes:

* Input validation for device registration
* Fleet summary reporting
* A device simulator
* Automated API tests
* Separate API documentation

---

## 1. What the Project Does

The Device Fleet Monitor provides a REST API for managing and monitoring devices.

The application supports:

* Registering a device
* Listing all registered devices
* Getting a single device
* Receiving device heartbeat requests
* Automatically determining whether a device is `ONLINE` or `OFFLINE`
* Viewing fleet statistics
* Validating device registration requests
* Simulating multiple devices sending heartbeats

### Device Status

A device is considered:

* `ONLINE` if its last heartbeat was received within 30 seconds
* `OFFLINE` if it has never sent a heartbeat or its last heartbeat was more than 30 seconds ago

The heartbeat timeout is configured in:

```text
src/config.js
```

Current value:

```text
30 seconds
```

---

## 2. Design / Architecture

The application follows a layered architecture.

```text
Client / Simulator
       |
       v
Express Routes
       |
       v
Input Validation Middleware
       |
       v
Controllers
       |
       v
Services
       |
       v
In-Memory Store
```

### Project Structure

```text
device-fleet-monitor/
├── README.md
├── API.md
├── package.json
├── .gitignore
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config.js
│   ├── controllers/
│   │   └── deviceController.js
│   ├── middleware/
│   │   └── validateDevice.js
│   ├── routes/
│   │   └── deviceRoutes.js
│   ├── services/
│   │   └── deviceService.js
│   └── store/
│       └── deviceStore.js
├── tests/
│   └── device.test.js
└── simulator/
    └── simulator.js
```

### Routes

`deviceRoutes.js` defines the available API endpoints and connects them to controller functions.

### Validation Middleware

`validateDevice.js` validates incoming device registration requests before they reach the controller.

Currently, a device registration requires a non-empty `name`.

### Controllers

The controller layer handles HTTP requests and responses.

The controllers delegate application logic to `deviceService.js`.

### Services

`deviceService.js` contains the main business logic, including:

* Device registration
* Heartbeat processing
* Device lookup
* Device listing
* Fleet summary calculation
* Online/offline status calculation

### Store

`deviceStore.js` provides in-memory storage for registered devices.

### Simulator

`simulator/simulator.js` registers five devices and sends heartbeat requests every five seconds.

The simulator also provides commands for stopping and restarting individual simulated devices.

---

## 3. Prerequisites

Install the following:

* Node.js 18 or later
* npm
* Git

Check your installed versions:

```bash
node --version
npm --version
git --version
```

The application uses Node.js built-in `fetch`, so a modern Node.js version is required.

No external database is required.

---

## 4. How to Build the Application

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/device-fleet-monitor.git
```

Change into the project directory:

```bash
cd device-fleet-monitor
```

Install dependencies:

```bash
npm install
```

There is currently no separate build step because this project runs directly with Node.js.

The main application entry point is:

```text
src/server.js
```

---

## 5. How to Run the Application

Start the API server:

```bash
npm start
```

The API runs on:

```text
http://localhost:3000
```

The API routes use the `/api` prefix.

Therefore, the base API URL is:

```text
http://localhost:3000/api
```

For example:

```text
http://localhost:3000/api/devices
```

### Development Mode

The project also includes a development command using Node's watch mode:

```bash
npm run dev
```

This automatically restarts the server when source files change.

---

## 6. How to Run the Simulator

Start the API server first:

```bash
npm start
```

Open a second terminal window and run:

```bash
node simulator/simulator.js
```

The simulator registers five devices:

```text
simulator-device-1
simulator-device-2
simulator-device-3
simulator-device-4
simulator-device-5
```

Each device sends a heartbeat every five seconds.

### Simulator Commands

While the simulator is running, you can enter:

```text
stop <device-name>
```

Example:

```text
stop simulator-device-1
```

This stops the heartbeat for that simulated device.

After approximately 30 seconds, the device should become `OFFLINE`.

To restart it:

```text
start simulator-device-1
```

To see currently running simulated devices:

```text
status
```

To stop the simulator:

```text
exit
```

### Custom API URL

The simulator uses:

```text
http://localhost:3000/api
```

by default.

You can change the API URL using the `API_URL` environment variable.

Example:

```bash
API_URL=http://localhost:3000/api node simulator/simulator.js
```

---

## 7. How to Run the Tests

Install dependencies:

```bash
npm install
```

Run the test suite:

```bash
npm test
```

The project uses:

* Jest
* Supertest

Tests are located in:

```text
tests/device.test.js
```

For continuous test execution during development:

```bash
npm run test:watch
```

---

## 8. Example API Requests

The API base URL is:

```text
http://localhost:3000/api
```

Detailed API information is also available in:

```text
API.md
```

### Register a Device

Endpoint:

```http
POST /api/devices
```

Request:

```json
{
  "name": "Server-01"
}
```

Using `curl`:

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"name":"Server-01"}'
```

A successful request returns HTTP `201 Created`.

Example response:

```json
{
  "id": "generated-device-id",
  "name": "Server-01",
  "registeredAt": "2026-09-30T10:00:00.000Z",
  "lastHeartbeat": null,
  "status": "OFFLINE"
}
```

A newly registered device is initially `OFFLINE` because it has not sent a heartbeat yet.

---

### Input Validation

The registration endpoint requires a non-empty device name.

Invalid request:

```json
{
  "name": ""
}
```

The API returns:

```text
400 Bad Request
```

Example:

```json
{
  "error": "Device name is required"
}
```

The same validation is applied if the `name` field is missing or is not a string.

---

### Send a Heartbeat

Endpoint:

```http
POST /api/devices/:id/heartbeat
```

Example:

```bash
curl -X POST \
  http://localhost:3000/api/devices/DEVICE_ID/heartbeat
```

A successful heartbeat updates the device's `lastHeartbeat` timestamp and causes the device to be reported as:

```text
ONLINE
```

---

### List All Devices

Endpoint:

```http
GET /api/devices
```

Example:

```bash
curl http://localhost:3000/api/devices
```

---

### Get a Single Device

Endpoint:

```http
GET /api/devices/:id
```

Example:

```bash
curl http://localhost:3000/api/devices/DEVICE_ID
```

If the device does not exist, the API returns:

```text
404 Not Found
```

---

### Fleet Summary

Endpoint:

```http
GET /api/fleet/summary
```

Example:

```bash
curl http://localhost:3000/api/fleet/summary
```

Example response:

```json
{
  "total": 5,
  "online": 4,
  "offline": 1
}
```

---

## 9. Assumptions

The following assumptions were made:

1. Each device is identified by a UUID generated by the application.
2. Device registration requires only a non-empty device name.
3. Device status is calculated automatically from heartbeat activity.
4. A device is `ONLINE` when its latest heartbeat is no more than 30 seconds old.
5. A device is `OFFLINE` when it has no heartbeat or its latest heartbeat is older than 30 seconds.
6. The application uses an in-memory store.
7. Device data does not need to survive an application restart for the current implementation.
8. The simulator and API are normally run on the same machine during development.
9. Authentication and authorization are outside the current scope.
10. The API is intended primarily as a development/evaluation project rather than a production monitoring platform.

---

## 10. Known Limitations

### In-Memory Storage

All device information is stored in memory.

Restarting the server removes all registered devices.

### No Authentication

The API currently does not implement authentication or authorization.

### No Persistent Database

There is no database such as PostgreSQL, MySQL, or MongoDB.

### Basic Heartbeat Monitoring

The monitoring logic only considers the time since the last heartbeat.

It does not currently track:

* Heartbeat history
* Downtime duration
* Device events
* Historical status changes
* Network latency
* Failure counts

### Limited Input Validation

Device registration currently validates the device name but does not perform extensive validation beyond the required field.

### Simulator Limitations

The simulator is designed for development and testing. It is not intended to represent a production-scale fleet.

### API Documentation

API documentation is maintained manually in `API.md` rather than being generated from an OpenAPI specification.

---

## 11. What I Would Improve With One Additional Day

If I had one additional day, I would focus on improving reliability and production readiness.

### Persistent Database

Replace the in-memory store with a persistent database so devices and their state survive server restarts.

### Better Validation

Add stronger request validation and consistent validation rules for all API inputs.

### Improved Test Coverage

Add tests for:

* Invalid registration requests
* Missing request bodies
* Unknown device IDs
* Heartbeat failures
* Fleet summary calculations
* Offline status after heartbeat timeout
* Error handling

---

## API Documentation

For endpoint details and example requests, see:

```text
API.md
```

---

## AI Usage
*AI tool used: I used chatGPT for this project

*Why I used it: I used it for structuring the project, code generation and identifying potential issues and inconsistencies. 
 I also used it to improve parts of the README and API documentation. 
 
*Changes I made: One improvement that I made was to the device status handling.
Instead of storing ONLINE or OFFLINE as a permanent device property, the application stores only the timestamp of the latest heartbeat: lastHeartbeat
The current status is calculated dynamically.
I chose this approach because it directly implements the 30-second timeout requirement. A device automatically becomes OFFLINE when its last heartbeat becomes older than 30 seconds,
without requiring a background job to update the status.

*What I personally verified:I personally verified the complete application flow by running the API and simulator locally.
I verified that:
*The application starts successfully with npm start.
*I stopped one simulated device using: stop simulator-device-3
*After more than 30 seconds without a heartbeat, I queried the API and verified that the stopped device changed to OFFLINE.
*The remaining simulated devices continued to report ONLINE.
*I also ran the automated test suite with: npm test.




