const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

const dummyServices = [
    {
        name: "iPhone 14 Pro Max",
        description: "Apple's flagship smartphone with advanced camera system",
        price: 1299.99,
        category: "phones",
        brand: "Apple",
        model: "iPhone 14 Pro Max",
        specifications: [
            "6.7-inch Super Retina XDR display",
            "A16 Bionic chip",
            "48MP Main Camera",
            "256GB Storage",
            "5G Capable",
            "Dynamic Island"
        ],
        images: [
            "iphone14promax-1.jpg",
            "iphone14promax-2.jpg",
            "iphone14promax-3.jpg"
        ],
        colors: ["Space Black", "Silver", "Gold", "Deep Purple"],
        stock: 50,
        ratings: {
            average: 4.8,
            count: 325
        }
    },
    {
        name: "Samsung Galaxy S23 Ultra",
        description: "Premium Android smartphone with S Pen functionality",
        price: 1199.99,
        category: "phones",
        brand: "Samsung",
        model: "Galaxy S23 Ultra",
        specifications: [
            "6.8-inch Dynamic AMOLED 2X",
            "Snapdragon 8 Gen 2",
            "200MP Main Camera",
            "512GB Storage",
            "5G Capable",
            "S Pen included"
        ],
        images: [
            "s23ultra-1.jpg",
            "s23ultra-2.jpg",
            "s23ultra-3.jpg"
        ],
        colors: ["Phantom Black", "Cream", "Green", "Lavender"],
        stock: 45,
        ratings: {
            average: 4.7,
            count: 283
        }
    },
    {
        name: "MacBook Pro 16",
        description: "Powerful laptop for professionals",
        price: 2499.99,
        category: "laptops",
        brand: "Apple",
        model: "MacBook Pro 16-inch",
        specifications: [
            "16-inch Liquid Retina XDR display",
            "M2 Pro chip",
            "32GB Unified Memory",
            "1TB SSD Storage",
            "Up to 22 hours battery life",
            "1080p FaceTime HD camera"
        ],
        images: [
            "macbookpro16-1.jpg",
            "macbookpro16-2.jpg",
            "macbookpro16-3.jpg"
        ],
        colors: ["Space Gray", "Silver"],
        stock: 30,
        ratings: {
            average: 4.9,
            count: 178
        }
    },
    {
        name: "iPad Pro 12.9",
        description: "Professional tablet with M2 chip",
        price: 1099.99,
        category: "tablets",
        brand: "Apple",
        model: "iPad Pro 12.9-inch",
        specifications: [
            "12.9-inch Liquid Retina XDR display",
            "M2 chip",
            "256GB Storage",
            "5G Capable",
            "Apple Pencil 2 compatible",
            "ProMotion technology"
        ],
        images: [
            "ipadpro-1.jpg",
            "ipadpro-2.jpg",
            "ipadpro-3.jpg"
        ],
        colors: ["Space Gray", "Silver"],
        stock: 40,
        ratings: {
            average: 4.8,
            count: 156
        }
    },
    {
        name: "AirPods Pro 2",
        description: "Premium wireless earbuds with noise cancellation",
        price: 249.99,
        category: "accessories",
        brand: "Apple",
        model: "AirPods Pro 2nd Generation",
        specifications: [
            "Active Noise Cancellation",
            "Adaptive Transparency",
            "Personalized Spatial Audio",
            "Up to 6 hours listening time",
            "MagSafe Charging Case",
            "Water resistant"
        ],
        images: [
            "airpodspro2-1.jpg",
            "airpodspro2-2.jpg",
            "airpodspro2-3.jpg"
        ],
        colors: ["White"],
        stock: 100,
        ratings: {
            average: 4.7,
            count: 432
        }
    }
];

const seedServices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Clear existing services
        await Service.deleteMany({});
        
        // Insert dummy services
        await Service.insertMany(dummyServices);
        
        console.log('Dummy services seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding services:', error);
        process.exit(1);
    }
};

seedServices(); 