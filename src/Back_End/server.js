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

const app = express();
const port = 3000;

connectDB();

// Serve static files from the 'Front End' directory
const frontEndPath = path.join(__dirname, "..", 'Front_End');
app.use(express.static(frontEndPath));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    console.log('User saved to MongoDB:', savedDoc);


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
    console.log("loaded calendar");
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

  if (court) {
    const newReservation = new ReservationModel({
      user: req.session.username,             // Replace with the actual user
      reserve_week: weekcd,  // Replace with the actual week codes
      reserve: checkedCheckboxes,  // Replace with the actual reservation time
      court: 'Court 1'             // Replace with the actual court name or number
  });
  newReservation.save()
    .then((savedReservation) => {
        console.log('Reservation saved successfully:', savedReservation);
    })
    .catch((error) => {
        console.error('Error saving reservation:', error);
    });


    WeekModel.findOneAndUpdate(
      { weekCode: weekcd }, // Filter: Find the document with this weekCode
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
      console.log('Week document:', result);
      res.send({ success: true, message: 'Week document updated successfully', data: result });
    })
    .catch((error) => {
      console.error('Error updating or creating the week document:', error);
      res.status(500).send({ success: false, message: 'An error occurred while updating the week document', error: error.message });
    });
  }else if (!court) {
    const newReservation = new ReservationModel({
      user: req.session.username,             // Replace with the actual user
      reserve_week: weekcd,  // Replace with the actual week codes
      reserve: checkedCheckboxes,  // Replace with the actual reservation time
      court: 'Court 2'             // Replace with the actual court name or number
  });
  newReservation.save()
    .then((savedReservation) => {
        console.log('Reservation saved successfully:', savedReservation);
    })
    .catch((error) => {
        console.error('Error saving reservation:', error);
    });


    Week2Model.findOneAndUpdate(
      { weekCode: weekcd }, // Filter: Find the document with this weekCode
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
      console.log('Week document:', result);
      res.send({ success: true, message: 'Week document updated successfully', data: result });
    })
    .catch((error) => {
      console.error('Error updating or creating the week document:', error);
      res.status(500).send({ success: false, message: 'An error occurred while updating the week document', error: error.message });
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







// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});