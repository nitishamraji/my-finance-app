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
      interval = setInterval(() => getApiAndEmit(), 5000);
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

  const getApiAndEmit = () => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    io.sockets.emit("FromAPI", Math.floor(Math.random() * Math.floor(100)));
  };

};

module.exports = {
    socketInit: socketInit
};
