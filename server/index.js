const express = require('express')
const cors = require('cors')
var bodyParser = require('body-parser')
require('dotenv').config()
const path = require('path')
const app = express()

process.env.TZ = 'America/Chicago';

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/../client/build')));
} else {
  app.use(express.static(path.join(__dirname, '/../client/public')));
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.json());

// const whitelist = ['http://localhost:3000', 'http://localhost:5000', 'https://nitish-react-express-test-2.herokuapp.com/']
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log("** Origin of request " + origin)
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       console.log("Origin acceptable")
//       callback(null, true)
//     } else {
//       console.log("Origin rejected")
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

app.use(cors())

//disable etag
app.disable('etag')

const routes = require('./routes')
app.use('/api', routes)

const { devErrorHandler } = require('./routes/error-handler')
app.use(devErrorHandler)

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '/../client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/../client/build', 'index.html'));
  });
} else {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '/../client/public')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/../client/public', 'index.html'));
  });
}


const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`Express running on port ${PORT}`)
})

const {socketInit} = require('./socket/socket-server');
socketInit(server)
// const io = require('socket.io')(server, {
//   cors: {
//     origin: '*',
//   },
// });
//
//
// let interval;
// let connectCounter = 0;
//
// io.on("connection", (socket) => {
//   if (interval) {
//     clearInterval(interval);
//   }
//   console.log("New client connected: " + socket.handshake.query.userId);
//   connectCounter++;
//   console.log('clients connected: ' + connectCounter);
//   // console.log(Object.keys(io.sockets));
//   // console.log(Object.keys(io.sockets.sockets));
//   interval = setInterval(() => getApiAndEmit(socket), 5000);
//   socket.on("disconnect", () => {
//     connectCounter--;
//     console.log("Client disconnected: " +  connectCounter);
//     clearInterval(interval);
//   });
// });
//
// const getApiAndEmit = socket => {
//   const response = new Date();
//   // Emitting a new message. Will be consumed by the client
//   io.sockets.emit("FromAPI", Math.floor(Math.random() * Math.floor(100)));
// };
