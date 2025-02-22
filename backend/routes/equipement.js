const express= require("express");
const Equipement = require("../models/equipement");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
//fonction pour gérer les roles et la connexion
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization") || req.header("authorization");
  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    req.user = decoded; // Attach user data to the request
    next();
  } catch (error) {
    res.status(400).json({ message: "Token invalide." });
  }
};
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    next();
  };
};
module.exports = { authenticateUser, authorizeRole };

//Crud equipement


//ajout d'un équipement
router.post("/addEquipement",/*authenticateUser,authorizeRole("Administrateur"),*/ async (req, res) => {
    const { nom, description, numSerie, dateAchat, etat, localisation } = req.body;  // Extract fields from the request body
    console.log(req.body);
    try {
      const newEquipement = new Equipement({ nom, description, numSerie, dateAchat, etat, localisation });
      await newEquipement.save();  // Save the new item to MongoDB
      res.status(201).json(newEquipement);  // Send back the newly created item
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la création de l'équipement" });
    }
  });

//récupérer tous les équipemements
router.get("/getEquipement",authenticateUser, async (req, res) => {
    try {
      const equipement = await Equipement.find();  // Fetch all items from the MongoDB collection
      res.status(200).json(equipement);      // Send back the list of items
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des éléments" });
      console.log("l'équipement est",res);
    }
  });

//supprimer un équipement
router.delete("/deleteEquipement/:id", async (req, res) => {
  const { id } = req.params; // Get the item ID from the URL parameter

  try {
    const deletedEquipement = await Equipement.findByIdAndDelete(id); // Find and delete the item
    if (!deletedEquipement) {
      return res.status(404).json({ message: "equipement non trouvé" });
    }

    res.status(200).json({ message: "equipement supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'equipement" });
  }
});
//modification de l'équipement
router.put("/updateEquipement/:id", async (req, res) => {
  const { id } = req.params;  // Get the item ID from the URL parameter
  const { nom, description, numSerie, dateAchat, etat, localisation } = req.body;  // Get updated data from request body

  try {
    const updatedEquipement = await Equipement.findByIdAndUpdate(
      id,  // Find the item by its ID
      { nom, description, numSerie, dateAchat, etat, localisation },  // Update the fields
      { new: true }  // Return the updated document
    );

    if (!updatedEquipement) {
      return res.status(404).json({ message: "not found" });
    }
    res.status(200).json(updatedEquipement);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création de l'équipement" });
  }
});

module.exports = router;