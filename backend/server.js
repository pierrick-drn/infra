require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

// Routes API
app.use('/api/users', userRoutes);

// Route GET / (simple réponse texte, utile si pas de frontend)
app.get('/', (req, res) => {
  res.send('Bienvenue sur mon API 😎');
});

// 👉 Dossier frontend statique personnalisé (remplace "frontend" par le nom réel)
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// Pour toutes les autres routes, servir index.html (frontend SPA ou fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
