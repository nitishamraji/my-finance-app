const db = require('../sequelize/models')
const AppDataService = require('./AppDataService')
const UserService = require('./UserService')
const StocksDataService = require('./StocksDataService')

const checkCategoryExists = (existingCategories, categoryToAdd) => {
  let hasCategory = false;
  let categoryName = '';

  existingCategories.forEach((category, i) => {
    if( category.toUpperCase() === categoryToAdd.toUpperCase() ){
      hasCategory = true;
      categoryName = category;
    }
  });
  return {hasCategory: hasCategory, categoryName: categoryName}
}

class Stocks {

  async addOrUpdateStock(addStockJson) {

      let stockExists = false;

      const stocksByCategory = await db.StocksByCategory.findOne();

      const stockToAdd = addStockJson.stockToAdd;
      let stockToAddCategories = addStockJson.categories;

      console.log('addStockJson: ' + JSON.stringify(addStockJson))
      console.log('stockToAddCategories: ' + stockToAddCategories)
      console.log('stockToAddCategories length: ' + stockToAddCategories.length)
      if( !stockToAddCategories || stockToAddCategories.length < 1 ) {
        stockToAddCategories = ['Random'];
      }

      if( !stocksByCategory )
      {
        const obj = {};
        stockToAddCategories.forEach(category => {
          obj[category] = [stockToAdd];
        });
        await db.StocksByCategory.create({data: obj});
      } else {

        const existingStockCategories = await this.getStockCategories(stockToAdd);
        const existingCategories = Object.keys(stocksByCategory.data);

        if( existingStockCategories.stockExists ) {
          stockExists = true;

          existingCategories.forEach((category, i) => {
            const categoryStocks = stocksByCategory.data[category];
            const hasStock = categoryStocks.map((s) => { return s.toLowerCase() }).includes(stockToAdd.toLowerCase());
            if( hasStock ){
              stocksByCategory.data[category].splice(categoryStocks.indexOf(category), 1);
            }
          });

        }

        stockToAddCategories.forEach((category, i) => {
          const checkCategoryExistsObj  = checkCategoryExists(existingCategories, category);

          if( checkCategoryExistsObj.hasCategory ) {
            const dbCategoryStocs = stocksByCategory.data[checkCategoryExistsObj.categoryName];
            if( !dbCategoryStocs.includes(stockToAdd) ) {
              dbCategoryStocs.push(stockToAdd);
            }
          } else {
            stocksByCategory.data[category] = [stockToAdd];
          }
        });

        await stocksByCategory.setDataValue('data', stocksByCategory.data);
        stocksByCategory.changed('data', true);
        stocksByCategory.save();
      }

      try {
        const appDataService = new AppDataService()
        appDataService.updateToWatchList(addStockJson.addToGlobalWatchList, addStockJson.watchlistComment, stockToAdd)

        const userService = new UserService()
        userService.updateToWatchList(addStockJson.userId, addStockJson.addToMyWatchList, stockToAdd)

        if( !stockExists ) {
          const stocksDataService = new StocksDataService ()
          stocksDataService.addStockData(stockToAdd)
        }

        if( !stockExists ) {
          const stocksLiveDataService = new StocksLiveDataService ()
          stocksLiveDataService.addStockData(stockToAdd)
        }

      } catch(e) {
        console.log(e)
      }


      return { msg: stockExists ? 'Stock updated' : 'Stock added' }
  }

  async getCategoryStocksMapper() {
    const stocksByCategoryRow = await db.StocksByCategory.findOne()
    const categoryStocksMapper = await stocksByCategoryRow.data
    const sortedKeys = Object.keys(categoryStocksMapper).sort()
    const categoryStocksData = {}
    sortedKeys.forEach((key, i) => {
      categoryStocksData[key] = categoryStocksMapper[key]
    });    
    return categoryStocksData
  }

  async getStockCategories(symbol) {
    const stocksByCategory = await db.StocksByCategory.findOne();
    let stockCategories = [];

    if( stocksByCategory ) {
      const existingCategories = Object.keys(stocksByCategory.data);

      existingCategories.map( (category) => {
        const categoryStocks = stocksByCategory.data[category];
        const hasStock = categoryStocks.map((s) => { return s.toLowerCase() }).includes(symbol.toLowerCase());
        if( hasStock ){
          stockCategories.push(category);
        }
      });

    }

    return {symbol: symbol, stockCategories: stockCategories, stockExists: (stockCategories.length > 0)}
  }

  async getAddedStockInfo(reqJson) {
    const symbol = reqJson.symbol;
    const userId = reqJson.userId;

    const stockInfo = await this.getStockCategories(symbol)
    stockInfo.isInAppWatchlist = false
    stockInfo.isInUserWatchlist = false
    stockInfo.watchlistComment = ''

    if( !stockInfo.stockExists ) {
      return stockInfo
    }

    try {
    const appDataService = new AppDataService()
    const appWatchlist = await appDataService.getWatchlist()

    const userService = new UserService()
    const userWatchlist = await userService.getUserWatchList(userId)

    const appWatchlistStock = appWatchlist.find(symbolInfo => symbolInfo.symbol === symbol )
    if( appWatchlistStock ) {
      stockInfo.isInAppWatchlist = true
      stockInfo.watchlistComment = appWatchlistStock.comment
    }

    stockInfo.isInUserWatchlist = userWatchlist.data.includes(symbol)
    } catch(e) {
      console.log(e)
    }

    return stockInfo
  }

  async getAllCategories() {
    let categories = [];
    const stocksByCategory = await db.StocksByCategory.findOne()
    if( stocksByCategory ) {
      categories = Object.keys(stocksByCategory.data).sort();
    }
    return categories;
  }

  async getAllAddedStocks() {
    const allAddedStocksInfo = [];
    const allAddedStocks = [];
    const stocksByCategory = await db.StocksByCategory.findOne()

    if( !stocksByCategory ) {
      return allAddedStocks;
    }

    const data = await stocksByCategory.data;
    const existingCategories = Object.keys(data);

    existingCategories.map( (category) => {
      const categoryStocks = data[category];
      if( !categoryStocks || categoryStocks.length <= 0 ) {
        return false;
      }
      categoryStocks.forEach((stock) => {
        if( !allAddedStocks.includes(stock) ) {
          allAddedStocks.push(stock)
        }
      })

    })

    if( allAddedStocks.length > 0 ) {
      const stocksDataService = new StocksDataService();
      const supportedStocks = await stocksDataService.getSupportedStocks();

      allAddedStocks.forEach((symbol, i) => {
        supportedStocks.data.forEach((stockInfo, i) => {
          if( stockInfo.symbol === symbol ) {
              allAddedStocksInfo.push({
                symbol: symbol,
                name: stockInfo.name
              })
          }
        });
      });
    }
    return allAddedStocksInfo;
  }

}

module.exports = Stocks;

const StocksLiveDataService = require('./StocksLiveDataService')
