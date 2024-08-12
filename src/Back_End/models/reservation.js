const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  reserve_week: {
    type: String,
    required: true,
  },
  reserve: {
    type: Array,
    required: true,
  },
  court: {
    type: String,
    required: true,
  }
});

const ReservationModel = mongoose.model('Reservation', ReservationSchema);

module.exports = ReservationModel;