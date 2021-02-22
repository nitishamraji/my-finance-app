const moment = require('moment');
const puppeteer = require('puppeteer');
const db = require('../sequelize/models')

class HeatMap {

  async getHeatMapUrl () {
    console.log('running puppetter');
    let browser = null;
    let heatmapUrl = "";

    try
    {
      const heatmap = await db.Heatmap.findOne();

      var m = moment().weekday();
      console.log('test day: ' + m);
      if( heatmap ) {
        const lastUpdated = heatmap.updatedAt;
        console.log('lastUpdated ' + lastUpdated)
        console.log('timezone: ' + moment.tz.guess())
        const now = moment();
        const timeDiffInMinutes = moment.duration(now.diff(moment(lastUpdated))).asMinutes();
        console.log('timeDiffInMinutes ' + timeDiffInMinutes)
        heatmapUrl = heatmap.url;
        if( timeDiffInMinutes <= 15 && heatmapUrl.length > 0 ) {
          return heatmap.url;
        }
      }

      browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage();
      await page.goto('https://finviz.com/map.ashx');
      const pageTitle = await page.title();
      console.log('finvizz title: ' + pageTitle);
      await page.waitForSelector('#share-map');
      await page.click('#share-map');
      // await page.waitForTimeout(5000)
      await page.waitForSelector('#static', { visible: true });

      // await page.waitForSelector('#static');
      const publishUrl = await page.$eval('#static', el => el.value);
      console.log('publish url: ' + publishUrl);
      heatmapUrl = publishUrl;

      if( !heatmap ) {
        db.Heatmap.create({url: heatmapUrl});
      } else {
        heatmap.update({url: heatmapUrl});
      }

      browser.close();

    }catch(error){
      if(browser){
        browser.close();
      }
      console.log(error);
    }

    return heatmapUrl;
  }
}

module.exports = HeatMap;
