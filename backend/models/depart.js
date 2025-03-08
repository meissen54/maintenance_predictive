const mongoose = require("mongoose");

const DepartSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique:true },
  code: { type: String, required: true },
  equipements:[{ type: mongoose.Schema.Types.ObjectId, ref: "equipement" }],
  timestamp: { type: Date, default: Date.now } 
});

module.exports = mongoose.model("Depart", DepartSchema);