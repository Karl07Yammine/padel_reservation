const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
});

const ReservationModel = mongoose.model('Reservation', ReservationSchema);

module.exports = ReservationModel;
