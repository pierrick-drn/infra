require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

// Routes API
app.use('/api/users', userRoutes);

// 👉 Sert les fichiers statiques (HTML, CSS, JS)
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// 👉 Fallback toutes routes vers index.html (pour SPA ou frontend pur)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
