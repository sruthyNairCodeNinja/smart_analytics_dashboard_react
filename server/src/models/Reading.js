const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
      index: true,
    },
    timestamp: { type: Date, default: Date.now, index: true },
    temperature: { type: Number, required: true }, // deg C
    vibration: { type: Number, required: true }, // mm/s
    throughput: { type: Number, required: true }, // units produced in interval
    defectCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['running', 'idle', 'down'],
      required: true,
    },
  },
  { timestamps: false }
);

// Fast range queries per machine
readingSchema.index({ machine: 1, timestamp: -1 });

module.exports = mongoose.model('Reading', readingSchema);
