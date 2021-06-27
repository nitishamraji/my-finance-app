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

      // browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});

      const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

puppeteer.launch({ headless: true }).then(async browser => {
      const page = await browser.newPage();
      await page.goto('https://finviz.com/map.ashx');

      await page.waitForTimeout(10000)
      await page.screenshot({ path: "./screenshot.png", fullPage: true });

      console.log('testing puppeteer file  changes: ')
      const pageTitle = await page.title();
      console.log('finvizz title: ' + pageTitle);
      await page.waitForTimeout(3000)
      await page.waitForSelector('#share-map');
      await page.waitForTimeout(3000)
      await page.click('#share-map');
      await page.waitForTimeout(3000)
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
    });
    
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
