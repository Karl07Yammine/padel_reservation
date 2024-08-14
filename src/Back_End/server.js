require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectDB = require('./mongoose');
const UserModel = require('./models/user');
const WeekModel = require('./models/week');
const Week2Model = require('./models/week2');
const ReservationModel = require('./models/reservation');
const session = require('express-session');
const MongoStore = require('connect-mongo');
let court = true;
let reservationId = null;

const app = express();
const port = 3000;

connectDB();

// Serve static files from the 'Front End' directory
const frontEndPath = path.join(__dirname, "..", 'Front_End');
app.use(express.static(frontEndPath));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
// Specify the directory where your EJS templates are located
app.set('views', path.join(__dirname, 'templates'));

// Define a route for the root
app.get('/sin', (req, res) => {
  const indexPath = path.join(frontEndPath, 'signin.html');
  res.sendFile(indexPath);
});


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }, // Set secure to true if using HTTPS
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  })
}));


let weekcd = null;

app.post("/signup", async (req, res) => {
  try {
    const { name, famname, username, number, BirthDate, password } = req.body;

    // Check if the username already exists
    const existingUser = await UserModel.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create a new user document
    const UserDoc = new UserModel({ name, famname, username, number, BirthDate, password });
    const savedDoc = await UserDoc.save();


    const loginPath = path.join(frontEndPath, 'signin.html');
    res.sendFile(loginPath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username exists
    const existingUser = await UserModel.findOne({ username: username });
    if (!existingUser || existingUser.password !== password) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Save username in session
    req.session.username = username;

    const calendarPath = path.join(frontEndPath, 'calendar.html');
    res.sendFile(calendarPath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie('connect.sid'); // Name of the session ID cookie
    res.status(200).json({ message: "Logged out successfully" });
  });
});



app.post('/c1', (req, res) => {
  const checkedCheckboxes = [];

  // Iterate over the request body to find checked checkboxes
  for (const key in req.body) {
    checkedCheckboxes.push(key);
  }
  // Check if the array is empty
  if (checkedCheckboxes.length === 0) {
    return res.status(400).send({ success: false, message: 'No checkboxes selected. Please select at least one time slot.' });
  }

  if (court) {
    const newReservation = new ReservationModel({
      user: req.session.username,
      reserve_week: weekcd,
      reserve: checkedCheckboxes,
      court: 'Court 1'
    });

    newReservation.save()
      .then((savedReservation) => {
        const reservationId = savedReservation._id; // Store the ID locally

        return WeekModel.findOneAndUpdate(
          { weekCode: weekcd },
          {
            $push: {
              reserved: { $each: checkedCheckboxes }
            }
          },
          {
            new: true, // Return the updated document
            upsert: true // Create a new document if it doesn't exist
          }
        )
        .then((result) => {
          const template = {
            username: req.session.username,
            court: "Court 1",
            time: convertTimeCodesToInterval(checkedCheckboxes),
            week: weekcd,
            reservationId: reservationId // Use the locally stored ID
          };
          res.render("confirmation", template);
        });
      })
      .catch((error) => {
        console.error('Error saving reservation or updating week document:', error);
        res.status(500).send({ success: false, message: 'An error occurred while processing the reservation', error: error.message });
      });
  } else if (!court) {
    const newReservation = new ReservationModel({
      user: req.session.username,
      reserve_week: weekcd,
      reserve: checkedCheckboxes,
      court: 'Court 2'
    });

    newReservation.save()
      .then((savedReservation) => {
        const reservationId = savedReservation._id; // Store the ID locally

        return Week2Model.findOneAndUpdate(
          { weekCode: weekcd },
          {
            $push: {
              reserved: { $each: checkedCheckboxes }
            }
          },
          {
            new: true, // Return the updated document
            upsert: true // Create a new document if it doesn't exist
          }
        )
        .then((result) => {
          const template = {
            username: req.session.username,
            court: "Court 2",
            time: convertTimeCodesToInterval(checkedCheckboxes),
            week: weekcd,
            reservationId: reservationId // Use the locally stored ID
          };
          res.render("confirmation", template);
        });
      })
      .catch((error) => {
        console.error('Error saving reservation or updating week document:', error);
        res.status(500).send({ success: false, message: 'An error occurred while processing the reservation', error: error.message });
      });
  }
});



app.get('/sup', (req, res) => {
  const signupPath = path.join(frontEndPath, 'signup.html');
  res.sendFile(signupPath);
})


app.post('/checkWeekCode', (req, res) => {
  const { weekCode } = req.body;

  WeekModel.findOne({ weekCode: weekCode })
      .then(existingWeek => {
          if (existingWeek) {
              res.json({ reserved: existingWeek.reserved }); // Return only the 'reserved' array
              weekcd = weekCode;
              court = true;
          } else {
              const newWeek = new WeekModel({
                  weekCode: weekCode,
                  reserved: [] // Initialize reserved as an empty array
              });

              newWeek.save()
                  .then(savedWeek => {
                      res.json({ reserved: savedWeek.reserved }); // Return the 'reserved' array of the newly created document
                      weekcd = weekCode;
                      court = true;
                  })
                  .catch(error => {
                      console.error('Error creating new week:', error);
                      res.status(500).json({ error: 'Error creating new week' });
                  });
          }
      })
      .catch(error => {
          console.error('Error finding week:', error);
          res.status(500).json({ error: 'Error finding week' });
      });
});

app.post('/checkWeekCode2', (req, res) => {
  const { weekCode } = req.body;

  Week2Model.findOne({ weekCode: weekCode })
      .then(existingWeek => {
          if (existingWeek) {
              res.json({ reserved: existingWeek.reserved }); // Return only the 'reserved' array
              weekcd = weekCode;
              court = false;
          } else {
              const newWeek = new Week2Model({
                  weekCode: weekCode,
                  reserved: [] // Initialize reserved as an empty array
              });

              newWeek.save()
                  .then(savedWeek => {
                      res.json({ reserved: savedWeek.reserved }); // Return the 'reserved' array of the newly created document
                      weekcd = weekCode;
                      court = false;
                  })
                  .catch(error => {
                      console.error('Error creating new week:', error);
                      res.status(500).json({ error: 'Error creating new week' });
                  });
          }
      })
      .catch(error => {
          console.error('Error finding week:', error);
          res.status(500).json({ error: 'Error finding week' });
      });
});



app.post('/cancel-reservation', (req, res) => {
  const { reservationId } = req.body; // Correct destructuring of reservationId from req.body
  processReservationById(reservationId);
  res.write("successfully canceled");
  res.send();
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});




async function processReservationById(reservationId) {
  try {
      // Step 1: Retrieve the reservation by ID
      const reservation = await ReservationModel.findById(reservationId).exec();
      if (!reservation) {
          console.log('Reservation not found.');
          return;
      }

      // Step 2: Extract the relevant data
      const { reserve_week, reserve, court } = reservation;
      // Step 3: Delete the reservation
      await ReservationModel.deleteOne({ _id: reservation._id });

      // Step 4: Determine which week model to update based on the court
      const WeekModelToUpdate = court === 'Court 1' ? WeekModel : Week2Model;

      await WeekModelToUpdate.findOneAndUpdate(
          { weekCode: reserve_week },
          { $pullAll: { reserved: reserve } }, // Remove all matching reserve items from the reserved array
          { new: true } // Return the updated document
      );

      console.log('Reservation processed and corresponding data removed from the Week schema successfully.');
  } catch (error) {
      console.error('Error processing the reservation:', error);
  }
}



function convertTimeCodesToInterval(timeCodes) {
  // Mapping from day abbreviations to full names
  const dayNames = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'TH': 'Thursday',
      'F': 'Friday',
      'S': 'Saturday',
      'SU': 'Sunday'
  };

  // Function to convert military time to standard time
  function convertToStandardTime(time) {
      let hour = parseInt(time.slice(0, 2));
      let minutes = time.slice(2);
      let ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12; // Convert to 12-hour format
      return `${hour}:${minutes} ${ampm}`;
  }

  // Function to add 30 minutes to the time
  function addThirtyMinutes(time) {
      let hour = parseInt(time.slice(0, 2));
      let minutes = parseInt(time.slice(2));

      minutes += 30;

      if (minutes >= 60) {
          minutes -= 60;
          hour += 1;
      }

      return `${hour.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
  }

  if (timeCodes.length === 0) {
      return '';
  }

  // Extract day and times
  const dayCode = timeCodes[0].slice(0, timeCodes[0].length - 4); // Get the day part (e.g., 'S' for Saturday)
  const times = timeCodes.map(code => code.slice(code.length - 4)); // Get the time parts (e.g., '0900')

  // Convert start and end times to readable format
  const startTime = convertToStandardTime(times[0]);
  const endTime = convertToStandardTime(addThirtyMinutes(times[times.length - 1])); // Correctly add 30 minutes

  // Get the full day name
  const dayName = dayNames[dayCode];

  // Combine into final interval string
  const interval = `${dayName} ${startTime} -> ${endTime}`;
  return interval;
}