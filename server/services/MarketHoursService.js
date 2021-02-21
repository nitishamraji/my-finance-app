const MARKET_HOURS_UTIL = require('./MarketHoursUtil')

class MarketHours {
  isMarketOpen() {
    return MARKET_HOURS_UTIL.isMarketOpen()
  }
}

module.exports = MarketHours;
