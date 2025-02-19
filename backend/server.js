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


//les Crud du projet


//CRUD equipement
/*
//ajout d'un équipement
app.post("/addEquipement", async (req, res) => {
  const { nom, description, numSerie, dateAchat, etat, localisation } = req.body;  // Extract fields from the request body

  try {
    const newEquipement = new Equipement({ nom, description, numSerie, dateAchat, etat, localisation });
    await newEquipement.save();  // Save the new item to MongoDB
    res.status(201).json(newEquipement);  // Send back the newly created item
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création de l'équipement" });
  }
});

//récupérer tous les équipemements
app.get("/getEquipement", async (req, res) => {
  try {
    const equipement = await Equipement.find();  // Fetch all items from the MongoDB collection
    res.status(200).json(equipement);      // Send back the list of items
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des éléments" });
  }
});
*/


//connexion au serveur
app.listen(4000, () => console.log("Serveur backend sur port 4000"));
