const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectDB = require('./mongoose');
const ReservationModel = require('./models/user');

const app = express();
const port = 3000;

// connectDB();

// Serve static files from the 'Front End' directory
const frontEndPath = path.join(__dirname, "..", 'Front_End');
app.use(express.static(frontEndPath));
app.use(bodyParser.urlencoded({ extended: true }));

// Define a route for the root
app.get('/', (req, res) => {
  const indexPath = path.join(frontEndPath, 'index.html');
  res.sendFile(indexPath);
});



// app.post("/c1", async (req, res) => {
//   try {
//     const { name, age } = req.body;
//     const reservationDoc = new ReservationModel({ name, age });
//     const savedDoc = await reservationDoc.save();
//     console.log('Reservation saved to MongoDB:', savedDoc);
//   } catch (error) {
//     console.log(error);
//   }
// });



app.post('/c1', (req, res) => {
  const checkedCheckboxes = [];

  // Iterate over the request body to find checked checkboxes
  for (const key in req.body) {
    checkedCheckboxes.push(key);
  }

  res.send(`Checked checkboxes: ${checkedCheckboxes.join(', ')}`);
});





// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});