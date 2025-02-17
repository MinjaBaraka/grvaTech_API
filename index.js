require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Wrap mongoose connection in try-catch
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error; // Re-throw to be caught by global error handler
    }
};

// Import routes with try-catch
try {
    const authRoutes = require('./routes/authRoutes');
    const serviceRoutes = require('./routes/serviceRoutes');
    const transactionRoutes = require('./routes/transactionRoutes');

    // Use routes
    app.use('/api/auth', authRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/transactions', transactionRoutes);
} catch (error) {
    console.error('Error loading routes:', error);
}

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Remove static file serving for serverless
// app.use('/uploads', express.static('public/uploads'));

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    
    // Determine if MongoDB connection error
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
        return res.status(503).json({
            message: 'Database connection error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable'
        });
    }
    
    res.status(err.status || 500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Connect to database before starting server
connectDB();

// Export for serverless
module.exports = app;

// Only listen in development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}