const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  name: String,
  socketId: String,
  messages: [{
    username: String, // Agregar el nombre del usuario que envió el mensaje
    message: String
  }],
  
});

const ChatModel = mongoose.model('messages', chatSchema);

module.exports = ChatModel;

