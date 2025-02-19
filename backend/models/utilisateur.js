const mongoose = require("mongoose");

const UtilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  tel: { type: String, required: true },
  DateNaissance: { type: Date, required: true },
  type_utilisateur: { type: String, enum: ['Technicien', 'Administrateur'], required: true },
  motDePasse: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Utilisateur", UtilisateurSchema);