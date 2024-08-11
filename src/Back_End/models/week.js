const mongoose = require('mongoose');

const WeekSchema = new mongoose.Schema({
  weekCode: {
    type: String,
    required: true,
  },
  reserved: {
    type: Array,
    required: true,
  }
});

const WeekModel = mongoose.model('Week', WeekSchema);

module.exports = WeekModel;