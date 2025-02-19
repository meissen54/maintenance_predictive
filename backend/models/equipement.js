const mongoose = require("mongoose");

const EquipementSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: true },
  numSerie: { type: String, required: true, unique: true },
  dateAchat: { type: Date, required: true },
  etat: { type: String, enum: ['en maintenance', 'disponible'], required: true },
  localisation: { type: String, required: true },
  dateAjout: {type: Date,default: Date.now}
}, { timestamps: true });

module.exports = mongoose.model("Equipement", EquipementSchema);