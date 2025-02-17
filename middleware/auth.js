const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        // 1. Get token from header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Please log in to access this route' });
        }

        console.log('Received token:', token);
        console.log('JWT_SECRET:', process.env.JWT_SECRET);

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // 3. Check if user exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        // 4. Grant access
        req.user = user;
        next();
    } catch (error) {
        console.log('Token verification error:', error);
        return res.status(401).json({ message: 'Not authorized', error: error.message });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'You do not have permission to perform this action' 
            });
        }
        next();
    };
}; 