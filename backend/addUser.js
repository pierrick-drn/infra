require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connecté à MongoDB");

    await User.deleteMany({});
    console.log("🧹 Utilisateurs précédents supprimés");

    const usersData = [
      { username: "pierrick", password: "pierrick123", schedule: ["Lundi : 9h-17h", "Mardi : 9h-17h", "Mercredi : 9h-17h", "Jeudi : 9h-17h", "Vendredi : 9h-17h"] },
      { username: "alex", password: "alex123", schedule: ["Lundi : 8h-16h", "Mardi : 8h-16h", "Mercredi : 8h-16h", "Jeudi : 8h-16h", "Vendredi : 8h-16h"] },
      { username: "remi", password: "remi123", schedule: ["Lundi : 10h-18h", "Mardi : 10h-18h", "Mercredi : 10h-18h", "Jeudi : 10h-18h", "Vendredi : 10h-18h"] },
      { username: "laurent", password: "laurent123", schedule: ["Lundi : 9h-12h", "Mardi : 14h-18h", "Mercredi : 9h-12h", "Jeudi : 14h-18h", "Vendredi : 9h-12h"] },
      { username: "jules", password: "jules123", schedule: ["Lundi : 13h-17h", "Mardi : 13h-17h", "Mercredi : 13h-17h", "Jeudi : 13h-17h", "Vendredi : 13h-17h"] },
      { username: "admin", password: "admin123", schedule: ["Admin : Tous les jours 9h-18h"] }
    ];

    // On les sauvegarde un par un pour que le hash fonctionne
    for (const data of usersData) {
      const user = new User(data);
      await user.save();
    }

    console.log("✅ Utilisateurs insérés avec succès (mot de passe hashé)");
    process.exit();
  })
  .catch(err => console.error("❌ Erreur MongoDB :", err));
