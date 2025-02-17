const axios = require('axios');

class AzamPay {
    constructor() {
        this.appName = process.env.AZAMPAY_APP_NAME;
        this.clientId = process.env.AZAMPAY_CLIENT_ID;
        this.clientSecret = process.env.AZAMPAY_CLIENT_SECRET;
        this.baseURL = process.env.AZAMPAY_API_URL;
    }

    async getAccessToken() {
        try {
            const response = await axios.post(`${this.baseURL}/api/v1/auth/token`, {
                appName: this.appName,
                clientId: this.clientId,
                clientSecret: this.clientSecret
            });
            return response.data.accessToken;
        } catch (error) {
            throw new Error('Failed to get Azam Pay access token');
        }
    }

    async createPayment(data) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(`${this.baseURL}/api/v1/payments`, {
                amount: data.amount,
                currency: "TZS",
                externalId: data.transactionId,
                paymentNumber: data.phoneNumber,
                provider: "AzamPesa",
                merchantAccountNumber: process.env.AZAMPAY_MERCHANT_NUMBER,
                merchantMobileNumber: process.env.AZAMPAY_MERCHANT_PHONE,
                merchantName: process.env.AZAMPAY_MERCHANT_NAME,
                callbackUrl: `${process.env.BASE_URL}/api/transactions/callback`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Payment creation error:', error.response?.data || error.message);
            throw new Error('Payment initiation failed');
        }
    }
}

module.exports = new AzamPay(); 