require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('../backend/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
