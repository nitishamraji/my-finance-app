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
            console.error('Error fetching getQuotes: ', error);
            throw error;
        }
    }

    async getHistoryData(symbol, queryParams) {
        const quotesUrl = `https://api.schwabapi.com/marketdata/v1/${symbol}/pricehistory?{queryParams}`;

        try {
            const response = await axios.get(quotesUrl, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching getHistoryData: ', error);
            throw error;
        }
    }
}

// Export the class
module.exports = SchwabMarketData;
