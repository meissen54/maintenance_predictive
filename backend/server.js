const express=require("express");
const mongoose =require("mongoose");
const cors=require("cors");
const jwt =require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//const Equipement = require("./models/equipement");
require("dotenv").config();
const utilisateurRoutes=require("./routes/utilisateur");
const equipementRoutes=require("./routes/equipement");
const departRoutes=require("./routes/depart");
const capteurRoutes=require("./routes/capteur");
const composantRoutes=require("./routes/composant");
const dataRoutes=require("./routes/data");
const alerteRoutes=require("./routes/alerte");
const repoRoutes=require("./routes/repo");
const demandeRoutes=require("./routes/demande");


const app=express();
app.use(express.json());
app.use(cors());

//API

//API utilisateur
app.use("/apiUtilisateur",utilisateurRoutes);
//API equipement
app.use("/apiEquipement",equipementRoutes);
//API département
app.use("/apiDepart",departRoutes);
//API capteur
app.use("/apiCapteur",capteurRoutes);
//API composant
app.use("/apiComposant",composantRoutes);
//API data
app.use("/apiData",dataRoutes);
//API alerte
app.use("/apiAlerte",alerteRoutes);
//API repo
app.use("/apiRepo",repoRoutes);
//API demande
app.use("/apiDemande",demandeRoutes);


const SECRET_KEY = process.env.JWT_SECRET || 'monSuperSecret';
module.exports = app;


// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));



//connexion au serveur
app.listen(4000, () => console.log("Serveur backend sur port 4000"));
