const Machine = require('../models/Machine');
const Reading = require('../models/Reading');

async function listMachines(req, res, next) {
  try {
    const machines = await Machine.find().sort({ name: 1 });

    // attach latest reading per machine for a quick status snapshot
    const withLatest = await Promise.all(
      machines.map(async (machine) => {
        const latest = await Reading.findOne({ machine: machine._id }).sort({ timestamp: -1 });
        return { ...machine.toObject(), latestReading: latest };
      })
    );

    res.json(withLatest);
  } catch (err) {
    next(err);
  }
}

async function getMachine(req, res, next) {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    res.json(machine);
  } catch (err) {
    next(err);
  }
}

async function createMachine(req, res, next) {
  try {
    const { name, type, location, targetOutput, thresholds } = req.body;
    if (!name || !type || !location) {
      return res.status(400).json({ message: 'name, type and location are required' });
    }
    const machine = await Machine.create({ name, type, location, targetOutput, thresholds });
    res.status(201).json(machine);
  } catch (err) {
    next(err);
  }
}

async function updateMachine(req, res, next) {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    res.json(machine);
  } catch (err) {
    next(err);
  }
}

async function deleteMachine(req, res, next) {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    await Reading.deleteMany({ machine: machine._id });
    res.json({ message: 'Machine deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMachines, getMachine, createMachine, updateMachine, deleteMachine };
