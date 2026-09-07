require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { startSimulation } = require('./services/simulationService');

const authRoutes = require('./routes/authRoutes');
const machineRoutes = require('./routes/machineRoutes');
const readingRoutes = require('./routes/readingRoutes');
const alertRoutes = require('./routes/alertRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
    startSimulation();
  });
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
