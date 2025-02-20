const express=require("express");
const mongoose =require("mongoose");
const cors=require("cors");
const jwt =require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//const Equipement = require("./models/equipement");
require("dotenv").config();
const utilisateurRoutes=require("./routes/utilisateur");
const equipementRoutes=require("./routes/equipement");

const app=express();
app.use(express.json());
app.use(cors());

//API utilisateur
app.use("/apiUtilisateur",utilisateurRoutes);
//API equipement
app.use("/apiEquipement",equipementRoutes);

const SECRET_KEY = process.env.JWT_SECRET || 'monSuperSecret';
module.exports = app;


// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));



//connexion au serveur
app.listen(4000, () => console.log("Serveur backend sur port 4000"));
