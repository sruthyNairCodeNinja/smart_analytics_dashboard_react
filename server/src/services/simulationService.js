const Machine = require('../models/Machine');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');

// Simple in-memory random walk per machine so behavior looks continuous
// rather than fully random noise from tick to tick.
const machineState = new Map();

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getState(machineId) {
  if (!machineState.has(machineId)) {
    machineState.set(machineId, {
      temperature: rand(55, 70),
      vibration: rand(1.5, 3.5),
    });
  }
  return machineState.get(machineId);
}

function nextStatus(currentStatus) {
  // Weighted random transition: mostly stay running, rare downtime/idle events.
  const roll = Math.random();
  if (currentStatus === 'down') {
    // machines recover after a short downtime
    return roll < 0.4 ? 'down' : 'running';
  }
  if (roll < 0.03) return 'down';
  if (roll < 0.1) return 'idle';
  return 'running';
}

async function generateReadingForMachine(machine) {
  const state = getState(String(machine._id));
  const status = nextStatus(machine.status);

  let temperature;
  let vibration;
  let throughput;
  let defectCount;

  if (status === 'down') {
    // cooling down, no vibration, no output
    state.temperature = clamp(state.temperature - rand(1, 4), 25, 120);
    state.vibration = clamp(state.vibration - rand(0.3, 1), 0, 15);
    temperature = state.temperature;
    vibration = state.vibration;
    throughput = 0;
    defectCount = 0;
  } else if (status === 'idle') {
    state.temperature = clamp(state.temperature + rand(-1, 1), 25, 120);
    state.vibration = clamp(state.vibration + rand(-0.3, 0.3), 0, 15);
    temperature = state.temperature;
    vibration = state.vibration;
    throughput = 0;
    defectCount = 0;
  } else {
    // running: drift upward slightly with a small chance of a spike
    const spike = Math.random() < 0.07;
    state.temperature = clamp(
      state.temperature + rand(-1, 2) + (spike ? rand(10, 25) : 0),
      25,
      140
    );
    state.vibration = clamp(
      state.vibration + rand(-0.4, 0.5) + (spike ? rand(4, 8) : 0),
      0,
      20
    );
    temperature = state.temperature;
    vibration = state.vibration;

    const perTickTarget = machine.targetOutput / 12; // assuming ~5s ticks, 12 ticks/min
    throughput = Math.max(0, Math.round(rand(perTickTarget * 0.7, perTickTarget * 1.15)));
    defectCount = Math.random() < 0.1 ? Math.round(rand(1, 5)) : Math.round(rand(0, 1));
  }

  const reading = await Reading.create({
    machine: machine._id,
    temperature: Number(temperature.toFixed(1)),
    vibration: Number(vibration.toFixed(2)),
    throughput,
    defectCount,
    status,
  });

  // update machine's live status if it changed
  if (machine.status !== status) {
    machine.status = status;
    await machine.save();

    if (status === 'down') {
      await Alert.create({
        machine: machine._id,
        type: 'downtime',
        severity: 'high',
        message: `${machine.name} went down unexpectedly.`,
        reading: reading._id,
      });
    }
  }

  // threshold-based alerts
  if (temperature > machine.thresholds.temperature) {
    await Alert.create({
      machine: machine._id,
      type: 'overheat',
      severity: temperature > machine.thresholds.temperature + 15 ? 'critical' : 'high',
      message: `${machine.name} temperature at ${temperature.toFixed(
        1
      )}°C exceeds threshold of ${machine.thresholds.temperature}°C.`,
      reading: reading._id,
    });
  }

  if (vibration > machine.thresholds.vibration) {
    await Alert.create({
      machine: machine._id,
      type: 'excess_vibration',
      severity: vibration > machine.thresholds.vibration + 5 ? 'critical' : 'medium',
      message: `${machine.name} vibration at ${vibration.toFixed(
        2
      )}mm/s exceeds threshold of ${machine.thresholds.vibration}mm/s.`,
      reading: reading._id,
    });
  }

  if (defectCount >= 4) {
    await Alert.create({
      machine: machine._id,
      type: 'defect_spike',
      severity: 'medium',
      message: `${machine.name} produced ${defectCount} defects in the last reading.`,
      reading: reading._id,
    });
  }

  return reading;
}

let intervalHandle = null;

function startSimulation() {
  const intervalMs = Number(process.env.SIMULATION_INTERVAL_MS) || 5000;

  if (intervalHandle) clearInterval(intervalHandle);

  intervalHandle = setInterval(async () => {
    try {
      const machines = await Machine.find();
      await Promise.all(machines.map((m) => generateReadingForMachine(m)));
    } catch (err) {
      console.error('[simulation] tick failed:', err.message);
    }
  }, intervalMs);

  console.log(`[simulation] started, generating readings every ${intervalMs}ms`);
}

function stopSimulation() {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
}

module.exports = { startSimulation, stopSimulation, generateReadingForMachine };
