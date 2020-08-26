// Inizializzazione connessione lato client con il websocket creato lato server
const socket = io();

// Qui siamo nel lato client. Dobbiamo accettare il contatore websocket creato latoserver e ricevere/inviare dati con socket.io
socket.on("countUpdated", count => {
  console.log("The count has been updated!", count);
});

document.querySelector("#increment").addEventListener("click", () => {
  console.log("clicked");
  socket.emit("increment");
});
