const db = require('../sequelize/models')
const tdaclient = require('tda-api-client');
const axios = require("axios");
const moment = require('moment');
const MarketHoursService = require('../services/MarketHoursService');
const rp = require("request-promise");
const cheerio = require("cheerio");
const SchwabMarketDataService = require('../services/SchwabMarketDataService');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

class TrendingStocks {

  async getAllTrendingStocksData() {
    const returnObj = {success: true, msg: '', data: {}};

    try {

      const alldata = await db.TrendingStocks.findAll({
        order: [['id', 'DESC']]
      });

      if( alldata && alldata.length > 0 ) {
        returnObj.data = await alldata[0].data;
      } else {
        returnObj.msg = 'No data found';
        returnObj.success = false;
      }

    } catch(e) {
      console.log('Error: TrendingStocksService.getAllTrendingStocksData: ' + e);
      returnObj.msg = 'Error';
      returnObj.success = false;
    }

    return returnObj;
  }

  async updateAndGetAllTrendingStocksData() {
    await this.updateAllTrendingStocksData();
    const result = await this.getAllTrendingStocksData();
    return result;
  }

  async updateAllTrendingStocksData() {

    if( global.trendingStocksDataPreviousUpdateTime ) {
      const diffInSeconds = moment().diff(moment(global.trendingStocksDataPreviousUpdateTime), 'seconds')
      if( diffInSeconds < 10 ) {
        return {
          msg: 'trending stocks data last updated ' + diffInSeconds + ' seconds ago. update frequency at least 10 seconds.'
        }
      }
    }

    const marketHoursService = new MarketHoursService();
    const isMarketOpen = await marketHoursService.isMarketOpen();
    if( !isMarketOpen ) {
      const dbTrendingStocksRes = await db.TrendingStocks.findAll({ order: [['id', 'DESC']]})
      if( dbTrendingStocksRes && dbTrendingStocksRes.length > 0 ) {
        const dbTrendingStocksDataLastUpdateTS = await dbTrendingStocksRes[0].updatedAt;
        if( marketHoursService.isTimeStampAfterLastMarketCloseTime(dbTrendingStocksDataLastUpdateTS) ) {
          return { msg: 'Tredning stocks data is latest. Nothing to update.'}
        }
      }
    }

    global.trendingStocksDataPreviousUpdateTime = moment()

    const dbTrendingStocksRes = await db.TrendingStocks.findAll({ order: [['id', 'DESC']]})
    let updateData = true;

    if( !dbTrendingStocksRes && dbTrendingStocksRes.length > 0 ) {
      const dbTrendingStocksDataLastUpdateTS = await dbTrendingStocksRes[0].updatedAt;
      const isToday = moment(dbTrendingStocksDataLastUpdateTS).isSame(new Date(), "day");

      const diffInMins = moment().diff(moment(global.trendingStocksDataPreviousUpdateTime), 'minutes')
      if(diffInMins < 15) {
        updateData = false;
      }
    }

    if(!updateData) {
      return;
    }

    const symbolsMap = await this.fetchTrendingStocks();
    console.log('symbolsMap: ' + symbolsMap['allTrendSymobls']);
    const stocksDataJson = await this.getMultiplStocksData(symbolsMap["allTrendSymobls"]);
    let trendingStocksDBData = symbolsMap;
    trendingStocksDBData.quotes = stocksDataJson;
    await db.TrendingStocks.create({ data: { trendingStocks: trendingStocksDBData, lastUpdated: moment() } });

    const alldata = await db.TrendingStocks.findAll({
      order: [['id', 'ASC']],
      attributes: ['id']
    })

    if( alldata.length > 5 ) {
      db.StocksLive.destroy({
          where: {
            id: alldata[0].id
          }
      })
    }
  }

  getQuoteJson(getQuoteResult) {
    var dataJson = {
      symbol: getQuoteResult.symbol,
      companyName: (getQuoteResult.reference ? getQuoteResult.reference.description : getQuoteResult.symbol),
      open: getQuoteResult.quote.openPrice,
      close: getQuoteResult.quote.closePrice,
      low: getQuoteResult.quote.lowPrice,
      high: getQuoteResult.quote.highPrice,
      lastPrice: getQuoteResult.quote.lastPrice,
      changePercent: getQuoteResult.regular.regularMarketPercentChange,
      extendedChangePercent: (( getQuoteResult.quote.mark - getQuoteResult.regular.regularMarketLastPrice ) * 100)/getQuoteResult.regular.regularMarketLastPrice,
      volume: getQuoteResult.quote.totalVolume,
      week52High: getQuoteResult.quote['52WeekHigh'],
      week52Low: getQuoteResult.quote['52WeekLow'],
    }
    //      extendedChangePercent: getQuoteResult.netPercentChangeInDouble - getQuoteResult.regularMarketPercentChangeInDouble,
    //
    // if( dataJson['symbol'] == 'TSLA' ) {
    //   dataJson['lastPrice'] = Math.floor(Math.random() * 1000)
    // }
    return dataJson
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
      const schwabMarketDataService = new SchwabMarketDataService();
      const quotesResult = await schwabMarketDataService.getQuotes(getQuotesConfig.symbol);

      //format: {"AAPL":{},"MSFT":{},...}
      Object.keys(quotesResult).map((symbol) => {
        try {
          stockDataJson[symbol] = this.getQuoteJson(quotesResult[symbol]);
        } catch(ex) {
          console.error(`TrendingStocks - Error processing getQuoteJson for symbol: ${symbol}, Error: ${ex}`);
        }
      });

    } catch (e) {
      console.log(e)
    }
    return stockDataJson;
  }

  async fetchTrendingStocks() {
    let symbolsMap = {};
    let allSymbols = [];
    symbolsMap['stocktwits'] = [];
    symbolsMap['topGainers'] = [];
    symbolsMap['topDecliners'] = [];
    symbolsMap['allTrendSymobls'] = [];

    try {
      const stocktwitsResp = await axios.get('https://api.stocktwits.com/api/2/trending/symbols/equities.json');
      const stocktwitsData = stocktwitsResp.data;
      symbolsMap['stocktwits'] = stocktwitsData.symbols.map(stock => {return stock.symbol});
    } catch(e) {
      console.log('Error: fetchTrendingStocks stocktwits: ' + e);
      symbolsMap['stocktwits'] = [];
    }

    try {
      const cnbcSpyResp = await axios.get('https://gdsapi.cnbc.com/market-mover/groupMover/SP500/CHANGE_PCT/BOTH/12.json?source=SAVED&delayed=false&partnerId=2');
      const cnbcSpyData = cnbcSpyResp.data;
      symbolsMap['topGainers'] = cnbcSpyData.rankedSymbolList[0].rankedSymbols.map(stock=> {return stock.cnbcSymbol});
      symbolsMap['topDecliners'] = cnbcSpyData.rankedSymbolList[1].rankedSymbols.map(stock=> {return stock.cnbcSymbol});

      const cnbcNasdaqResp = await axios.get('https://gdsapi.cnbc.com/market-mover/groupMover/NASDAQ100/CHANGE_PCT/BOTH/12.json?source=SAVED&delayed=false&partnerId=2');
      const cnbcNasdaqData = cnbcNasdaqResp.data;
      const nasdaqGainers = cnbcNasdaqData.rankedSymbolList[0].rankedSymbols.map(stock=> {return stock.cnbcSymbol});
      const nasdaqDecliners = cnbcNasdaqData.rankedSymbolList[1].rankedSymbols.map(stock=> {return stock.cnbcSymbol});

      symbolsMap['topGainers'] = symbolsMap['topGainers'].concat(nasdaqGainers);
      symbolsMap['topDecliners'] = symbolsMap['topDecliners'].concat(nasdaqDecliners);

    } catch (e) {

    }
    // try {
    //   let stocktwitsTrendSymbols = [];
    //   await rp(`https://stocktwits.com/symbol/AAPL`)
    //   .then(async html => {
    //     const $ = cheerio.load(html, null, false);
    //     await sleep(10000);
    //     const div_trending = $('span:contains("Trending now")').parent();
    //     // const div_trending = $($("span:contains('Trending now'):first")[0]).parents('div')[0];
    //     console.log('div_trending: ' + div_trending.html());
    //     const trendingLinks = $(div_trending.children()[2]).find('a');
    //     console.log('trendingLinks length: ' + $(div_trending.children()[2]).html());
    //     for(let i=0; i<trendingLinks.length; i++) {
    //       var trendingSymbol = trendingLinks[i].href.split('/').pop();
    //       if(!trendingSymbol.includes('.')) {
    //         stocktwitsTrendSymbols.push(trendingSymbol.trim());
    //       }
    //     }
    //     console.log("stocktwitsTrendSymbols: " + stocktwitsTrendSymbols);
    //     symbolsMap['stocktwits'] = stocktwitsTrendSymbols;
    //   })
    //   .catch(err => console.log(err) )
    // } catch (e) {
    //   console.log("error stocktwits trending fetch: " + e);
    // }


    //merge symbols from today's data
    try{
      const dbTrendingStocksRes = await db.TrendingStocks.findAll({ order: [['id', 'DESC']]})
      if( dbTrendingStocksRes && dbTrendingStocksRes.length > 0 ) {
        const dbTrendingStocksDataLastUpdateTS = await dbTrendingStocksRes[0].updatedAt;
        const isToday = moment(dbTrendingStocksDataLastUpdateTS).isSame(new Date(), "day");
        if(isToday) {
          const todayTrendData = await dbTrendingStocksRes[0].data;
          const prevStocktwitsSymobls = todayTrendData.trendingStocks['stocktwits'];
          symbolsMap['stocktwits'] = symbolsMap['stocktwits'].concat(prevStocktwitsSymobls);

          const prevTopGainersSymobls = todayTrendData.trendingStocks['topGainers'];
          symbolsMap['topGainers'] = symbolsMap['topGainers'].concat(prevTopGainersSymobls);

          const prevTopDeclinersSymobls = todayTrendData.trendingStocks['topDecliners'];
          symbolsMap['topDecliners'] = symbolsMap['topDecliners'].concat(prevTopDeclinersSymobls);
        }
      }
    } catch(e) {
      console.log('Error: fetchTrendingStocks: ' + e);
    }

    symbolsMap['stocktwits'] = Array.from(new Set(symbolsMap['stocktwits']));
    symbolsMap['topGainers'] = Array.from(new Set(symbolsMap['topGainers']));
    symbolsMap['topDecliners'] = Array.from(new Set(symbolsMap['topDecliners']));


    symbolsMap['allTrendSymobls'] = symbolsMap['allTrendSymobls'].concat(symbolsMap['stocktwits']).concat(symbolsMap['topGainers']).concat(symbolsMap['topDecliners']);
    symbolsMap['allTrendSymobls'] = Array.from(new Set(symbolsMap['allTrendSymobls']));

    return symbolsMap;
  }

}

module.exports = TrendingStocks;

const TrendingStocksService = require('./TrendingStocksService')
