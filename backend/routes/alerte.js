const express= require("express");
const mongoose = require("mongoose");
const Data = require("../models/data");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const blackListToken= require("../models/blackListToken");
const Composant = require("../models/composant");
const Alert = require("../models/alerte");
const Capteur = require("../models/capteur");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
const { authenticateUser, authorizeRole } = require("../controllers/token_role");

//Crud alert


//ajout d'une alerte
router.post("/addAlert",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
    const { panne, solution, composant,etat} = req.body;  // Extract fields from the request body
    try {
      // Vérifier si le composant existe
            const composantExiste = await Composant.findById(composant);
              if (!composantExiste) {
                  return res.status(404).json({ message: "composant non trouvé" });
              }

      const newAlert = new Alert({ panne, solution, composant,etat});
      await newAlert.save();  // Save the new item to MongoDB
      res.status(201).json(newAlert);  // Send back the newly created item
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de l'ajout de l'alert" });
    }
  });

//récupérer alerte
router.get("/getAlert", authenticateUser, async (req, res) => {
    try { 
        // Récupérer les données avec les références peuplées
        const alert = await Alert.find();
      res.status(200).json(alert);  // Envoyer les données avec les informations peuplées
    } catch (err) {
      console.error("Erreur lors de la récupération des alertes :", err);
      res.status(500).json({ message: "Erreur lors de la récupération des alertes" });
    }
  });


module.exports = router;