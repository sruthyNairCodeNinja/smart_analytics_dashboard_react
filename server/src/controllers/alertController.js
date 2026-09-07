const Alert = require('../models/Alert');

// GET /api/alerts?resolved=false&severity=high
async function listAlerts(req, res, next) {
  try {
    const filter = {};
    if (req.query.resolved !== undefined) {
      filter.resolved = req.query.resolved === 'true';
    }
    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    const alerts = await Alert.find(filter)
      .populate('machine', 'name type location')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(alerts);
  } catch (err) {
    next(err);
  }
}

async function resolveAlert(req, res, next) {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date(), resolvedBy: req.user._id },
      { new: true }
    ).populate('machine', 'name type location');

    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAlerts, resolveAlert };
