const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
// Express fa la linea di codice seguente a prescindere. Lo  facciamo solo per refactoring
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// COUNTER APP
let count = 0;

// io.on() is listening to a specific event to happen: in questo caso evento connection. Il parametro usato nella callback, cioè 'socket', contiene informazioni riguardo la connessione
io.on("connection", socket => {
  console.log("New WebSocket connection");

  // Su websocket si parla sempre di eventi -> si emettono e ricevono continuamente eventi. In questo caso noi lo emettiamo
  // Tutto quello che passiamo con .emit nella callback (cmoe in questo caso la var 'count'), sarà disponibile lato client
  socket.emit("countUpdated", count);

  socket.on("increment", () => {
    count++;
    //socket.emit("countUpdated", count);
    // AL contrario di socket.emit, io.emit() emette dati a tutte le connessioni disponibili a riceverli. Al contrario socket.io solo alla connessione specificata
    io.emit("countUpdated", count);
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
