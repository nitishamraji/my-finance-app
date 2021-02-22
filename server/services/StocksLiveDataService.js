const db = require('../sequelize/models')
const tdaclient = require('tda-api-client');
const axios = require("axios");
const moment = require('moment');
const lodash = require('lodash');
const StocksService = require('./StocksService')

function getDate(num, isDays) {
    var dateForQuote = moment();
    dateForQuote = isDays ? dateForQuote.subtract(num, 'days') : dateForQuote.subtract(num, 'months');
    dateForQuote = dateForQuote.format("YYYYMMDD");
    return dateForQuote;
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

class StocksLiveData {

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

  getQuoteJson(getQuoteResult) {
    var dataJson = {
      symbol: getQuoteResult.symbol,
      companyName: getQuoteResult.description,
      open: getQuoteResult.openPrice,
      close: getQuoteResult.closePrice,
      low: getQuoteResult.lowPrice,
      high: getQuoteResult.highPrice,
      lastPrice: getQuoteResult.lastPrice,
      changePercent: getQuoteResult.regularMarketPercentChangeInDouble,
      extendedChangePercent: getQuoteResult.netPercentChangeInDouble - getQuoteResult.regularMarketPercentChangeInDouble,
      volume: getQuoteResult.totalVolume,
      week52High: getQuoteResult['52WkHigh'],
      week52Low: getQuoteResult['52WkLow'],
    }
    return dataJson
  }

  async getAllStocksData() {
    const returnObj = {success: true, msg: '', data: {}}
    try {
      const alldata = await db.StocksLive.findAll({
        order: [['id', 'DESC']]
      })
      if( alldata && alldata.length > 0 ) {
        const dbStocksData = await alldata[0].data;
        const dbStocks = await dbStocksData.stocks;


        // console.log( 'live dbStocksData: ' + JSON.stringify(dbStocks))
        let returnStocksObj = {}
        Object.keys(dbStocks).map((symbol) => {
          returnStocksObj[symbol] = this.getQuoteJson(dbStocks[symbol])
        });

        // console.log( 'live getAllStocksData: ' + JSON.stringify(returnStocksObj))
        dbStocksData['stocks'] = returnStocksObj
        returnObj.data = dbStocksData
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

  async getStockData(symbol) {
    let stockDataJson = {};
    try {
      const getQuoteConfig = {
        symbol: symbol,
        apikey: ''
      };
      const quoteResult = await tdaclient.quotes.getQuote(getQuoteConfig);
      console.log('test tda result: ' + JSON.stringify(quoteResult));
      stockDataJson = quoteResult[symbol];
    } catch (e) {
      console.log(e)
    }
    return stockDataJson;
  }

  async getMultiplStocksData(stocks) {
    let stockDataJson = {};

    if( !stocks || stocks.length <= 0 ) {
      return stockDataJson
    }

    try {
      const getQuotesConfig = {
        symbol: stocks.join(","),
        apikey: ''
      };
      const quotesResult = await tdaclient.quotes.getQuotes(getQuotesConfig);

      //format: {"AAPL":{},"MSFT":{},...}
      stockDataJson = quotesResult;

    } catch (e) {
      console.log(e)
    }
    return stockDataJson;
  }

  async addStockData(symbol) {
    await sleep(500)
    const stockDataJson = await this.getStockData(symbol)

    console.log('addStockData stockDataJson: ' + JSON.stringify(stockDataJson))
    if(Object.keys(stockDataJson).length <= 0){
      return false;
    }

    const alldata = await db.StocksLive.findAll({
      order: [['id', 'DESC']]
    });

    if( !alldata || alldata.length <= 0 ) {
      const dbStocksJson = {}
      dbStocksJson[symbol] = stockDataJson
      await db.StocksLive.create({ data: { stocks: dbStocksJson, lastUpdated: moment() } });
      return;
    }

    const recentDbStocksDataRow = await alldata[0]
    const dbStocksData = await recentDbStocksDataRow.data

    dbStocksData.stocks[stockDataJson.symbol] = stockDataJson;

    recentDbStocksDataRow.changed('data', true);
    await recentDbStocksDataRow.save();
  }

  async updateAllStocksData() {
    const stocksService = new StocksService();
    const allAddedStocksInfo = await stocksService.getAllAddedStocks();

    if( !allAddedStocksInfo || allAddedStocksInfo.length <= 0 ) {
      return {msg: "No stocks found"};
    }

    const allStocksInBatch = [];
    var i,j,temparray,chunk = 100;
    for (i=0,j=allAddedStocksInfo.length; i<j; i+=chunk) {
        allStocksInBatch.push( allAddedStocksInfo.slice(i,i+chunk).map(stockInfo => stockInfo.symbol) );
    }

    console.log('updateAllStocksData allStocksInBatch: ' + JSON.stringify(allStocksInBatch) )

    Promise.all(allStocksInBatch.map(async (singleBatchStocks, i) => {
      await sleep(i * 2000)
      return await this.getMultiplStocksData(singleBatchStocks)
    })).then(async (allBatchedStocksData) => {
      if( !allBatchedStocksData || allBatchedStocksData.length <= 0 ) {
        allBatchedStocksData = [];
      }

      let allStocksQuoteData = {}
      allBatchedStocksData.forEach((singleBatchStocksDataJson, i) => {
        if( Object.keys(allStocksQuoteData).length <= 0 ) {
          allStocksQuoteData = singleBatchStocksDataJson
        } else {
          allStocksQuoteData = lodash.merge(allStocksQuoteData, singleBatchStocksDataJson)
        }
      });

      console.log('allStocksQuoteData: ' + JSON.stringify(allStocksQuoteData))

      const allFetchedStocks = Object.keys(allStocksQuoteData)
      if( !allFetchedStocks || allFetchedStocks.length <= 0 ) {
        console.log('live updateAllStocksData - empty quotes result from api ')
        return
      }

      const uniqueStocksQuoteData = {}
      allFetchedStocks.forEach((item, i) => {
        if( !Object.keys(uniqueStocksQuoteData).includes(item) ) {
          uniqueStocksQuoteData[item] = allStocksQuoteData[item]
        }
      });

      console.log('query create live data to db: ')
      await db.StocksLive.create({ data: { stocks: uniqueStocksQuoteData, lastUpdated: moment() } });
      const alldata = await db.StocksLive.findAll({
        order: [['id', 'ASC']],
        attributes: ['id']
      })

      if( alldata.length > 3 ) {
        db.StocksLive.destroy({
            where: {
              id: alldata[0].id
            }
        })
      }

      this.retryUpdateMissedStocks(uniqueStocksQuoteData)

    })
    return {msg: 'processing'}
  }

  async retryUpdateMissedStocks(recentAddedStocksQuoteData) {

    const stocksService = new StocksService();
    const allAddedStocksInfo = await stocksService.getAllAddedStocks();

    if( !allAddedStocksInfo || allAddedStocksInfo.length <= 0 ) {
      console.log("No live stocks found");
    }

    if( !recentAddedStocksQuoteData || Object.keys(recentAddedStocksQuoteData).length <= 0 ) {
      console.log("No live stocks recently added");
    }

    const prevUpdatedStocks = Object.keys(recentAddedStocksQuoteData)
    const stocksToRetry = []

    allAddedStocksInfo.forEach((stockInfo, i) => {
      if( !prevUpdatedStocks.includes(stockInfo.symbol) ) {
        stocksToRetry.push(stockInfo.symbol)
      }
    });

    if( stocksToRetry.length <= 0 ) {
      console.log("retryUpdateMissedStocks: No live stocks to retry. all live stocks updated");
      return;
    }

    console.log('retryUpdateMissedStocks live stocks: ' + stocksToRetry)

    const allStocksInBatch = [];
    var i,j,temparray,chunk = 3;
    for (i=0,j=stocksToRetry.length; i<j; i+=chunk) {
      allStocksInBatch.push( stocksToRetry.slice(i,i+chunk) );
    }

    console.log('updateAllStocksData live allStocksInBatch: ' + JSON.stringify(allStocksInBatch) )

    Promise.all(allStocksInBatch.map(async (singleBatchStocks, i) => {
      await sleep(i * 2000)
      const stocksData = await this.getMultiplStocksData(singleBatchStocks)
      return stocksData;
    })).then(async (allBatchedStocksData) => {

      if( !allBatchedStocksData || allBatchedStocksData.length <= 0 ) {
        return;
      }

      let allStocksQuoteData = {}
      allBatchedStocksData.forEach((singleBatchStocksDataJson, i) => {
        if( Object.keys(allStocksQuoteData).length <= 0 ) {
          allStocksQuoteData = singleBatchStocksDataJson
        } else {
          allStocksQuoteData = lodash.merge(allStocksQuoteData, singleBatchStocksDataJson)
        }
      });

      const alldata = await db.StocksLive.findAll({
        order: [['id', 'DESC']]
      });

      const recentDbStocksDataRow = await alldata[0]
      const dbStocksData = await recentDbStocksDataRow.data

      allStocksQuoteData.map((symbol) => {
        dbStocksData.stocks[symbol] = allStocksQuoteData[symbol];
        dbStocksData.lastUpdated = moment()
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

module.exports = StocksLiveData;
