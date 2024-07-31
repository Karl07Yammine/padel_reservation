const mongoose = require('mongoose');

// Replace the following with your MongoDB connection string
const uri = 'mongodb+srv://user2:Karl.yammine11@padel0.ijw0irn.mongodb.net/?retryWrites=true&w=majority&appName=Padel0';

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
