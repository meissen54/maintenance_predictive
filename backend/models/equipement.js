const mongoose = require("mongoose");

const EquipementSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: true },
  numSerie: { type: String, required: true, unique: true },
  dateAchat: { type: Date, required: true },
  etat: { type: String, enum: ['fonctionnel', 'défectueux', 'en maintenance'], required: true },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: "depart", required: true },
  composants:[{ type: mongoose.Schema.Types.ObjectId, ref: "composant" , required: true}],
  dateAjout: {type: Date,default: Date.now}
}, { timestamps: true });

module.exports = mongoose.model("Equipement", EquipementSchema);