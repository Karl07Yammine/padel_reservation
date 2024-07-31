const mongoose = require('mongoose');

const WeekSchema = new mongoose.Schema({
  weekCode: {
    type: String,
    required: true,
  },
  reserved: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

const WeekModel = mongoose.model('Week', WeekSchema);

module.exports = WeekModel;