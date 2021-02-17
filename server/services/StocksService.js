const db = require('../sequelize/models')
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
            stocksByCategory.data[checkCategoryExistsObj.categoryName].push(stockToAdd);
          } else {
            stocksByCategory.data[category] = [stockToAdd];
          }
        });

        await stocksByCategory.setDataValue('data', stocksByCategory.data);
        stocksByCategory.changed('data', true);
        stocksByCategory.save();
      }

      return { msg: stockExists ? 'Stock updated' : 'Stock added' }
  }

  async getCategoryStocksMapper() {
    const stocksByCategoryRow = await db.StocksByCategory.findOne()
    const categoryStocksMapper = await stocksByCategoryRow.data
    return categoryStocksMapper
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
        supportedStocks.forEach((stockInfo, i) => {
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
