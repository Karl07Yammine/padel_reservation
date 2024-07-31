const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectDB = require('./mongoose');
const UserModel = require('./models/user');

const app = express();
const port = 3000;

connectDB();

// Serve static files from the 'Front End' directory
const frontEndPath = path.join(__dirname, "..", 'Front_End');
app.use(express.static(frontEndPath));
app.use(bodyParser.urlencoded({ extended: true }));

// Define a route for the root
app.get('/sin', (req, res) => {
  const indexPath = path.join(frontEndPath, 'signin.html');
  res.sendFile(indexPath);
});



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

    // Respond with the saved document
    res.status(201).json(savedDoc);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post('/c1', (req, res) => {
  const checkedCheckboxes = [];

  // Iterate over the request body to find checked checkboxes
  for (const key in req.body) {
    checkedCheckboxes.push(key);
  }

  res.send(`Checked checkboxes: ${checkedCheckboxes.join(', ')}`);
});


app.get('/sup', (req, res) => {
  const signupPath = path.join(frontEndPath, 'signup.html');
  res.sendFile(signupPath);
})




// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});