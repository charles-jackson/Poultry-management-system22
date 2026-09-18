const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes API Mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chickens', require('./routes/chickenRoutes'));
app.use('/api/feed', require('./routes/feedRoutes'));
app.use('/api/vaccinations', require('./routes/vaccinationRoutes'));
app.use('/api/eggs', require('./routes/eggRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Poultry Farm Management System API is running...');
});

// Custom Error Handler Middleware
app.use(errorHandler);

let PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, retrying on port ${Number(PORT) + 1}...`);
    PORT = Number(PORT) + 1;
    app.listen(PORT, () => {
      console.log(`Server started successfully on fallback port ${PORT}`);
    });
  } else {
    console.error(err);
  }
});
