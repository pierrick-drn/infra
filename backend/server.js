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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenue sur mon API 😎');
});

// 👉 Sert le frontend si tu as un dossier public/
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
