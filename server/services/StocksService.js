const db = require('../sequelize/models')

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
        await db.StocksByCategory.create({doc: obj});
      } else {

        const existingStockCategories = await this.getStockCategories(stockToAdd);
        const existingCategories = Object.keys(stocksByCategory.doc);

        if( existingStockCategories.stockExists ) {
          stockExists = true;

          existingCategories.forEach((category, i) => {
            const categoryStocks = stocksByCategory.doc[category];
            const hasStock = categoryStocks.map((s) => { return s.toLowerCase() }).includes(stockToAdd.toLowerCase());
            if( hasStock ){
              stocksByCategory.doc[category].splice(categoryStocks.indexOf(category), 1);
            }
          });

        }

        stockToAddCategories.forEach((category, i) => {
          const checkCategoryExistsObj  = checkCategoryExists(existingCategories, category);

          if( checkCategoryExistsObj.hasCategory ) {
            stocksByCategory.doc[checkCategoryExistsObj.categoryName].push(stockToAdd);
          } else {
            stocksByCategory.doc[category] = [stockToAdd];
          }
        });

        await stocksByCategory.setDataValue('doc', stocksByCategory.doc);
        stocksByCategory.changed('doc', true);
        stocksByCategory.save();
      }

      return { msg: stockExists ? 'Stock updated' : 'Stock added' }
  }

  async getStockCategories(symbol) {
    const stocksByCategory = await db.StocksByCategory.findOne();
    let stockCategories = [];

    if( stocksByCategory ) {
      const existingCategories = Object.keys(stocksByCategory.doc);

      existingCategories.map( (category) => {
        const categoryStocks = stocksByCategory.doc[category];
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
      categories = Object.keys(stocksByCategory.doc).sort();
    }
    return categories;
  }

}

module.exports = Stocks;
