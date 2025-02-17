const express = require('express');
const multer = require('multer');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();
const Service = require('../models/Service');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/products')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
    }
});

const upload = multer({ storage: storage });

// Public routes
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service', error: error.message });
    }
});

// Admin only routes
router.post('/', protect, restrictTo('admin'), upload.array('images', 5), async (req, res) => {
    try {
        const imageFiles = req.files.map(file => file.filename);
        
        const service = await Service.create({
            ...req.body,
            images: imageFiles
        });
        
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error creating service', error: error.message });
    }
});

router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error updating service', error: error.message });
    }
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error: error.message });
    }
});

// Update product images
router.put('/:id/images', protect, restrictTo('admin'), upload.array('images', 5), async (req, res) => {
    try {
        const imageFiles = req.files.map(file => file.filename);
        
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { $push: { images: { $each: imageFiles } } },
            { new: true }
        );
        
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error updating service images', error: error.message });
    }
});

module.exports = router; 