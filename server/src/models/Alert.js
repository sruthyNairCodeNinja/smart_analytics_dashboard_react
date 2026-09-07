const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['overheat', 'excess_vibration', 'downtime', 'defect_spike'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    message: { type: String, required: true },
    reading: { type: mongoose.Schema.Types.ObjectId, ref: 'Reading' },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

alertSchema.index({ resolved: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
