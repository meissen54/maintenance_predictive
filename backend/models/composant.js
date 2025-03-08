const mongoose = require("mongoose");

const ComposantSchema = new mongoose.Schema({
  nom: { type: String, required: true }, // Nom du composant
  description: { type: String, required: true }, // Brève description
  numSerieComposant: { type: String, unique: true }, 
  dateInstallation: { type: Date, required: true }, // Date d'installation du composant
  etat: { type: String, enum: ['fonctionnel', 'défectueux', 'en maintenance'], required: true }, // État du composant
  type: { type: String, enum: ['matériel', 'médicamment'], required: true }, 
  departement: { type: mongoose.Schema.Types.ObjectId, ref: "depart", required: true },
  equipement: { type: mongoose.Schema.Types.ObjectId, ref: "equipement", required: true },
  capteurs: [{ type: mongoose.Schema.Types.ObjectId, ref: "capteur"/*,unique:true*/ }],
  fabricant: { type: String, required:true }, 
  delaiExpi:{type: Date, required:true},
  dateAjout: { type: Date, default: Date.now } // Date d'ajout dans la base
}, { timestamps: true });

module.exports = mongoose.model("Composant", ComposantSchema);
