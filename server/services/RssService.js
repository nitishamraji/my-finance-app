const moment = require('moment');
const Parser = require('rss-parser');
const puppeteer = require('puppeteer');
const StocksDataService = require('./StocksDataService')
const rp = require("request-promise")
const cheerio = require("cheerio")

const parser = new Parser({
  customFields: {
    item: ['source']
  }
});

class Rss {

	updateRedditFeed(feedData){
		let formattedFeedData = {};
		formattedFeedData.items = [];
	
		if(!feedData.data || !feedData.data.children || feedData.data.children.length < 1) {
			return formattedFeedData;
		}
	
		const formats = ['ddd, DD MMM YYYY HH:mm:ss ZZ', 'ddd, DD MMM YY HH:mm:ss ZZ'];
		feedData.data.children.forEach(item => {
			let formattedFeed = {};
			formattedFeed.title = item.data.title;
			formattedFeed.link = item.data.url;
			formattedFeed.source = item.data.subreddit_name_prefixed;
			formattedFeed.content = item.data.selftext;
			formattedFeed.pubDate = moment(item.data.created_utc * 1000);
			formattedFeed.pubDateFormatted = formattedFeed.pubDate.format(formats[0]);
			formattedFeed.pubDateFromNow = formattedFeed.pubDate.fromNow();
			formattedFeedData.items.push(formattedFeed);
		});
		formattedFeedData.items.sort(function(a,b){return b.pubDate - a.pubDate});
		return formattedFeedData;
	}
  
  updateFeed(feed){
    const formats = ['ddd, DD MMM YYYY HH:mm:ss ZZ', 'ddd, DD MMM YY HH:mm:ss ZZ'];

    const sortedFeeds = feed.items.sort(function(a,b){return moment(b.pubDate) - moment(a.pubDate)});

    // const sortedFeeds = feed.items;

    feed.items = sortedFeeds;

    feed.items.forEach(item => {
      // const pubDate = moment(item.pubDate, formats);
      const pubDateFromNow = moment(item.pubDate).fromNow();
      item.pubDateFromNow = pubDateFromNow;
    });
    return feed;
  }

  async getCnbcNews(option) {
    let isOption = option && option.length > 0;

    let topNewsFeed={items:[]},
      worldNewsFeed={items:[]},
      usNewsFeed={items:[]},
      optionsActionNewsFeed={items:[]},
      investingNewsFeed={items:[]};

    if( ( isOption && option === 'cnbcTopNews' ) || !isOption ) {
     topNewsFeed = await parser.parseURL(`https://www.cnbc.com/id/100003114/device/rss/rss.html`);
     worldNewsFeed = await parser.parseURL(`https://www.cnbc.com/id/100727362/device/rss/rss.html`);
     usNewsFeed = await parser.parseURL(`https://www.cnbc.com/id/15837362/device/rss/rss.html`);
    }

    if( ( isOption && option === 'cnbcOptionsAction' ) || !isOption )
      optionsActionNewsFeed = await parser.parseURL(`https://www.cnbc.com/id/28282083/device/rss/rss.html`);

    if( ( isOption && option === 'cnbcInvesting' ) || !isOption )
      investingNewsFeed = await parser.parseURL(`https://www.cnbc.com/id/15839069/device/rss/rss.html`);

    const allFeeds = topNewsFeed.items
          .concat(worldNewsFeed.items)
          .concat(usNewsFeed.items)
          .concat(investingNewsFeed.items)
          .concat(optionsActionNewsFeed.items);

    const allFeedsFiltered = []; const feedLinks = [];
    allFeeds.forEach((item) => {
      if( feedLinks.indexOf(item.link) < 0 ) {
        allFeedsFiltered.push(item)
        feedLinks.push(item.link)
      }
    });

    const feed = {items: allFeedsFiltered}
    return this.updateFeed(feed);
  }

  async getGoogleNews(symbol) {
    let stockSymbol = symbol ? symbol : '';
    const hasSymbol = symbol && symbol.length > 0;

    if(symbol && symbol.length === 1 ) {
      const stocksDataService = new StocksDataService();
      const stockInfo = await stocksDataService.getStockInfo(symbol)
      stockSymbol = stockInfo.name;
    }
    const googleNewsUrl = hasSymbol ? `https://news.google.com/rss/search?q=${stockSymbol}+stock&hl=en-US&gl=US&ceid=US:en` :
      'https://news.google.com/rss/search?q=stock+market&hl=en-US&gl=US&ceid=US:en';
    const feed = await parser.parseURL(googleNewsUrl);
    return this.updateFeed(feed);
  }

  async getRedditWallStreetBets(symbol) {
    const redditWallStreetBetsFeed = await axios.get((symbol && symbol.length > 0) ? `https://www.reddit.com/r/wallstreetbets/search.json?q="${symbol}"&source=recent&restrict_sr=1&sort=new` :
      `https://www.reddit.com/r/wallstreetbets.json`);
	return this.updateRedditFeed(redditWallStreetBetsFeed.data);
  }

  async getRedditOptions(symbol) {
    const redditOptionsFeed = await axios.get((symbol && symbol.length > 0) ? `https://www.reddit.com/r/options/search.json?q="${symbol}"&source=recent&restrict_sr=1&sort=new` :
      `https://www.reddit.com/r/options.json`);
    return this.updateRedditFeed(redditOptionsFeed.data);
  }

  async getRedditStockMarket(symbol) {
    const redditStockMarketFeed = await axios.get((symbol && symbol.length > 0) ? `https://www.reddit.com/r/StockMarket/search.json?q="${symbol}"&source=recent&restrict_sr=1&sort=new` :
      `https://www.reddit.com/r/StockMarket.json`);
    return this.updateRedditFeed(redditStockMarketFeed.data);
  }

  async getRedditInvesting(symbol) {
    const redditInvestingFeed = await axios.get((symbol && symbol.length > 0) ? `https://www.reddit.com/r/investing/search.json?q="${symbol}"&source=recent&restrict_sr=1&sort=new` :
      `https://www.reddit.com/r/investing.json`);
    return this.updateRedditFeed(redditInvestingFeed.data);
  }

  async getRedditStocks(symbol) {
    const redditStocksFeed = await axios.get((symbol && symbol.length > 0) ? `https://www.reddit.com/r/stocks/search.json?q="${symbol}"&source=recent&restrict_sr=1&sort=new` :
      `https://www.reddit.com/r/stocks.json`);
    return this.updateRedditFeed(redditStocksFeed.data);
  }

  async getRedditStocksAndTrading(symbol) {
    const redditStocksAndTradingFeed = await axios.get((symbol && symbol.length > 0) ? `https://www.reddit.com/r/StocksAndTrading/search.json?q="${symbol}"&source=recent&restrict_sr=1&sort=new` :
      `https://www.reddit.com/r/StocksAndTrading.json`);
    return this.updateRedditFeed(redditStocksAndTradingFeed.data);
  }
  async getRedditNews(stockSymbolOrSource) {
    let symbol = stockSymbolOrSource;
    let isSource = false;

    if( stockSymbolOrSource ) {
      isSource = ["wallstreetbets","options","StockMarket","investing","stocks","StocksAndTrading"].indexOf(stockSymbolOrSource) >= 0;
    }

    if( !isSource && symbol && symbol.length === 1 ) {
      const stocksDataService = new StocksDataService();
      const stockInfo = await stocksDataService.getStockInfo(symbol);
      symbol = stockInfo.name;
    }

    let redditOptionsFeed={items:[]},
      redditWallStreetBetsFeed={items:[]},
      redditInvestingFeed={items:[]},
      redditStockMarketFeed={items:[]},
      redditStocksFeed={items:[]},
      redditStocksAndTradingFeed={items:[]},
      redditStockPicksFeed={items:[]};

		try {
			if( ( isSource && stockSymbolOrSource === 'options' ) || !isSource )
				redditOptionsFeed = await this.getRedditOptions(isSource ? null : symbol)
		} catch(ex) {
			console.log('Error: ' + ex);
		}
	
		try {
			if( ( isSource && stockSymbolOrSource === 'wallstreetbets' ) || !isSource )
				redditWallStreetBetsFeed = await this.getRedditWallStreetBets(isSource ? null : symbol)
		} catch(ex) {
			console.log('Error: ' + ex);
		}
	
		try {	
			if( ( isSource && stockSymbolOrSource === 'investing' ) || !isSource )
				redditInvestingFeed = await this.getRedditInvesting(isSource ? null : symbol)
		} catch(ex) {
			console.log('Error: ' + ex);
		}

		try {
			if( ( isSource && stockSymbolOrSource === 'StockMarket' ) || !isSource )
				redditStockMarketFeed = await this.getRedditStockMarket(isSource ? null : symbol)
		} catch(ex) {
			console.log('Error: ' + ex);
		}
	
		try {
			if( ( isSource && stockSymbolOrSource === 'stocks' ) || !isSource )
				redditStocksFeed = await this.getRedditStocks(isSource ? null : symbol)
		} catch(ex) {
			console.log('Error: ' + ex);
		}
	
		try {
			if( ( isSource && stockSymbolOrSource === 'StocksAndTrading' ) || !isSource )
				redditStocksAndTradingFeed = await this.getRedditStocksAndTrading(isSource ? null : symbol)
		} catch(ex) {
			console.log('Error: ' + ex);
		}

    const allFeeds = redditOptionsFeed.items
        .concat(redditWallStreetBetsFeed.items)
        .concat(redditStockMarketFeed.items)
        .concat(redditInvestingFeed.items)
        .concat(redditStocksFeed.items)
        .concat(redditStocksAndTradingFeed.items)
        .concat(redditStockPicksFeed.items);

    const feed = {items: allFeeds}
    return this.updateFeed(feed);
  }

  async getFinvizNews(stockSymbol) {
    let items = [];
    await rp(`https://www.finviz.com/quote.ashx?t=${stockSymbol}&ty=c&p=d&b=1`)
    .then(async html => {
      console.log('testing finviz')
      const $ = cheerio.load(html, null, false);

      const table = $(".fullview-news-outer tr").each((tr_i, tr) => {
        const item = {}
        const tds = $(tr).find('td');
        item.pubDateFromNow = $($(tds)[0]).text();
        const td1 = $(tds)[1];
        item.link = $(td1).find('a').attr('href');
        item.title = $(td1).find('a').text();
        item.source = $($(td1).find('.news-link-right')[0]).children().first().text();
        items.push(item);
      });
    })
    .catch(err => console.log(err) )

    return {items: items};
  }

  async getFinvizNews2(stockSymbol) {

    let feed = {items: []};
    let browser = null;

    console.log('start getFinvizNews');

    try
    {
      browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`https://finviz.com/quote.ashx?t=${stockSymbol}`);
      const pageTitle = await page.title();
      console.log('finvizz title: ' + pageTitle);
      await page.waitForSelector('.fullview-news-outer');

      const data = await page.evaluate(() => {
        console.log('inside')
        const trs = Array.from(document.querySelectorAll('.fullview-news-outer tr'))
        const items = [];
        trs.map((tr) => {
          const tds = tr.querySelectorAll('td')
          const item = {}
          item.pubDateFromNow = tds[0].innerText
          const newsContentDivs = tds[1].querySelectorAll('.news-link-container div')
          item.title = newsContentDivs[0].innerText
          item.link = newsContentDivs[0].querySelector('a').href
          item.source = newsContentDivs[1].innerText
          items.push(item)
        });
        return items;
      });
      // const trs = await page.$$eval('.fullview-news-outer tr');
      // trs.map( async (tr) => {
      //   const tds = await tr.querySelectorAll('td');
      //   console.log(tds[0].innerText);
      // })

      await browser.close();

      feed.items = data;

    }catch(error){
      if(browser){
        await browser.close();
      }
      console.log(error);
    }

    console.log('end getFinvizNews');
    return feed;
  }
}

module.exports = Rss;
