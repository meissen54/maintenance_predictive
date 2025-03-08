const mongoose = require("mongoose");

const CapteurSchema = new mongoose.Schema({
  type: { type: String,enum: ['humidité', 'température', 'vibration','gaz','poids'], required: true }, // Type de capteur (ex: température, pression, humidité...)
  description: { type: String },
  numSerie: { type: String, required: true, unique: true }, // Numéro de série unique
  dateInstallation: { type: Date, required: true }, // Date d'installation du capteur
  composant: { type: mongoose.Schema.Types.ObjectId, ref: "composant", required: true }, 
}, { timestamps: true });

module.exports = mongoose.model("Capteur", CapteurSchema);
