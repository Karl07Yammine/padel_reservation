require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectDB = require('./mongoose');
const UserModel = require('./models/user');
const WeekModel = require('./models/week')
const session = require('express-session');
const MongoStore = require('connect-mongo');

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

  const weekCode = 'W24-08-12-18'; // Example weekCode

  WeekModel.findOneAndUpdate(
    { weekCode: weekCode }, // Filter: Find the document with this weekCode
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
          } else {
              const newWeek = new WeekModel({
                  weekCode: weekCode,
                  reserved: [] // Initialize reserved as an empty array
              });

              newWeek.save()
                  .then(savedWeek => {
                      res.json({ reserved: savedWeek.reserved }); // Return the 'reserved' array of the newly created document
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


// app.post('/checkWeekCode', (req, res) => {
//   console.log('Request body:', req.body); // Log the request body

//   const { weekCode } = req.body;

//   if (!weekCode) {
//       return res.status(400).json({ error: 'weekCode is required' });
//   }

//   // Rest of the logic...
// });






// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});