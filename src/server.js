const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Device Fleet Monitor running on port ${PORT}`);
});
