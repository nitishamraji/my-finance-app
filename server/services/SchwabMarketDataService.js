// marketData.js
const axios = require('axios');
const schwabAuth = require('../services/SchwabAuth'); 

class SchwabMarketData {
    constructor() {
    }

    async getQuotes(symbols) {
        const quotesUrl = `https://api.schwabapi.com/marketdata/v1/quotes?symbols=${symbols}&fields=quote%2Creference&indicative=false`;
        let accessToken = await schwabAuth.getAccessToken();
        try {
            const response = await axios.get(quotesUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching getQuotes: ', error);
            throw error;
        }
    }

    async getHistoryData(symbol, queryParams) {
        const quotesUrl = `https://api.schwabapi.com/marketdata/v1/pricehistory?${queryParams}&symbol=${symbol}`;
        let accessToken = await schwabAuth.getAccessToken();
        
        try {
            const response = await axios.get(quotesUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
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
