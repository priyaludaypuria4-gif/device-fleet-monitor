const express = require('express');

const deviceRoutes = require('./routes/deviceRoutes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

app.use('/api', deviceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal server error'
  });
});

module.exports = app;
