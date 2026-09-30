# Device Fleet Monitor API

## Base URL

```text
http://localhost:3000
```

## Endpoints

### Get all devices

```http
GET /devices
```

Returns all registered devices.

### Get a device

```http
GET /devices/:id
```

Example:

```http
GET /devices/1
```

### Create a device

```http
POST /devices
Content-Type: application/json
```

Request body:

```json
{
  "name": "Server-01",
  "ipAddress": "192.168.1.10",
  "status": "online"
}
```

Required fields:

* `name` — non-empty string
* `ipAddress` — string

Optional fields:

* `status` — `online`, `offline`, or `maintenance`

Successful response:

```json
{
  "id": 1,
  "name": "Server-01",
  "ipAddress": "192.168.1.10",
  "status": "online"
}
```

Validation error:

```json
{
  "error": "Validation failed",
  "details": [
    "name is required and must be a non-empty string"
  ]
}
```

HTTP status:

```text
400 Bad Request
```

### Update a device

```http
PUT /devices/:id
Content-Type: application/json
```

Example:

```json
{
  "name": "Server-01",
  "ipAddress": "192.168.1.20",
  "status": "maintenance"
}
```

### Delete a device

```http
DELETE /devices/:id
```

Example:

```http
DELETE /devices/1
```

## HTTP Status Codes

| Status | Meaning               |
| ------ | --------------------- |
| 200    | Request successful    |
| 201    | Device created        |
| 400    | Invalid input         |
| 404    | Device not found      |
| 500    | Internal server error |
