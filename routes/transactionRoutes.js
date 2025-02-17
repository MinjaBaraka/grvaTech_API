const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');
const AzamPay = require('../utils/azamPay');
const { v4: uuidv4 } = require('uuid');

// User routes
router.post('/', protect, async (req, res) => {
    try {
        const transaction = await Transaction.create({
            ...req.body,
            user: req.user._id
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
});

router.get('/my-transactions', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .populate('service')
            .sort('-createdAt');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Admin routes
router.get('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'username email')
            .populate('service')
            .sort('-createdAt');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

router.put('/:id/status', protect, restrictTo('admin'), async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction', error: error.message });
    }
});

// Create transaction and initiate payment
router.post('/purchase', protect, async (req, res) => {
    try {
        const { serviceId, phoneNumber } = req.body;
        const userId = req.user._id;

        // Find the service
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Create transaction
        const transaction = await Transaction.create({
            user: userId,
            service: serviceId,
            amount: service.price,
            paymentMethod: 'AzamPay',
            paymentDetails: {
                transactionId: uuidv4(),
                paymentNumber: phoneNumber,
                provider: 'AzamPay'
            }
        });

        // Initiate payment with Azam Pay
        const paymentResponse = await AzamPay.createPayment({
            amount: service.price,
            transactionId: transaction.paymentDetails.transactionId,
            phoneNumber: phoneNumber
        });

        // Update transaction with Azam Pay reference
        transaction.paymentDetails.azamPayReference = paymentResponse.referenceId;
        await transaction.save();

        res.status(201).json({
            message: 'Payment initiated successfully',
            transaction: transaction,
            paymentDetails: paymentResponse
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ 
            message: 'Payment initiation failed', 
            error: error.message 
        });
    }
});

// Azam Pay callback endpoint
router.post('/callback', async (req, res) => {
    try {
        const { referenceId, status, message } = req.body;
        
        // Find and update transaction
        const transaction = await Transaction.findOne({
            'paymentDetails.azamPayReference': referenceId
        });
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Update transaction status
        transaction.status = status === 'SUCCESS' ? 'completed' : 'failed';
        transaction.paymentDetails.paymentDate = new Date();
        await transaction.save();

        // If payment successful, update stock
        if (status === 'SUCCESS') {
            await Service.findByIdAndUpdate(
                transaction.service,
                { $inc: { stock: -1 } }
            );
        }

        res.json({ message: 'Callback processed successfully' });
    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({ message: 'Callback processing failed' });
    }
});

module.exports = router; 