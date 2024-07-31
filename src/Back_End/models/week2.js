const mongoose = require('mongoose');

const Week2Schema = new mongoose.Schema({
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

const Week2Model = mongoose.model('Week', Week2Schema);

module.exports = Week2Model;