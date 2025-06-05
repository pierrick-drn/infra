const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  titre: String,
  date: String,
  type: String
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  schedule: [String],
  events: [EventSchema]
});

module.exports = mongoose.model('User', UserSchema);
