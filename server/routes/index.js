const express = require('express')
const router = express.Router()
const cors = require('cors')

const { catchErrors } = require('./error-handler')

const db = require('../sequelize/models')

const StocksDataService = require('../services/StocksDataService')
const RssService = require('../services/RssService')
const StocksService = require('../services/StocksService')
const UserService = require('../services/UserService')
const HeatMapService = require('../services/HeatMapService')

router.post('/stocks', cors(), async (req, res, next) => {
  // db
  //   .any('select * from hello')
  //   .then(data => {
  //     res.json(`${req.path} fetched ${JSON.stringify(data)} from the database`)
  //   })
  //   .catch(next)
  // console.log('testing api stocks:' + req);
  // var userJson = req.body;
  //
  // const user = await db.User.create({ userId: userJson.category, role: userJson.stocks[0] });
  //
  // console.log(user);

  // try {
  //   var stocksJson = req.body;
  //   const stocksByCategory = await db.StocksByCategory.findOne()
  //   const category = stocksJson.category;
  //   const stocks = stocksJson.stocks;
  //
  //   if( !stocksByCategory )
  //   {
  //     console.log('no data');
  //     const obj = {};
  //     obj[stocksJson.category]=stocksJson.stocks;
  //     const test = await db.StocksByCategory.create({doc: obj});
  //   } else {
  //     console.log('data exists');
  //     console.log(stocksByCategory.doc);
  //     stocksByCategory.doc[category] = stocks;
  //     console.log(stocksByCategory.doc);
  //     // await stocksByCategory.setDataValue('doc', stocksByCategory.doc);
  //       // stocksByCategory.save({haveChangedJSON: ["doc"]});
  //       stocksByCategory.changed('doc', true);
  //       stocksByCategory.save();
  //   }
  // } catch(e)
  // {
  //   console.log(e);
  // }









  try {
    const service = new StocksDataService();
    const data = await service.getSupportedStocks();

    const supportedStocks = await db.SupportedStocks.findOne()

    if( !supportedStocks )
    {
      console.log('no supportedStocks data');
    } else {
      console.log('data exists');
      console.log(supportedStocks.data.length);
    }
  } catch(e)
  {
    console.log(e);
  }


  // Stocks.create({ doc: {category: stockJson.category, stocks: stockJson.stocks} });

  // const categoryDoc = Stocks.findOne({ where: { id: 1 } }).then(doc => console.log(doc));

//   var json = "{category: " + stockJson.category +"}";
//   const categories = await database.query(`insert into stocks
//   (doc)
// values
//   (array['{"sender":"pablo","body":"they are on to us"}']::jsonb[])`, {
//     type: QueryTypes.INSERT
//   });

  // const categories = await database.query("SELECT jsonb_object_keys(doc) FROM stocks;", {
  //   type: QueryTypes.SELECT
  // });

  // .then(doc =>{
  //     "doc.category": {
  //       [Op.eq]: stockJson.category
  //     }
  // });
  //
  // console.log(categories);

  res.send("success");
});

router.get('/getUserWatchList/:userId', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.getUserWatchList(req.params.userId);
    res.send({success: result.success, msg: result.msg, data: result.data});
}));

router.post('/saveUserWatchList', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.saveUserWatchList(req.body);
    res.send({success: result.success, msg: result.msg});
}));

router.get('/createAdminUser', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.createAdminUser();
    res.send({success: result.success, msg: result.msg});
}));

router.get('/getAllUsersInfo/:reqUserId', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.getAllUsersInfo(req.params.reqUserId);
    res.send({success: result.success, msg: result.msg, data: result.data});
}));

router.get('/getUserInfo/:userId', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.getUserInfo(req.params.userId);
    res.send({success: result.success, msg: result.msg, data: result.data});
}));

router.post('/updateUserApproval', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.updateUserApproval(req.body);
    res.send({success: result.success, msg: result.msg});
}));

router.post('/updateUserProfile', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.updateUserProfile(req.body);
    res.send({success: result.success, msg: result.msg});
}));

router.post('/loginUser', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.loginUser(req.body);
    res.send({success: result.success, msg: result.msg});
}));

router.post('/registerUser', cors(),  catchErrors( async (req, res, next) => {
    const service = new UserService();
    const result = await service.registerUser(req.body);
    res.send({success: result.success, msg: result.msg});
}));

router.get('/getAllStocksData', cors(),  catchErrors( async (req, res, next) => {
    console.log('/getAllStocksData')
    const service = new StocksDataService();
    const result = await service.getAllStocksData();
    res.send({success: result.success, msg: result.msg, data: result.data});
}));

router.get('/updateAllStocksData', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksDataService();
    const result = await service.updateAllStocksData();
    res.send({success: true, msg: result.msg});
}));

router.post('/addStock', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksService();
    const result = await service.addOrUpdateStock(req.body);
    res.send({success: true, msg: result.msg});
}));

router.get('/getCategoryStocksMapper', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksService();
    const categoryStocksMapper = await service.getCategoryStocksMapper();
    res.send({success: true, msg: '', data: categoryStocksMapper});
}));

router.get('/getAllAddedStocks', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksService();
    const allAddedStocks = await service.getAllAddedStocks();
    res.send({success: true, msg: '', data: allAddedStocks});
}));

router.get('/getStockCategories/:symbol', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksService();
    console.log('testing getStockCategories: ' + req.params.symbol)
    const stockCategories = await service.getStockCategories(req.params.symbol);
    res.send({success: true, msg: '', data: stockCategories});
}));

router.get('/getAllCategories', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksService();
    const categories = await service.getAllCategories();
    res.send({success: true, msg: '', data: categories});
}));

router.get('/getStockInfo/:symbol', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksDataService();
    const data = await service.getStockInfo(req.params.symbol);
    res.send({success: true, msg: '', data: data});
}));

router.get('/getSupportedStocks', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksDataService();
    const data = await service.getSupportedStocks();
    res.send({success: true, msg: '', data: data});
}));

router.get('/testTda', cors(),  catchErrors( async (req, res, next) => {
    const service = new StocksDataService();
    const data = await service.testTda();
    res.send({success: true, msg: '', data: data});
}));

router.get('/getCnbcNews/:option', cors(),  catchErrors( async (req, res, next) => {
    const service = new RssService();
    const data = await service.getCnbcNews(req.params.option);
    res.send({success: true, msg: '', data: data});
}));

router.get('/getGoogleNews', cors(),  catchErrors( async (req, res, next) => {
    const service = new RssService();
    const data = await service.getGoogleNews();
    res.send({success: true, msg: '', data: data});
}));

router.get('/getGoogleNews/:symbol', cors(),  catchErrors( async (req, res, next) => {
    const service = new RssService();
    const data = await service.getGoogleNews(req.params.symbol);
    res.send({success: true, msg: '', data: data});
}));

router.get('/getRedditNews', cors(),  catchErrors( async (req, res, next) => {
    const service = new RssService();
    const data = await service.getRedditNews();
    res.send({success: true, msg: '', data: data});
}));

router.get('/getRedditNews/:symbol', cors(),  catchErrors( async (req, res, next) => {
    const service = new RssService();
    const data = await service.getRedditNews(req.params.symbol);
    res.send({success: true, msg: '', data: data});
}));

router.get('/getFinvizNews/:symbol', cors(),  catchErrors( async (req, res, next) => {
    const service = new RssService();
    const data = await service.getFinvizNews(req.params.symbol);
    res.send({success: true, msg: '', data: data});
}));

router.get('/getHeatMapUrl', cors(),  catchErrors( async (req, res, next) => {
    const service = new HeatMapService();
    const url = await service.getHeatMapUrl();
    res.send({success: true, msg: '', url: url});
}));

module.exports = router
