var socketInit = function(server) {

  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    },
  });

  let interval;
  let connectCounter = 0;
  io.on("connection", (socket) => {
    if (interval) {
      clearInterval(interval);
    }
    console.log("New client connected: " + socket.handshake.query.userId);
    connectCounter++;
    console.log('clients connected: ' + connectCounter);
    // console.log(Object.keys(io.sockets));
    // console.log(Object.keys(io.sockets.sockets));
    interval = setInterval(() => getApiAndEmit(socket), 5000);
    socket.on("disconnect", () => {
      connectCounter--;
      console.log("Client disconnected: " +  connectCounter);
      clearInterval(interval);
    });
  });

  const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    io.sockets.emit("FromAPI", Math.floor(Math.random() * Math.floor(100)));
  };

};

module.exports = {
    socketInit: socketInit
};
