```javascript
function validateDevice(req, res, next) {
  const { name, ipAddress, status } = req.body;

  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }

  if (!ipAddress || typeof ipAddress !== 'string') {
    errors.push('ipAddress is required and must be a string');
  }

  if (status !== undefined) {
    const validStatuses = ['online', 'offline', 'maintenance'];

    if (!validStatuses.includes(status)) {
      errors.push(
        'status must be one of: online, offline, maintenance'
      );
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

module.exports = validateDevice;
```
