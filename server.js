const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

require('dotenv').config();

// New Swagger imports
// const swaggerUi = require('swagger-ui-express');
// const YAML = require('yamljs');
// const swaggerDocument = YAML.load('./swagger.yaml'); // Save the documentation as swagger.yaml

// Connect to database
connectDB();

const todoApp = express();

// Middleware
todoApp.use(cors());
todoApp.use(express.json({ extended: false }));

// Routesx
todoApp.use('/todoAuth', require('./src/routes/auth'));
todoApp.use('/todoItems', require('./src/routes/tasks'));

// Base route
todoApp.get('/', (req, res) => {
  res.send('Task Management API is running...');
});

//swagger Doc
// todoApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Export the express app as a Vercel function handler
module.exports = (req, res) => {
  todoApp(req, res);
};
