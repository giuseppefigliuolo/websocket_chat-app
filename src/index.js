const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
// Express fa la linea di codice seguente a prescindere. Lo  facciamo solo per refactoring
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// io.on() is listening to a specific event to happen: in questo caso evento connection. Il parametro usato nella callback, cioè 'socket', contiene informazioni riguardo la connessione
io.on("connection", socket => {
  console.log("New WebSocket connection");

  // (options, callback) vengono inviati dal front-end chat.js -> options è un oggetto che contiene username e room
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    // socket.join allows us to join a given chat room. And we pass through the name of the chat room
    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Benvenuto!"));
    // Nel caso in cui vogliamo lanciare un evento a tutte le connessioni tranne alla persona in questione usiamo socket.broadcast.emit() [in questo caso infatti tutti gli utenti verranno informati che una questa nuova persona è entrata nella chat, tranne la persona che è entrata]
    socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    // la callback serve per l'acknoledgeent che il messaggio è arrivato ed è tutto ok
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    );
    callback();
  });

  // Quando un utente si disconnette
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage("Admin", `${user.username} si è disconnesso.`));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
