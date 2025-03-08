const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  humidite: { type: Number},
  vibration: { type: Number },
  gaz: { type: Number },
  temperature: { type: Number },
  poids: { type: Number },
  composant:{ type: mongoose.Schema.Types.ObjectId, ref: "composant" , required: true},
  dateAjout: { type: Date, default: Date.now } ,
  timestamp: { type: Date, default: Date.now } 
});

module.exports = mongoose.model("Data", DataSchema);