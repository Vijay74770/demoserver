require('dotenv').config();
const express = require('express');
const cors = require('cors');
const readingsRoutes = require('./routes/readingsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'sensor-server' });
});

app.use('/api/readings', readingsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
