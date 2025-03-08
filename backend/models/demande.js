const mongoose = require("mongoose");

const DemandeSchema = new mongoose.Schema({
  demandeur:{ type: mongoose.Schema.Types.ObjectId, ref: "utilisateur" ,required:true},
  raison: { type: String, required:true },
  statut: { type: String, enum: ['approuvé','décliné','en cours de traitemant'], required: true },
  timestamp: { type: Date, default: Date.now } 
});

module.exports = mongoose.model("Demande", DemandeSchema);