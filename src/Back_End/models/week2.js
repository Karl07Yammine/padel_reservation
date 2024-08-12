const mongoose = require('mongoose');

const Week2Schema = new mongoose.Schema({
  weekCode: {
    type: String,
    required: true,
  },
  reserved: {
    type: Array,
    required: true,
  }
});

const Week2Model = mongoose.model('Week2', Week2Schema);

module.exports = Week2Model;