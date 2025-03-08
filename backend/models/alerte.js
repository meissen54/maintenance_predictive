const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  panne: { type: String },
  Solution:{ type:String},
  composant:{ type: mongoose.Schema.Types.ObjectId, ref: "composant" },
  dateAjout: { type: Date, default: Date.now } ,
  etat: { type: String, enum: ['fonctionnel', 'défectueux', 'en maintenance'], required: true },
  timestamp: { type: Date, default: Date.now } 
});

module.exports = mongoose.model("Alert", AlertSchema);