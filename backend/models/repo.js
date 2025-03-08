const mongoose = require("mongoose");

const RepoSchema = new mongoose.Schema({
  composant:[{ type: mongoose.Schema.Types.ObjectId, ref: "composant" }],
  equipement:[{ type: mongoose.Schema.Types.ObjectId, ref: "equipement" }],
  capteurs:[{ type: mongoose.Schema.Types.ObjectId, ref: "capteur" }],
  alertes:[{ type: mongoose.Schema.Types.ObjectId, ref: "alerte" }],
  utilisateurs:[{ type: mongoose.Schema.Types.ObjectId, ref: "utilisateur" }],
  timestamp: { type: Date, default: Date.now } 
});

module.exports = mongoose.model("Repo", RepoSchema);