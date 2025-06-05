const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titre: String,
  date: String,
  type: String
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  schedule: [String],
  events: [eventSchema]
});

module.exports = mongoose.model('User', userSchema);
