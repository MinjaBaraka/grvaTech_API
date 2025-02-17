const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const createToken = (id) => {
    try {
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        console.log('Token created:', token);
        return token;
    } catch (error) {
        console.error('Token creation error:', error);
        throw error;
    }
};

exports.register = async (req, res) => {
    try {
        console.log('Registration request body:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role, phoneNumber } = req.body;
        
        console.log('Extracted data:', { username, email, role, phoneNumber });

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            console.log('User already exists:', userExists);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user with explicit fields
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'user',
            phoneNumber
        });

        const token = createToken(user._id);
        console.log('User created successfully:', user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        console.error('Registration error details:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = createToken(user._id);

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        // In a real-world app, you might want to blacklist the token
        // For now, we'll just send a success response
        res.json({ 
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email, phoneNumber, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        // If updating password
        if (currentPassword && newPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            user.password = newPassword;
        }

        // Update other fields if provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 