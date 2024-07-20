// marketData.js
const axios = require('axios');

class SchwabMarketData {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }

    async getQuotes(symbols) {
        const quotesUrl = `https://api.schwabapi.com/marketdata/v1/quotes?symbols=${symbols}&fields=quote%2Creference&indicative=false`;

        try {
            const response = await axios.get(quotesUrl, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching quotes:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getQuote(symbol) {
        const quotesUrl = `https://api.schwabapi.com/marketdata/v1/${symbol}/quotes?fields=quote%2Creference&indicative=false`;

        try {
            const response = await axios.get(quotesUrl, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching quotes:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

// Export the class
module.exports = SchwabMarketData;
