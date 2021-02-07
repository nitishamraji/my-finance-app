
const db = require('../sequelize/models')
const tdaclient = require('tda-api-client');

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
    // console.log('test tda result');
    // console.log(getMoversResult);

    const getQuoteConfig = {
      symbol: 'ABCDE',
      apikey: ''
    };
    const getQuoteResult = await tdaclient.quotes.getQuote(getQuoteConfig);
    console.log('test tda result');
    console.log(getQuoteResult);

    const getQuotesConfig = {
      symbol: "A,AA,AAA,AAAU,AACG,AACQ,AACQW,AADR,AAIC,AAIC-B,AAIC-C,AAL,AAMC,AAME,AAN,AAOI,AAON,AAP,AAPL,AAT,AAU,AAWW,AAXJ,AAXN,AB,ABB,ABBV,ABC,ABCB,ABCL,ABCM,ABEO,ABEQ,ABEV,ABG,ABIO,ABM,ABMD,ABNB,ABR,ABR-A,ABR-B,ABR-C,ABST,ABT,ABTX,ABUS,AC,ACA,ACAC,ACACW,ACAD,ACAM,ACAMW,ACB,ACBI,ACC,ACCD,ACCO,ACEL,ACER,ACES,ACET,ACEV,ACEVW,ACGL,ACGLO,ACGLP,ACH,ACHC,ACHV,ACI,ACIA,ACIC,ACIC+,ACIC=,ACIO,ACIU,ACIW,ACLS,ACM,ACMR,ACN,ACNB,ACND,ACND+,ACND=,ACOR,ACP,ACRE,ACRS,ACRX,ACSG,ACSI,ACST,ACTC,ACTCW,ACTG,ACTV,ACU,ACV,ACVF,ACWF,ACWI,ACWV,ACWX,ACY,ADAP,ADBE,ADC,ADCT,ADES,ADFI,ADI,ADIL,ADILW,ADM,ADMA,ADME,ADMP,ADMS,BA,TSLA,MSFT",
      apikey: ''
    };
    // const getQuotesResult = await tdaclient.quotes.getQuotes(getQuotesConfig);
    // console.log('test tda result');
    // console.log(getQuotesResult);


  }
}

module.exports = StocksData;
