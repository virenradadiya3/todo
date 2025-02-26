const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

require('dotenv').config();

// New Swagger imports
// const swaggerUi = require('swagger-ui-express');
// const YAML = require('yamljs');

// Connect to database
connectDB();

const todoApp = express();

// Middleware
todoApp.use(cors());
todoApp.use(express.json({ extended: false }));



// const isProduction = process.env.NODE_ENV === 'production';

// const baseUrl = isProduction
//     ? `https://${process.env.VERCEL_URL}` // or your production URL if necessary
//     : 'http://localhost:5002'; // Local development URL

// // Load and modify the swagger.yaml file dynamically
// const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));

// Replace the placeholder with the actual server URL
swaggerDocument.servers[0].url = baseUrl;


// Routes
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
