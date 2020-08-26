// Keeping track of our users
const users = [];

// addUsers, removeUser, getUser, getUsersInRoom. Ogni connessione socket ha un proprio id unico

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: "Nome utente e stanza sono richiesti!",
    };
  }

  //   Check for existing username in the chat
  const existingUser = users.find(user => user.room === room && user.username === username);

  //   Validate username
  if (existingUser) {
    return {
      error: "Il nome utente è già in uso",
    };
  }

  //   Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = room => users.filter(user => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
