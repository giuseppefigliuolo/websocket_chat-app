// Inizializzazione connessione lato client con il websocket creato lato server
const socket = io();

// DOM elements -> dollar sign per indicare che si tratta di elementi del dom
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const sendLocationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options. ignoreQueryPrefix: true elimina dalla query dell'url i punti interrogativi o cose che a noi non servono
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
const autoscroll = () => {
  // New message element - last message sent
  const $newMessage = $messages.lastElementChild;

  // Height of last message ($newMessage) (offsetHeight prende l'altezza ma senza margini)
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  // to check if we're at the bottom of the scrolling chat
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", data => {
  const html = Mustache.render(messageTemplate, {
    // ecco cosa vogliamo renderizzare a schermo. Scriviamo solo message perchè equivale a scrivere (shorthand syntax): {message: message}
    username: data.username,
    message: data.text,
    createdAt: moment(data.createdAt).format("H:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", data => {
  const html = Mustache.render(sendLocationTemplate, {
    username: data.username,
    location: data.url,
    createdAt: moment(location.createdAt).format("H:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", evt => {
  evt.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");
  // Disable button

  // elements.message è per arrivare alle proprietà dell'elemento html dove message è il name="message" che gli abbiamo dato nell'index.html
  const message = evt.target.elements.message.value;
  socket.emit("sendMessage", message, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    // Enable button
    if (error) {
      return console.log(error);
    }
    console.log("Delivered!");
  });
});

// Client-side JS for geo-location
$sendLocationButton.addEventListener("click", evt => {
  $sendLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  // questo api per la geolocalizzazione non supporta await e le promise, quindi vanno usate callback come in questo caso
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    // Nel caso ci fosse un errore così facendo reindirizziamo l'utente alla root '/' del nostro sito
    location.href = "/";
  }
});
