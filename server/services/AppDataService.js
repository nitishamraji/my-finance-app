const db = require('../sequelize/models')

class AppData {

  async updateToWatchList(isUpdate, watchlistComment, symbol) {

    try {
      const dbAppData = await db.AppData.findOne();

      if( isUpdate && ( !dbAppData || !dbAppData.data || !dbAppData.data.watchlist ) ) {
        await db.AppData.create({
          data: { watchlist: [{symbol: symbol, comment: watchlistComment}]}
        });
        return true;
      }

      const dbWatchlist = dbAppData.data.watchlist;
      const symbolInfo = dbWatchlist.find(symbolInfo => symbolInfo.symbol === symbol)
      if( isUpdate ) {

        if( !symbolInfo ) {
          dbWatchlist.push({symbol: symbol, comment: watchlistComment})
        } else {
          symbolInfo.comment = watchlistComment
        }
      } else {
        if( symbolInfo ) {
          dbAppData.data.watchlist.splice(dbWatchlist.findIndex(symbolInfo => symbolInfo.symbol === symbol), 1);
        }
      }
      dbAppData.changed('data', true);
      await dbAppData.save();
    } catch(e) {
      console.log(e)
    }
  }

  async saveWatchList(watchlistInfo) {

    const dbAppData = await db.AppData.findOne();

    if( !dbAppData  ) {
      await db.AppData.create({
        data: { watchlist: watchlistInfo.watchlist}
      });
      return true;
    }

    const appData =  await dbAppData.data;
    console.log('appData: ' + appData )

    console.log('saveWatchList: ' + JSON.stringify(watchlistInfo))
    appData.watchlist = watchlistInfo.watchlist;
    dbAppData.changed('data', true);
    await dbAppData.save();
  }

  async getWatchlist() {
    let resWatchlist = []
    try {
      const dbAppData = await db.AppData.findOne();
      if( dbAppData && dbAppData.data && dbAppData.data.watchlist ) {
        resWatchlist = dbAppData.data.watchlist
      }
    }catch(e) {
      console.log(e)
    }
    return resWatchlist;
  }
}

module.exports = AppData
