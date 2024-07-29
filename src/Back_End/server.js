const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the 'Front End' directory
const frontEndPath = path.join(__dirname, "..", 'Front_End');
app.use(express.static(frontEndPath));

// Define a route for the root
app.get('/', (req, res) => {
  const indexPath = path.join(frontEndPath, 'index.html');
  res.sendFile(indexPath);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});