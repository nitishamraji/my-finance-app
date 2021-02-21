const db = require('../sequelize/models')
const tdaclient = require('tda-api-client');
const axios = require("axios");
const moment = require('moment');

function getQuoteUrl(symbol) {
  // return "https://sandbox.iexapis.com/stable/stock/"+symbol+"/quote?token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
  return "https://sandbox.iexapis.com/stable/stock/"+symbol+"/quote?token=pk_cc4cd8e1d02945f8a242f6b54c174370";
}

function getDateQuoteUrl(symbol, date) {
  // return "https://sandbox.iexapis.com/stable//stock/AAPL/chart/date/20201201?chartByDay=true&token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
  return "https://sandbox.iexapis.com/stable//stock/"+symbol.replace(/\s/g, '')+"/chart/"+date+"/20201201?chartByDay=true&token=pk_cc4cd8e1d02945f8a242f6b54c174370";
  // return "https://sandbox.iexapis.com/stable//stock/"+symbol+"/chart/date/"+date+"?chartByDay=true&token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
  // return "https://sandbox.iexapis.com/stable/stock/"+symbol+"/chart/date/"+date+"?chartByDay=true&token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
}

function getSupportedSymbolsUrl() {
  // return "https://sandbox.iexapis.com/stable/ref-data/symbols?token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
  return "https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_cc4cd8e1d02945f8a242f6b54c174370";
}

function getDate(num, isDays) {
    var dateForQuote = moment();
    dateForQuote = isDays ? dateForQuote.subtract(num, 'days') : dateForQuote.subtract(num, 'months');
    dateForQuote = dateForQuote.format("YYYYMMDD");
    return dateForQuote;
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

class StocksData {

  async getSupportedStocks() {
    const supportedStocks = await db.SupportedStocks.findOne();
    return supportedStocks.data;
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
    let stockDataJson = {};
    try {
        var response = await axios.get(getQuoteUrl(symbol));
        var response7d = await axios.get(getDateQuoteUrl(symbol, getDate(7, true)));
        var response14d = await axios.get(getDateQuoteUrl(symbol, getDate(14, true)));
        var response1m = await axios.get(getDateQuoteUrl(symbol, getDate(1, false)));
        var response3m = await axios.get(getDateQuoteUrl(symbol, getDate(3, false)));

        var data = response.data;
        var dataJson = {
            symbol: data.symbol,
            companyName: data.companyName,
            open: data.open,
            close: data.close,
            low: data.low,
            high: data.high,
            changePercent: data.changePercent,
            extendedPrice: data.extendedPrice,
            extendedChangePercent: data.extendedChangePercent,
            volume: data.volume,
            marketCap: data.marketCap,
            week52High: data.week52High,
            week52Low: data.week52Low,
            pct7d: response7d.data[0].changePercent,
            pct14d: response14d.data[0].changePercent,
            pct1m: response1m.data[0].changePercent,
            pct3m: response3m.data[0].changePercent
        }

        stockDataJson = dataJson;
    } catch (e) {
      console.log(e)
    }
    return stockDataJson;
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
    // var start = moment();

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

      this.retryUpdateMissedStocks()

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
