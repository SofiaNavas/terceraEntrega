const {Schema, model} = require('mongoose')


const sessionsUserSchema = Schema({

  name: String,
  lastname: String,
  email: {
    type: String,
    unique: true
},
username: {
  type: String,
  unique: true
},
  age: Number,
  password: String,
  admin: {
    type: Boolean,
    default: false 
  },
  createdAt: Date
});



module.exports = model('users', sessionsUserSchema)