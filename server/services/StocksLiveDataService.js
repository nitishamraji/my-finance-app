const db = require('../sequelize/models')
const tdaclient = require('tda-api-client');
const axios = require("axios");
const moment = require('moment');
const lodash = require('lodash');

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
      // const quotesResult = await tdaclient.quotes.getQuotes(getQuotesConfig);

      const quotesResult = JSON.parse(`{"NIO":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"62914V106","assetSubType":"ADR","symbol":"NIO","description":"NIO Inc. American depositary shares, each  representing one Class A ordinary sha","bidPrice":55.49,"bidSize":400,"bidId":"P","askPrice":55.55,"askSize":1000,"askId":"P","lastPrice":55.5,"lastSize":200,"lastId":"K","openPrice":55.72,"highPrice":56.04,"lowPrice":54.1,"bidTick":" ","closePrice":54.43,"netChange":1.07,"totalVolume":43020690,"quoteTimeInLong":1613782800540,"tradeTimeInLong":1613782799856,"mark":55.04,"exchange":"n","exchangeName":"NYSE","marginable":true,"shortable":true,"volatility":0.0302,"digits":2,"52WkHigh":66.99,"52WkLow":2.11,"nAV":0,"peRatio":0,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":55.04,"regularMarketLastSize":3864,"regularMarketNetChange":0.61,"regularMarketTradeTimeInLong":1613779200003,"netPercentChangeInDouble":1.9658,"markChangeInDouble":0.61,"markPercentChangeInDouble":1.1207,"regularMarketPercentChangeInDouble":1.1207,"delayed":false},"BABA":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"01609W102","assetSubType":"ADR","symbol":"BABA","description":"Alibaba Group Holding Limited American Depositary Shares each representing eight","bidPrice":263.4,"bidSize":100,"bidId":"P","askPrice":263.5,"askSize":700,"askId":"P","lastPrice":263.5,"lastSize":0,"lastId":"D","openPrice":266.05,"highPrice":269.39,"lowPrice":262.85,"bidTick":" ","closePrice":264.51,"netChange":-1.01,"totalVolume":14718443,"quoteTimeInLong":1613782768021,"tradeTimeInLong":1613782794423,"mark":263.59,"exchange":"n","exchangeName":"NYSE","marginable":true,"shortable":true,"volatility":0.0141,"digits":2,"52WkHigh":319.32,"52WkLow":169.95,"nAV":0,"peRatio":29.91,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":263.59,"regularMarketLastSize":4104,"regularMarketNetChange":-0.92,"regularMarketTradeTimeInLong":1613779200004,"netPercentChangeInDouble":-0.3818,"markChangeInDouble":-0.92,"markPercentChangeInDouble":-0.3478,"regularMarketPercentChangeInDouble":-0.3478,"delayed":false},"TSLA":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"88160R101","symbol":"TSLA","description":"Tesla, Inc.  - Common Stock","bidPrice":782.25,"bidSize":100,"bidId":"P","askPrice":782.5,"askSize":300,"askId":"K","lastPrice":782.4,"lastSize":0,"lastId":"P","openPrice":795,"highPrice":796.7899,"lowPrice":777.37,"bidTick":" ","closePrice":787.38,"netChange":-4.98,"totalVolume":18958255,"quoteTimeInLong":1613782793313,"tradeTimeInLong":1613782799256,"mark":782.25,"exchange":"q","exchangeName":"NASD","marginable":true,"shortable":true,"volatility":0.0238,"digits":4,"52WkHigh":900.4,"52WkLow":70.102,"nAV":0,"peRatio":1078.58,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":781.3,"regularMarketLastSize":4391,"regularMarketNetChange":-6.08,"regularMarketTradeTimeInLong":1613768400604,"netPercentChangeInDouble":-0.6325,"markChangeInDouble":-5.13,"markPercentChangeInDouble":-0.6515,"regularMarketPercentChangeInDouble":-0.7722,"delayed":false},"AAPL":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"037833100","symbol":"AAPL","description":"Apple Inc. - Common Stock","bidPrice":129.72,"bidSize":1100,"bidId":"P","askPrice":129.74,"askSize":1000,"askId":"P","lastPrice":129.72,"lastSize":0,"lastId":"P","openPrice":130.24,"highPrice":130.71,"lowPrice":128.8,"bidTick":" ","closePrice":129.71,"netChange":0.01,"totalVolume":87668834,"quoteTimeInLong":1613782799834,"tradeTimeInLong":1613782798447,"mark":129.87,"exchange":"q","exchangeName":"NASD","marginable":true,"shortable":true,"volatility":0.0176,"digits":4,"52WkHigh":145.09,"52WkLow":53.1525,"nAV":0,"peRatio":35.3708,"divAmount":0.82,"divYield":0.63,"divDate":"2021-02-05 00:00:00.000","securityStatus":"Normal","regularMarketLastPrice":129.87,"regularMarketLastSize":43133,"regularMarketNetChange":0.16,"regularMarketTradeTimeInLong":1613768400383,"netPercentChangeInDouble":0.0077,"markChangeInDouble":0.16,"markPercentChangeInDouble":0.1233,"regularMarketPercentChangeInDouble":0.1234,"delayed":false},"MSFT":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"594918104","symbol":"MSFT","description":"Microsoft Corporation - Common Stock","bidPrice":240.63,"bidSize":1000,"bidId":"Q","askPrice":240.68,"askSize":400,"askId":"P","lastPrice":240.68,"lastSize":100,"lastId":"P","openPrice":243.75,"highPrice":243.86,"lowPrice":240.18,"bidTick":" ","closePrice":243.79,"netChange":-3.11,"totalVolume":25262600,"quoteTimeInLong":1613782797209,"tradeTimeInLong":1613782791479,"mark":240.97,"exchange":"q","exchangeName":"NASD","marginable":true,"shortable":true,"volatility":0.0104,"digits":4,"52WkHigh":246.13,"52WkLow":132.52,"nAV":0,"peRatio":36.3709,"divAmount":2.24,"divYield":0.92,"divDate":"2021-02-17 00:00:00.000","securityStatus":"Normal","regularMarketLastPrice":240.97,"regularMarketLastSize":31269,"regularMarketNetChange":-2.82,"regularMarketTradeTimeInLong":1613768400712,"netPercentChangeInDouble":-1.2757,"markChangeInDouble":-2.82,"markPercentChangeInDouble":-1.1567,"regularMarketPercentChangeInDouble":-1.1567,"delayed":false},"SQ":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"852234103","symbol":"SQ","description":"Square, Inc. Class A Common Stock","bidPrice":278.79,"bidSize":100,"bidId":"P","askPrice":279.5,"askSize":200,"askId":"P","lastPrice":278.79,"lastSize":0,"lastId":"D","openPrice":275.12,"highPrice":280.9391,"lowPrice":273.59,"bidTick":" ","closePrice":270.85,"netChange":7.94,"totalVolume":7373362,"quoteTimeInLong":1613782786441,"tradeTimeInLong":1613782798330,"mark":276.57,"exchange":"n","exchangeName":"NYSE","marginable":true,"shortable":true,"volatility":0.0498,"digits":2,"52WkHigh":283.1898,"52WkLow":32.33,"nAV":0,"peRatio":366.13,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":276.57,"regularMarketLastSize":2477,"regularMarketNetChange":5.72,"regularMarketTradeTimeInLong":1613779200000,"netPercentChangeInDouble":2.9315,"markChangeInDouble":5.72,"markPercentChangeInDouble":2.1119,"regularMarketPercentChangeInDouble":2.1119,"delayed":false},"PYPL":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"70450Y103","symbol":"PYPL","description":"PayPal Holdings, Inc. - Common Stock","bidPrice":287.9,"bidSize":500,"bidId":"P","askPrice":288.28,"askSize":300,"askId":"P","lastPrice":288.28,"lastSize":0,"lastId":"P","openPrice":292.12,"highPrice":293.94,"lowPrice":285.46,"bidTick":" ","closePrice":290.81,"netChange":-2.53,"totalVolume":9413810,"quoteTimeInLong":1613782796853,"tradeTimeInLong":1613782793913,"mark":287.9,"exchange":"q","exchangeName":"NASD","marginable":true,"shortable":true,"volatility":0.0245,"digits":4,"52WkHigh":309.14,"52WkLow":82.07,"nAV":0,"peRatio":110.9,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":286.92,"regularMarketLastSize":5238,"regularMarketNetChange":-3.89,"regularMarketTradeTimeInLong":1613768400921,"netPercentChangeInDouble":-0.87,"markChangeInDouble":-2.91,"markPercentChangeInDouble":-1.0007,"regularMarketPercentChangeInDouble":-1.3376,"delayed":false},"AAL":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"02376R102","symbol":"AAL","description":"American Airlines Group, Inc. - Common Stock","bidPrice":18.86,"bidSize":141300,"bidId":"P","askPrice":18.88,"askSize":7000,"askId":"P","lastPrice":18.86,"lastSize":1600,"lastId":"D","openPrice":17.9,"highPrice":18.83,"lowPrice":17.78,"bidTick":" ","closePrice":17.71,"netChange":1.15,"totalVolume":48663754,"quoteTimeInLong":1613782799206,"tradeTimeInLong":1613782799316,"mark":18.68,"exchange":"q","exchangeName":"NASD","marginable":true,"shortable":true,"volatility":0.0233,"digits":4,"52WkHigh":28.9,"52WkLow":8.25,"nAV":0,"peRatio":0,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":18.68,"regularMarketLastSize":7386,"regularMarketNetChange":0.97,"regularMarketTradeTimeInLong":1613768400684,"netPercentChangeInDouble":6.4935,"markChangeInDouble":0.97,"markPercentChangeInDouble":5.4771,"regularMarketPercentChangeInDouble":5.4771,"delayed":false},"SAVE":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"848577102","symbol":"SAVE","description":"Spirit Airlines, Inc. Common Stock","bidPrice":35.55,"bidSize":300,"bidId":"P","askPrice":35.75,"askSize":600,"askId":"P","lastPrice":35.46,"lastSize":0,"lastId":"N","openPrice":34.24,"highPrice":36.0899,"lowPrice":34.24,"bidTick":" ","closePrice":34.12,"netChange":1.34,"totalVolume":6531249,"quoteTimeInLong":1613782423799,"tradeTimeInLong":1613782782323,"mark":35.55,"exchange":"n","exchangeName":"NYSE","marginable":true,"shortable":true,"volatility":0.0342,"digits":2,"52WkHigh":42.83,"52WkLow":7.01,"nAV":0,"peRatio":0,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":35.46,"regularMarketLastSize":1268,"regularMarketNetChange":1.34,"regularMarketTradeTimeInLong":1613779200004,"netPercentChangeInDouble":3.9273,"markChangeInDouble":1.43,"markPercentChangeInDouble":4.1911,"regularMarketPercentChangeInDouble":3.9273,"delayed":false},"CCIV":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"171439102","symbol":"CCIV","description":"Churchill Capital Corp IV Class A Common Stock","bidPrice":54.29,"bidSize":100,"bidId":"P","askPrice":54.4,"askSize":400,"askId":"P","lastPrice":54.4,"lastSize":0,"lastId":"P","openPrice":60.09,"highPrice":61.97,"lowPrice":50.32,"bidTick":" ","closePrice":58.05,"netChange":-3.65,"totalVolume":59997946,"quoteTimeInLong":1613782799279,"tradeTimeInLong":1613782798907,"mark":52.94,"exchange":"n","exchangeName":"NYSE","marginable":true,"shortable":true,"volatility":0.0834,"digits":2,"52WkHigh":64.86,"52WkLow":9.6,"nAV":0,"peRatio":0,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":52.94,"regularMarketLastSize":308,"regularMarketNetChange":-5.11,"regularMarketTradeTimeInLong":1613779200004,"netPercentChangeInDouble":-6.2877,"markChangeInDouble":-5.11,"markPercentChangeInDouble":-8.8028,"regularMarketPercentChangeInDouble":-8.8028,"delayed":false},"RIOT":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"767292105","symbol":"RIOT","description":"Riot Blockchain, Inc - Common Stock","bidPrice":71.34,"bidSize":7500,"bidId":"P","askPrice":71.35,"askSize":3600,"askId":"P","lastPrice":71.35,"lastSize":0,"lastId":"P","openPrice":68.8,"highPrice":77.82,"lowPrice":67.42,"bidTick":" ","closePrice":62.03,"netChange":9.32,"totalVolume":75047074,"quoteTimeInLong":1613782799260,"tradeTimeInLong":1613782799260,"mark":71.34,"exchange":"q","exchangeName":"NASD","marginable":true,"shortable":true,"volatility":0.0673,"digits":4,"52WkHigh":79.5,"52WkLow":0.511,"nAV":0,"peRatio":0,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":71.33,"regularMarketLastSize":1653,"regularMarketNetChange":9.3,"regularMarketTradeTimeInLong":1613768400956,"netPercentChangeInDouble":15.025,"markChangeInDouble":9.31,"markPercentChangeInDouble":15.0089,"regularMarketPercentChangeInDouble":14.9927,"delayed":false},"EBON":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"G3R33A106","symbol":"EBON","description":"Ebang International Holdings Inc. - Class A Ordinary Shares","bidPrice":11.6,"bidSize":9900,"bidId":"Q","askPrice":11.61,"askSize":1300,"askId":"P","lastPrice":11.61,"lastSize":0,"lastId":"P","openPrice":11.78,"highPrice":12.41,"lowPrice":10.77,"bidTick":" ","closePrice":11.29,"netChange":0.32,"totalVolume":45462011,"quoteTimeInLong":1613782797460,"tradeTimeInLong":1613782797620,"mark":11.06,"exchange":"q","exchangeName":"NASD","marginable":false,"shortable":false,"volatility":0.1346,"digits":4,"52WkHigh":14.95,"52WkLow":3.8,"nAV":0,"peRatio":0,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":11.06,"regularMarketLastSize":936,"regularMarketNetChange":-0.23,"regularMarketTradeTimeInLong":1613768400925,"netPercentChangeInDouble":2.8344,"markChangeInDouble":-0.23,"markPercentChangeInDouble":-2.0372,"regularMarketPercentChangeInDouble":-2.0372,"delayed":false},"SOS":{"assetType":"EQUITY","assetMainType":"EQUITY","cusip":"83587W106","assetSubType":"ADR","symbol":"SOS","description":"SOS Limited American Depositary Shares","bidPrice":11.53,"bidSize":100,"bidId":"P","askPrice":11.55,"askSize":2300,"askId":"P","lastPrice":11.27,"lastSize":0,"lastId":"N","openPrice":11.36,"highPrice":12.45,"lowPrice":10.57,"bidTick":" ","closePrice":10.65,"netChange":0.62,"totalVolume":66414525,"quoteTimeInLong":1613782800553,"tradeTimeInLong":1613782798543,"mark":11.27,"exchange":"n","exchangeName":"NYSE","marginable":true,"shortable":true,"volatility":0.0795,"digits":2,"52WkHigh":15.88,"52WkLow":0.5101,"nAV":0,"peRatio":13.44,"divAmount":0,"divYield":0,"divDate":"","securityStatus":"Normal","regularMarketLastPrice":11.27,"regularMarketLastSize":684,"regularMarketNetChange":0.62,"regularMarketTradeTimeInLong":1613779200002,"netPercentChangeInDouble":5.8216,"markChangeInDouble":0.62,"markPercentChangeInDouble":5.8216,"regularMarketPercentChangeInDouble":5.8216,"delayed":false}}`);

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

const StocksService = require('./StocksService')
