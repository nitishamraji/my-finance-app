const moment = require('moment');
const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: ['source']
  }
});

class Rss {

  updateFeed(feed){
    const formats = ['ddd, DD MMM YYYY HH:mm:ss ZZ', 'ddd, DD MMM YY HH:mm:ss ZZ'];

    const sortedFeeds = feed.items.sort(function(a,b){return moment(b.pubDate) - moment(a.pubDate)});

    feed.items = sortedFeeds;

    feed.items.forEach(item => {
      // const pubDate = moment(item.pubDate, formats);
      const pubDateFromNow = moment(item.pubDate).fromNow();

      item.pubDateFromNow = pubDateFromNow;
    });
    return feed;
  }

  async getGoogleNews() {
    const googleNewsUrl = 'https://news.google.com/rss/search?q=stock+market&hl=en-US&gl=US&ceid=US:en';
    const feed = await parser.parseURL(googleNewsUrl);
    // const rssData = await response.data;
    return this.updateFeed(feed);
  }

  async getStockNews(symbol) {
    const stockNewsUrl = `https://news.google.com/rss/search?q=${symbol}+stock&hl=en-US&gl=US&ceid=US:en`;
    const feed = await parser.parseURL(stockNewsUrl);
    return this.updateFeed(feed);
  }
}

module.exports = Rss;
