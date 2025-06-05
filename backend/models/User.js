const mongoose = require('mongoose');

// Schéma des événements
const EventSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true }
});

// Schéma des utilisateurs
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  schedule: [{ type: String }],
  events: [EventSchema]
});

// Export du modèle
module.exports = mongoose.model('User', UserSchema);
