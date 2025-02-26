const mongoose = require('mongoose');
require('dotenv').config();

const connectTodoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Todo Database connected successfully');
  } catch (err) {
    console.error('Todo Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectTodoDB;