//to avoid circular dependencies

// const StocksService = require('./StocksService')

class ServicesHelper {
  getAllAddedStocks(){
    const service = new require('./StocksService');
    return service.getAllAddedStocks()
  }
}

module.exports = ServicesHelper;
