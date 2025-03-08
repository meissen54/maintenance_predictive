const express= require("express");
const mongoose = require("mongoose");
const Capteur = require("../models/capteur");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const blackListToken= require("../models/blackListToken");
const Composant = require("../models/composant");
const Equipement = require("../models/equipement");
const Depart = require("../models/depart");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
const { authenticateUser, authorizeRole } = require("../controllers/token_role");

//Crud capteur


//ajout d'un capteur
router.post("/addCapteur",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
    const { type, description, numSerie, dateInstallation,composant} = req.body;  // Extract fields from the request body
    try {
      // Vérifier si le composant existe
            const composantExiste = await Composant.findById(composant);
              if (!composantExiste) {
                  return res.status(404).json({ message: "composant non trouvé" });
              }
      const newCapteur = new Capteur({ type, description, numSerie, dateInstallation,composant});

      // Enregistrer le composant afin de pouvoir récupérer l'objet sauvegardé
        const savedCapteur = await newCapteur.save();
          
      // Ajouter l'ID du composant à la liste des composants de l'équipement correspondant
        await Composant.findByIdAndUpdate(composant, { 
              $push: { capteurs: savedCapteur._id } 
            });

      res.status(201).json(newCapteur);  // Send back the newly created item
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la création du capteur" });
    }
  });

//récupérer tous les capteurs
router.get("/getCapteur",authenticateUser, async (req, res) => {
    try {
      const capteur = await Capteur.find()  // Fetch all items from the MongoDB collection
      .populate({
        path: "composant",
        model: "Composant", // Assure-toi de spécifier le modèle ici
        select: "nom equipement departement", // Sélectionner les champs nécessaires
        populate: [
          {
            path: "departement", // Peupler le champ "departement"
            model: "Depart",
            select: "nom" // Sélectionner les champs que tu veux pour le département
          },
          {
            path: "equipement", // Peupler le champ "equipement"
            model: "Equipement",
            select: "nom" // Sélectionner les champs que tu veux pour l'équipement
          }
        ]
      })
      .lean(); // Utilisation de lean() pour des réponses plus rapides et faciles à déboguer
      res.status(200).json(capteur);      // Send back the list of items
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des capteurs" });
    }
  });

//récupérer un capteur par l'id
router.get("/getCapteurByID/:id",authenticateUser, async (req, res) => {
    try {
      // Vérifier si l'ID est valide avant la requête
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "ID invalide" });
      }
  
      // Chercher l'élément dans la base de données
      const capteur = await Capteur.findById(req.params.id);
  
      if (!capteur) {
        return res.status(404).json({ message: "capteur non trouvé" });
      }
  
      res.status(200).json(capteur);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de l'appel  du capteur" });
    }
  });

//supprimer un capteur
router.delete("/deleteCapteur/:id",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params; // Get the item ID from the URL parameter

  try {
    const deletedCapteur = await Capteur.findByIdAndDelete(id); // Find and delete the item
    if (!deletedCapteur) {
      return res.status(404).json({ message: "capteur non trouvé" });
    }

    res.status(200).json({ message: "capteur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du capteur" });
  }
});

//modification du capteur
router.put("/updateCapteur/:id",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params;  // Get the item ID from the URL parameter
  const { type, description, numSerie, dateInstallation,composant} = req.body;  // Get updated data from request body

  try {
    const updatedCapteur = await Capteur.findByIdAndUpdate(
      id,  // Find the item by its ID
      { type, description, numSerie, dateInstallation,composant},  // Update the fields
      { new: true }  // Return the updated document
    );

    if (!updatedCapteur) {
      return res.status(404).json({ message: "not found" });
    }
    res.status(200).json(updatedCapteur);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création du capteur" });
  }
});

//récupérer les capteurs par l'id de leur composant 
router.get("/getCapteursByComposant/:composant", authenticateUser, async (req, res) => {
    try {
        const { composant } = req.params;

        // Vérifier si l'ID du composant est valide
        if (!mongoose.Types.ObjectId.isValid(composant)) {
            return res.status(400).json({ message: "ID du composant invalide" });
        }

        // Trouver tous les capteurs ayant ce composant
        const capteurs = await Capteur.find({ composant });

        if (!capteurs || capteurs.length === 0) {
            return res.status(404).json({ message: "Aucun capteur trouvé pour ce composant" });
        }

        res.status(200).json(capteurs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la récupération des capteurs" });
    }
});


module.exports = router;