const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true }, // e.g. CNC, Conveyor, Press
    location: { type: String, required: true, trim: true }, // e.g. "Line 1"
    status: {
      type: String,
      enum: ['running', 'idle', 'down'],
      default: 'idle',
    },
    targetOutput: { type: Number, default: 100 }, // units/hour target
    thresholds: {
      temperature: { type: Number, default: 85 }, // deg C, above = alert
      vibration: { type: Number, default: 7 }, // mm/s, above = alert
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Machine', machineSchema);
