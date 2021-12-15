const db = require('../sequelize/models')
const tdaclient = require('tda-api-client');
const axios = require("axios");
const moment = require('moment');
const MarketHoursService = require('../services/MarketHoursService')
const rp = require("request-promise")
const cheerio = require("cheerio")

function getQuoteUrl(symbol) {
  // return "https://sandbox.iexapis.com/stable/stock/"+symbol+"/quote?token=Tpk_04291f94e91b4cdd8f4245dc7a730369";

  // return "https://sandbox.iexapis.com/stable/stock/"+symbol+"/quote?token=pk_cc4cd8e1d02945f8a242f6b54c174370";
  return "https://cloud.iexapis.com/stable/stock/"+symbol+"/quote?token=pk_cc4cd8e1d02945f8a242f6b54c174370";
}

// function getDateQuoteUrl(symbol, date) {
//   // return "https://sandbox.iexapis.com/stable//stock/AAPL/chart/date/20201201?chartByDay=true&token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
//
//   // return "https://sandbox.iexapis.com/stable//stock/"+symbol.replace(/\s/g, '')+"/chart/"+date+"/20201201?chartByDay=true&token=pk_cc4cd8e1d02945f8a242f6b54c174370";
//   return "https://cloud.iexapis.com/stable/stock/"+symbol.replace(/\s/g, '')+"/chart/"+date+"?chartByDay=true&token=pk_cc4cd8e1d02945f8a242f6b54c174370";
//
//   // return "https://sandbox.iexapis.com/stable//stock/"+symbol+"/chart/date/"+date+"?chartByDay=true&token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
//   // return "https://sandbox.iexapis.com/stable/stock/"+symbol+"/chart/date/"+date+"?chartByDay=true&token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
// }

function getDateQuoteUrl(symbol, range) {
  return "https://cloud.iexapis.com/stable/stock/"+symbol.replace(/\s/g, '')+"/chart/"+range+"?chartByDay=true&token=pk_cc4cd8e1d02945f8a242f6b54c174370";
}

function getSupportedSymbolsUrl() {
  // return "https://sandbox.iexapis.com/stable/ref-data/symbols?token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
  // return "https://sandbox.iexapis.com/stable/ref-data/symbols?token=Tpk_04291f94e91b4cdd8f4245dc7a730369"
  return "https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_cc4cd8e1d02945f8a242f6b54c174370";
}

function getDate(num, isDays) {
    var dateForQuote = moment();
    dateForQuote = isDays ? dateForQuote.subtract(num, 'days') : dateForQuote.subtract(num, 'months');
    dateForQuote = dateForQuote.format("YYYYMMDD");
    return dateForQuote;
}

async function getTdaHistoryData(symbol) {
    const priceHistoryConfig = {
      periodType: tdaclient.pricehistory.PERIOD_TYPE.MONTH,
      period: 3,
      frequencyType: tdaclient.pricehistory.FREQUENCY_TYPE.YEAR.WEEKLY,
      frequency: tdaclient.pricehistory.FREQUENCY.WEEKLY.ONE,
      symbol: symbol,
      getExtendedHours: 'true'
  }



  // const historyQuoteRes = await tdaclient.pricehistory.getPriceHistory(priceHistoryConfig);
  const resp = await axios.get(`https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory?apikey=JKL8G1DBVHAVQMKASBPZ87MNMYQLEA0H&periodType=month&period=3&frequencyType=weekly&frequency=1`)
  const historyQuoteRes = resp.data

  if( !historyQuoteRes || !historyQuoteRes.candles || historyQuoteRes.candles.length < 1) {
    return {}
  }

  let {candles} = historyQuoteRes // Candles are ordered from latest to oldest weeks


  // Our sort function sorts oldest week first and newest week last
  candles = candles.sort((a, b) => (a.datetime > b.datetime) ? 1 : -1)

  // console.log('candles ', symbol, ' ', candles)

  const len = candles.length

  const oneWeekCandle = candles[len-1]
  const currentOpen = oneWeekCandle.open
  const currentClose = oneWeekCandle.close

  const oneWeekChange = (((currentClose - currentOpen)/currentOpen)*100).toFixed(2)
  let twoWeekChange = oneWeekChange
  let oneMonthChange = oneWeekChange
  let threeMonthChange = oneWeekChange

  // Computing first week
  if (len > 1) {
    const secondWeekOpen = candles[len-2].open
    twoWeekChange = (((currentClose - secondWeekOpen)/secondWeekOpen)*100).toFixed(2)
    oneMonthChange,threeMonthChange = twoWeekChange,twoWeekChange
  }

  if (len > 3) {
    const monthOpen = candles[len-4].open
    oneMonthChange = (((currentClose - monthOpen)/monthOpen)*100).toFixed(2)
    threeMonthChange = oneMonthChange
  } else {
    const monthOpen = candles[0].open
    oneMonthChange = (((currentClose - monthOpen)/monthOpen)*100).toFixed(2)
    threeMonthChange = oneMonthChange
  }

  if (len > 11) {
    const threeMonthOpen = candles[len-12].open
    threeMonthChange = (((currentClose - threeMonthOpen)/threeMonthOpen)*100).toFixed(2)
  } else  {
    const threeMonthOpen = candles[0].open
    threeMonthChange = (((currentClose - threeMonthOpen)/threeMonthOpen)*100).toFixed(2)
  }

  return {oneWeekChange,twoWeekChange,oneMonthChange,threeMonthChange,symbol}
}

async function getTdaQuote(symbol) {

  const getQuoteConfig = {
    symbol: symbol,
    apikey: ''
  };

  // const resp = await axios.get(`https://api.tdameritrade.com/v1/marketdata/${symbol}/quotes?apikey=JKL8G1DBVHAVQMKASBPZ87MNMYQLEA0H`)
  const quotesResult = await tdaclient.quotes.getQuote(getQuoteConfig)

  // const quoteResTmp = resp.data
  //
  const quoteRes = quotesResult[symbol]

  // const getQuoteResult = quotesResult[symbol]
  //
  // getQuoteResult.dayPctChange = getQuoteResult.regularMarketPercentChangeInDouble
  // getQuoteResult.afterHoursPctChange = (( getQuoteResult.mark - getQuoteResult.regularMarketLastPrice ) * 100)/getQuoteResult.regularMarketLastPrice
  // volume: getQuoteResult.totalVolume,

  const dayPctChange = (((quoteRes.regularMarketLastPrice - quoteRes.openPrice)/quoteRes.openPrice)*100).toFixed(2)
  const afterHoursPctChange = (((quoteRes.lastPrice - quoteRes.regularMarketLastPrice)/quoteRes.regularMarketLastPrice)*100).toFixed(2)

  quoteRes.dayPctChange = Math.abs(quoteRes.regularMarketPercentChangeInDouble) > 0 ? quoteRes.regularMarketPercentChangeInDouble.toFixed(2) : dayPctChange
  quoteRes.afterHoursPctChange = ( Math.abs(quoteRes.regularMarketPercentChangeInDouble) > 0 && Math.abs(quoteRes.netPercentChangeInDouble) > 0 ) ? ( quoteRes.netPercentChangeInDouble - quoteRes.regularMarketPercentChangeInDouble ).toFixed(2) : afterHoursPctChange

  return quoteRes
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function getStockMarketCap(stockSymbol) {
  let stockMarkCap = '0.0M';

  try {
    await rp(`https://www.finviz.com/quote.ashx?t=${stockSymbol}&ty=c&p=d&b=1`)
    .then(async html => {
      const $ = cheerio.load(html, null, false);

      var td_mcap_index = null;
      $('td').each(function (i, e) {
        if( $(this) && $(this).text() && $(this).text().trim().toUpperCase() === 'Market Cap'.toUpperCase() ) {
          td_mcap_index = i;
          return false;
        }
      });

      if( td_mcap_index ) {
        stockMarkCap = $($('td')[td_mcap_index+1]).text();
      }
    })
    .catch(err => console.log(err) )
  } catch (e) {
  }

  return stockMarkCap;
}

class StocksData {

  async getStocksDataLastUpdatedInfo() {
    const marketHoursService = new MarketHoursService()
    const isMarketOpen = await marketHoursService.isMarketOpen()

    let isDataUpdatedAfterLastClose = false
    const dbStocksData = await db.StocksData.findAll({ order: [['id', 'DESC']] })
    let stocksDatalastUpdatedTS;
    if( dbStocksData || dbStocksData.length > 0 ) {
      stocksDatalastUpdatedTS = await dbStocksData[0].updatedAt;
      if( marketHoursService.isTimeStampAfterLastMarketCloseTime(stocksDatalastUpdatedTS) ) {
        isDataUpdatedAfterLastClose = true
      }
    }

    let isUpdateInProgress = global.stocksDataUpdateInProgress
    const diffInMinutes = moment().diff(moment(global.stocksDataPreviousUpdateTime), 'minutes')
    if( diffInMinutes > 30 ) {
      isUpdateInProgress = false
    }

    return {
      isMarketOpen: isMarketOpen,
      isDataUpdatedAfterLastClose: isDataUpdatedAfterLastClose,
      stocksDatalastUpdatedTS: moment(stocksDatalastUpdatedTS).format('MMMM Do YYYY, h:mm a'),
      isUpdateInProgress: isUpdateInProgress
    }
  }

  async getSupportedStocksLastUpdate() {
    const returnObj = {success: true, msg: '', data: ''}
    try {
      const supportedStocks = await db.SupportedStocks.findOne()
      returnObj.data = supportedStocks.updatedAt
    } catch (e) {
      console.log(e)
      returnObj.success = false
      returnObj.msg = 'Error'
    }
    return returnObj
  }

  async updateSupportedStocks() {
    const returnObj = {success: true, msg: '', data: ''}

    try {
      const resp = await axios.get(getSupportedSymbolsUrl())
      const supportedStocksDataRes = await resp.data

      const supportedStocksData = []
      supportedStocksDataRes.forEach((stockDataJson) => {
        supportedStocksData.push({ symbol: stockDataJson.symbol, name: stockDataJson.name })
      })

      if( supportedStocksData && supportedStocksData.length > 0 ) {
        await db.SupportedStocks.destroy({ truncate : true, cascade: false })
        const currTime = moment()
        await db.SupportedStocks.create({ data: supportedStocksData, helperData: '' })
        returnObj.data = supportedStocksData
      }
    } catch (e) {
      console.log(e)
      returnObj.success = false
      returnObj.msg = 'Error'
    }

    return returnObj
  }

  async getSupportedStocks() {
    const supportedStocks = await db.SupportedStocks.findOne();
    return {data: supportedStocks.data, updatedAt: supportedStocks.updatedAt};
  }

  async getStockInfo(symbol) {
    const supportedStocks = await db.SupportedStocks.findOne();
    let name = '';
    supportedStocks.data.forEach((item) => {
      if( item.symbol === symbol.trim() ) {
        name = item.name;
      }
    });
    return {symbol: symbol, name: name}
  }

  async getStockData(symbol) {
    let stockData = {};
    try {
      // console.log('7d quote url: ' + getDateQuoteUrl(symbol, getDate(7, true)));

        // var response = await axios.get(getQuoteUrl(symbol));
        // var response7d = await axios.get(getDateQuoteUrl(symbol, '7d'));
        // var response14d = await axios.get(getDateQuoteUrl(symbol, '14d'));
        // var response1m = await axios.get(getDateQuoteUrl(symbol, '1m'));
        // var response3m = await axios.get(getDateQuoteUrl(symbol, '3m'));
        const getQuoteConfig = {
          symbol: symbol,
          apikey: ''
        };
        const stockDataJson = await getTdaQuote(symbol)
        const {oneWeekChange,twoWeekChange,oneMonthChange,threeMonthChange} = await getTdaHistoryData(symbol)

        let pct52WeekHighChg = 0.0;
        let pct52WeekLowChg = 0.0;
        try {
          pct52WeekHighChg = ((stockDataJson.lastPrice / stockDataJson['52WkHigh']) - 1)*100.00;
          pct52WeekLowChg = ((stockDataJson.lastPrice / stockDataJson['52WkLow']) - 1)*100.00;
        } catch (e) {
          console.log("error calc pct52WeekHighChg: symbol - " + symbol + ": "+ e);
        }
        // console.log(symbol,' ',stockDataJson)
        // console.log(symbol,oneWeekChange,twoWeekChange,oneMonthChange,threeMonthChange)
        const stockMarkCap = await getStockMarketCap(symbol);
        stockData = {
            symbol: symbol,
            companyName: stockDataJson.description,
            open: stockDataJson.openPrice,
            close: stockDataJson.closePrice,
            lastPrice: stockDataJson.lastPrice,
            low: stockDataJson.lowPrice,
            high: stockDataJson.highPrice,
            changePercent: stockDataJson.dayPctChange,
            extendedChangePercent: stockDataJson.afterHoursPctChange,
            volume: stockDataJson.totalVolume,
            marketCap: stockMarkCap,
            week52High: stockDataJson['52WkHigh'],
            week52Low: stockDataJson['52WkLow'],
            pct7d: oneWeekChange,
            pct14d: twoWeekChange,
            pct1m: oneMonthChange,
            pct3m: threeMonthChange,
            pct52WeekHighChg: pct52WeekHighChg,
            pct52WeekLowChg: pct52WeekLowChg
        }
    } catch (e) {
      console.log("error getStockData: symbol - " + symbol + ": " + e);
    }
    return stockData;
  }

  async getAllStocksData() {
    const returnObj = {success: true, msg: '', data: {}}
    try {
      const alldata = await db.StocksData.findAll({
        order: [['id', 'DESC']]
      })
      if( alldata && alldata.length > 0 ) {
        returnObj.data = await alldata[0].data
      } else {
        returnObj.msg = 'No data found'
        returnObj.success = false
      }
    }
    catch(e){
      console.log(e)
      returnObj.msg = 'Error'
      returnObj.success = false
    }

    return returnObj;
  }

  async addStockData(symbol) {
    await sleep(500)
    const stockDataJson = await this.getStockData(symbol)
    if(Object.keys(stockDataJson).length <= 0){
      return false;
    }

    const alldata = await db.StocksData.findAll({
      order: [['id', 'DESC']]
    });

    if( !alldata || alldata.length <= 0 ) {
      const dbStocksJson = {}
      dbStocksJson[symbol] = stockDataJson
      await db.StocksData.create({ data: { stocks: dbStocksJson, lastUpdated: moment() } });
      return;
    }

    const recentDbStocksDataRow = await alldata[0]
    const dbStocksData = await recentDbStocksDataRow.data

    dbStocksData.stocks[stockDataJson.symbol] = stockDataJson;

    recentDbStocksDataRow.changed('data', true);
    await recentDbStocksDataRow.save();
  }

  async updateAllStocksData() {
    var start = moment();

    // if( global.stocksDataPreviousUpdateTime ) {
    //   const diffInMinutes = moment().diff(moment(global.stocksDataPreviousUpdateTime), 'minutes')
    //   if( diffInMinutes < 30 ) {
    //     return {
    //       msg: 'stocks data updated recently.'
    //     }
    //   }
    // }

    global.stocksDataPreviousUpdateTime = moment()

    const stocksService = new StocksService();
    const allAddedStocksInfo = await stocksService.getAllAddedStocks();

    if( !allAddedStocksInfo || allAddedStocksInfo.length <= 0 ) {
      return {msg: "No stocks found"};
    }

    const allAddedStocks = []
    allAddedStocksInfo.forEach((stockInfo, i) => {
      allAddedStocks.push(stockInfo.symbol)
    });
    console.log('updateAllStocksData allAddedStocks: ' + allAddedStocks)

    Promise.all(allAddedStocks.map(async (symbol, i) => {
      await sleep(i * 2000)
      global.stocksDataUpdateInProgress = true
      return this.getStockData(symbol)
    })).then(async (allStocksJson) => {
      if( !allStocksJson || allStocksJson.length <= 0 ) {
        return;
      }

      let dbStocksJson = {}
      allStocksJson.forEach((stockDataJson) => {
        if(Object.keys(stockDataJson).length <= 0){
          return false;
        }
        dbStocksJson[stockDataJson.symbol] = stockDataJson;
      });

      await db.StocksData.create({ data: { stocks: dbStocksJson, lastUpdated: moment() } });
      const alldata = await db.StocksData.findAll({
        order: [['id', 'ASC']],
        attributes: ['id']
      })

      if( alldata.length > 3 ) {
        db.StocksData.destroy({
            where: {
              id: alldata[0].id
            }
        })
      }

      // this.retryUpdateMissedStocks()

      global.stocksDataUpdateInProgress = false
    })
    // const msg = 'It took ' + moment.duration(moment().diff(start)).asSeconds();
    return {msg: 'processing'}
  }

  async retryUpdateMissedStocks() {

    const stocksService = new StocksService();
    const allAddedStocksInfo = await stocksService.getAllAddedStocks();

    if( !allAddedStocksInfo || allAddedStocksInfo.length <= 0 ) {
      return {msg: "No stocks found"};
    }

    const allStocksDataJson = await this.getAllStocksData();
    const allStocksData = allStocksDataJson.data

    if( !allStocksData || !allStocksData.stocks ) {
      return
    }

    const prevUpdatedStocks = Object.keys(allStocksData.stocks)
    const stocksToRetry = []

    allAddedStocksInfo.forEach((stockInfo, i) => {
      if( !prevUpdatedStocks.includes(stockInfo.symbol) ) {
        stocksToRetry.push(stockInfo.symbol)
      }
    });

    if( stocksToRetry.length <= 0 ) {
      console.log("retryUpdateMissedStocks: No stocks to retry. all stocks updated");
      return;
    }

    console.log('retryUpdateMissedStocks: ' + stocksToRetry)

    Promise.all(stocksToRetry.map(async (symbol, i) => {
      await sleep(i * 2000)
      const stockDataJson = await this.getStockData(symbol)
      return stockDataJson;
    })).then(async (allStocksJson) => {
      if( !allStocksJson || allStocksJson.length <= 0 ) {
        return;
      }

      const alldata = await db.StocksData.findAll({
        order: [['id', 'DESC']]
      });

      const recentDbStocksDataRow = await alldata[0]
      const dbStocksData = await recentDbStocksDataRow.data

      let dbStocksJson = {}
      allStocksJson.forEach((stockDataJson) => {
        if(Object.keys(stockDataJson).length <= 0){
          return false;
        }
        dbStocksData.stocks[stockDataJson.symbol] = stockDataJson;
        dbStocksData.lastUpdated = moment()
      });

      recentDbStocksDataRow.changed('data', true);
      await recentDbStocksDataRow.save();
    });

  }
}

module.exports = StocksData;

const StocksService = require('./StocksService')
