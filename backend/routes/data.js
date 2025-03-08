const express= require("express");
const mongoose = require("mongoose");
const Data = require("../models/data");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const blackListToken= require("../models/blackListToken");
const Composant = require("../models/composant");
const Equipement = require("../models/equipement");
const Capteur = require("../models/capteur");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
const { authenticateUser, authorizeRole } = require("../controllers/token_role");

//Crud data


//ajout du data
router.post("/addData",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
    const { humidite, vibration, gaz, temperature ,poids , composant} = req.body;  // Extract fields from the request body
    try {
      // Vérifier si le composant existe
            const composantExiste = await Composant.findById(composant);
              if (!composantExiste) {
                  return res.status(404).json({ message: "composant non trouvé" });
              }

      const newData = new Data({ humidite, vibration, gaz, temperature ,poids , composant});
      await newData.save();  // Save the new item to MongoDB
      res.status(201).json(newData);  // Send back the newly created item
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la création du data" });
    }
  });

//récupérer data
router.get("/getData", authenticateUser, async (req, res) => {
    try { 
        // Récupérer les données avec les références peuplées
        const data = await Data.find()
        .populate({
            path: "composant",
            model: "Composant", // Assure-toi de spécifier le modèle ici
            select: "nom delaiExpi capteurs equipement", // Sélectionner les champs nécessaires
            populate: {
              path: "capteurs", // Peupler la liste des capteurs si nécessaire
              model: "Capteur",
              select: "type" // Sélectionner les champs que tu veux pour les capteurs
            },
            populate: {
                path: "equipement", // Peupler la liste des capteurs si nécessaire
                model: "Equipement",
                select: "nom" // Sélectionner les champs que tu veux pour les capteurs
              }
          })
        .lean(); // Utilisation de lean() pour une réponse plus rapide et facile à déboguer
        console.log("data", data);
      res.status(200).json(data);  // Envoyer les données avec les informations peuplées
    } catch (err) {
      console.error("Erreur lors de la récupération des données :", err);
      res.status(500).json({ message: "Erreur lors de la récupération des données" });
    }
  });

//modifier data
router.put("/updateData/:id",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params;  // Get the item ID from the URL parameter
  const { humidite, vibration, gaz, temperature ,poids , composant} = req.body;  // Get updated data from request body

  try {
    const updatedData = await Data.findByIdAndUpdate(
      id,  // Find the item by its ID
      { humidite, vibration, gaz, temperature ,poids , composant},  // Update the fields
      { new: true }  // Return the updated document
    );

    if (!updatedData) {
      return res.status(404).json({ message: "not found" });
    }
    res.status(200).json(updatedData);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la modifcation du data" });
  }
});

module.exports = router;