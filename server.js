require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./backend/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Désactive le buffering Mongoose
mongoose.set('bufferCommands', false);

// Middleware
app.use(cors());
app.use(express.json());

// Log de l'URI utilisée
console.log("🔌 Tentative de connexion MongoDB à :", process.env.MONGODB_URI);

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000 // timeout explicite
})
  .then(() => console.log('✅ MongoDB connecté avec succès'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// Routes API
app.use('/api/users', (req, res, next) => {
  console.log(`📡 [${req.method}] ${req.originalUrl}`);
  next();
}, userRoutes);

// Fichiers statiques (frontend)
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
