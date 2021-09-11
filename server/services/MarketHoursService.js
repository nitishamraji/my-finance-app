const MARKET_HOURS_UTIL = require('./MarketHoursUtil')

class MarketHours {
  isMarketOpen() {
    return MARKET_HOURS_UTIL.isMarketOpen()
  }

  getLastMarketCloseTime() {
    return MARKET_HOURS_UTIL.getLastMarketCloseTime()
  }

  isTimeStampAfterLastMarketCloseTime(pTimeStamp) {
    return MARKET_HOURS_UTIL.isTimeStampAfterLastMarketCloseTime(pTimeStamp)
  }
}

module.exports = MarketHours;
