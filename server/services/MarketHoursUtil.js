const moment = require('moment')

const HM_FORMAT = 'HH:mm:ss'
const marketOpenTime = "04:00"
const marketCloseTime = "19:00"
const marketOpen = moment(marketOpenTime,HM_FORMAT)
const marketClose = moment(marketCloseTime,HM_FORMAT)

const MARKET_HOURS_UTIL = {
    isMarketOpen: () => {
      const currentTime = moment()
      if(moment().isoWeekday() > 5) {
          return false
      }

      if (moment(currentTime).isBetween(marketOpen,marketClose)) {
          return true
      }

      return false
  },

  getLastMarketCloseTime: () => {
      let daysOffset = 0

      switch (moment().isoWeekday()) {
          case 1:
              daysOffset = -3
              break
          case 6:
              daysOffset = -1
              break
          case 7:
              daysOffset = -2
              break
          default:
              daysOffset = 0
      }

      // if current time is weekday post market close we do not have to offset any days
      if ( moment().isoWeekday < 6 && moment(moment()).isSameOrAfter(marketCloseTime)) {
          daysOffset = 0
      }
      return moment(marketCloseTime,HM_FORMAT).add(daysOffset,'d')
  },

  isTimeStampAfterLastMarketCloseTime: (lastUpdatedTs) => {

      if( !lastUpdatedTs ) {
        return false
      }

      // Data is never latest if market is still open
      if (MARKET_HOURS_UTIL.isMarketOpen()) {
          return false
      }

      // Our lastDBUpdatedTs should always be same or after previous market close.
      if (moment(lastUpdatedTs).isBefore(MARKET_HOURS_UTIL.getLastMarketCloseTime())) {
          return false
      }

      return true
  }
};

module.exports = MARKET_HOURS_UTIL
