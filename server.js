const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
require('dotenv').config();

// New Swagger imports
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Save the documentation as swagger.yaml

// Connect to database
connectDB();

const todoApp = express();

// Middleware
todoApp.use(cors());
todoApp.use(express.json({ extended: false }));

// Routes
todoApp.use('/todoAuth', require('./src/routes/auth'));
todoApp.use('/todoItems', require('./src/routes/tasks'));

// Base route
todoApp.get('/', (req, res) => {
  res.send('Task Management API is running...');
});

//swagger Doc
todoApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Environment variables
const todoPort = process.env.PORT || 5000;

// Start server
todoApp.listen(todoPort, () => {
  console.log(`
=========================================
🚀 Server running on port ${todoPort}
  
📌 API URL:           http://localhost:${todoPort}
📚 API Documentation: http://localhost:${todoPort}/api-docs
=========================================
  `);
});