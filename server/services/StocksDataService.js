const db = require('../sequelize/models')
const tdaclient = require('tda-api-client');
const axios = require("axios");
const moment = require('moment');

function getQuoteUrl(symbol) {
  return "https://sandbox.iexapis.com/stable/stock/"+symbol+"/quote?token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
}

function getDateQuoteUrl(symbol, date) {
  // return "https://sandbox.iexapis.com/stable//stock/AAPL/chart/date/20201201?chartByDay=true&token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
  return "https://sandbox.iexapis.com/stable//stock/"+symbol.replace(/\s/g, '')+"/chart/"+date+"/20201201?chartByDay=true&token=Tpk_04291f94e91b4cdd8f4245dc7a730369";
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
      const stockDataJson = await this.getStockData(symbol)
      return stockDataJson;
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
      });

      recentDbStocksDataRow.changed('data', true);
      await recentDbStocksDataRow.save();
    });

  }

  async testTda(){
    console.log('testTda')
    const configGetMktHours = {
      market: tdaclient.markethours.MARKETS.OPTION,
      date: '2020-09-10',
      apikey: ''
    };
    // const getSingleMarketHoursResult = await tdaclient.markethours.getSingleMarketHours(configGetMktHours);
    // console.log(getSingleMarketHoursResult);

    const moversConfig = {
      index: tdaclient.movers.INDEX.SPX,
      direction: tdaclient.movers.DIRECTION.UP,
      change: tdaclient.movers.CHANGE.PERCENT,
      apikey: ''
    };
    // const getMoversResult = await tdaclient.movers.getMovers(moversConfig);
    // console.log('test tda movers result');
    // console.log(getMoversResult);

    // const getQuoteConfig = {
    //   symbol: 'ABCDE',
    //   apikey: ''
    // };
    // const getQuoteResult = await tdaclient.quotes.getQuote(getQuoteConfig);
    // console.log('test tda result');
    // console.log(getQuoteResult);
    //
    const getQuotesConfig = {
      symbol: "A,AA,AAA,AAAU,AACG,AACQ,AACQW,AADR,AAIC,AAIC-B,AAIC-C,AAL,AAMC,AAME,AAN,AAOI,AAON,AAP,AAPL,AAT,AAU,AAWW,AAXJ,AAXN,AB,ABB,ABBV,ABC,ABCB,ABCL,ABCM,ABEO,ABEQ,ABEV,ABG,ABIO,ABM,ABMD,ABNB,ABR,ABR-A,ABR-B,ABR-C,ABST,ABT,ABTX,ABUS,AC,ACA,ACAC,ACACW,ACAD,ACAM,ACAMW,ACB,ACBI,ACC,ACCD,ACCO,ACEL,ACER,ACES,ACET,ACEV,ACEVW,ACGL,ACGLO,ACGLP,ACH,ACHC,ACHV,ACI,ACIA,ACIC,ACIC+,ACIC=,ACIO,ACIU,ACIW,ACLS,ACM,ACMR,ACN,ACNB,ACND,ACND+,ACND=,ACOR,ACP,ACRE,ACRS,ACRX,ACSG,ACSI,ACST,ACTC,ACTCW,ACTG,ACTV,ACU,ACV,ACVF,ACWF,ACWI,ACWV,ACWX,ACY,ADAP,ADBE,ADC,ADCT,ADES,ADFI,ADI,ADIL,ADILW,ADM,ADMA,ADME,ADMP,ADMS,BA,TSLA,EBON",
      apikey: ''
    };
    const getQuotesResult = await tdaclient.quotes.getQuotes(getQuotesConfig);
    console.log('test tda result');
    console.log(getQuotesResult);
  }
}

module.exports = StocksData;

const StocksService = require('./StocksService')
