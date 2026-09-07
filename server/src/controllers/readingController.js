const Reading = require('../models/Reading');
const Machine = require('../models/Machine');

// GET /api/machines/:id/readings?hours=6
async function getReadingsForMachine(req, res, next) {
  try {
    const { id } = req.params;
    const hours = Number(req.query.hours) || 6;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const machine = await Machine.findById(id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    const readings = await Reading.find({ machine: id, timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .lean();

    res.json(readings);
  } catch (err) {
    next(err);
  }
}

// GET /api/readings/latest - most recent reading for every machine
async function getLatestReadings(req, res, next) {
  try {
    const machines = await Machine.find().lean();
    const latest = await Promise.all(
      machines.map((m) => Reading.findOne({ machine: m._id }).sort({ timestamp: -1 }).lean())
    );
    res.json(latest.filter(Boolean));
  } catch (err) {
    next(err);
  }
}

module.exports = { getReadingsForMachine, getLatestReadings };
