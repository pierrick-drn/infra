const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  res.json({ message: 'Connexion réussie', schedule: user.schedule });
};

exports.getAllSchedules = async (req, res) => {
  try {
    const users = await User.find({}, 'username schedule -_id'); // pas de password ni _id
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des plannings' });
  }
};
