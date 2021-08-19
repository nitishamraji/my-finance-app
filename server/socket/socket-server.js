const StocksLiveDataService = require('../services/StocksLiveDataService')

var socketInit = function(server) {

  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    },
  });

  let interval;
  let connectCounter = 0;
  io.on("connection", (socket) => {

    console.log('global.liveStreamingInProgess: ' + global.liveStreamingInProgess);

    console.log("New client connected: " + socket.handshake.query.userId);
    connectCounter++;
    console.log('clients connected: ' + connectCounter);

    if (connectCounter === 1) {
      interval = setInterval(() => getApiAndEmit(), 10 * 1000);
      global.liveStreamingInProgess = true
    }
    // console.log(Object.keys(io.sockets));
    // console.log(Object.keys(io.sockets.sockets));



    // const timeout = timer.setTimeout(() => socket.disconnect(true), expiresIn)

    socket.on("disconnect", () => {
      connectCounter--;
      console.log("Client disconnected: " +  connectCounter);
      if( connectCounter <= 0 ) {
        clearInterval(interval);
        global.liveStreamingInProgess = false
      }
    });
  });

  const getApiAndEmit = async () => {
    const response = new Date();
    const service = new StocksLiveDataService();
    await service.updateAllStocksData();
    const result = await service.getAllStocksData();
    // Emitting a new message. Will be consumed by the client
    io.sockets.emit("StocksLiveData", result);
  };

};

module.exports = {
    socketInit: socketInit
};
