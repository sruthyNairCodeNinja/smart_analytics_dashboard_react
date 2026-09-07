const Machine = require('../models/Machine');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');

// GET /api/stats/overview - top-level KPI cards for the dashboard
async function getOverview(req, res, next) {
  try {
    const machines = await Machine.find().lean();
    const totalMachines = machines.length;
    const running = machines.filter((m) => m.status === 'running').length;
    const idle = machines.filter((m) => m.status === 'idle').length;
    const down = machines.filter((m) => m.status === 'down').length;

    const since = new Date(Date.now() - 60 * 60 * 1000); // last hour
    const recentReadings = await Reading.find({ timestamp: { $gte: since } }).lean();

    const totalThroughput = recentReadings.reduce((sum, r) => sum + r.throughput, 0);
    const totalDefects = recentReadings.reduce((sum, r) => sum + r.defectCount, 0);
    const avgTemperature = recentReadings.length
      ? recentReadings.reduce((sum, r) => sum + r.temperature, 0) / recentReadings.length
      : 0;

    const activeAlerts = await Alert.countDocuments({ resolved: false });
    const criticalAlerts = await Alert.countDocuments({ resolved: false, severity: 'critical' });

    const uptimePercent = totalMachines ? Math.round((running / totalMachines) * 100) : 0;

    res.json({
      totalMachines,
      running,
      idle,
      down,
      uptimePercent,
      totalThroughputLastHour: totalThroughput,
      totalDefectsLastHour: totalDefects,
      avgTemperature: Number(avgTemperature.toFixed(1)),
      activeAlerts,
      criticalAlerts,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOverview };
