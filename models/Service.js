const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['phones', 'laptops', 'tablets', 'accessories', 'other']
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    specifications: [{
        type: String
    }],
    images: [{
        type: String,
        required: true
    }],
    colors: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 100
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Service', serviceSchema); 