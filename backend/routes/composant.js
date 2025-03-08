const express= require("express");
const mongoose = require("mongoose");
const Composant = require("../models/composant");
const Equipement = require("../models/equipement");
const Depart = require("../models/depart");
const Capteur = require("../models/capteur");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const blackListToken= require("../models/blackListToken");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
const { authenticateUser, authorizeRole } = require("../controllers/token_role");

//Crud composant


//ajout d'un composant
router.post("/addComposant",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
    const { nom, description, numSerieComposant, dateInstallation, etat, type, departement, equipement ,capteurs, fabricant, delaiExpi} = req.body;  // Extract fields from the request body
    try {
        
      // Vérifier si l'équipement existe
      const equipementExiste = await Equipement.findById(equipement);
        if (!equipementExiste) {
            return res.status(404).json({ message: "Équipement non trouvé" });
        }

        // Vérifier si le département existe et correspond à l'équipement
        const departementExiste = await Depart.findById(departement);
        if (!departementExiste) {
            return res.status(404).json({ message: "Département non trouvé" });
        }

        // Vérifier si l'équipement et le département sont compatibles
        if (String(equipementExiste.departement) !== String(departement)) {
            return res.status(400).json({ message: "L'équipement et le département ne sont pas compatibles" });
        }

      // Vérifier si les capteurs existent
      const capteursExistants = await Capteur.find({ _id: { $in: capteurs } });
        if (capteursExistants.length !== capteurs.length) {
            return res.status(404).json({ message: "Un ou plusieurs capteurs sont introuvables" });
        }

      //créer le nouveau composant
      const newComposant = new Composant({ nom, description, numSerieComposant, dateInstallation, etat, type,  departement, equipement,capteurs, fabricant, delaiExpi} );

      // Enregistrer le composant afin de pouvoir récupérer l'objet sauvegardé
      const savedComposant = await newComposant.save();
    
      // Ajouter l'ID du composant à la liste des composants de l'équipement correspondant
      await Equipement.findByIdAndUpdate(equipement, { 
        $push: { composants: savedComposant._id } 
      });

      res.status(201).json(newComposant);  // Send back the newly created item
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la création du composant" });
      console.error(err);
    }
  });

//récupérer tous les composants
router.get("/getComposant",authenticateUser, async (req, res) => {
    try {
        const composant = await Composant.find()
        .populate([
          {
            path: "equipement",
            model: "Equipement",
            select: "nom"
          },
          {
            path: "capteurs",
            model: "Capteur",
            select: "type"
          },
          {
            path: "departement",
            model: "Depart",
            select: "nom"
          }
        ])
        .lean(); // Pour améliorer la performance
      res.status(200).json(composant);      // Send back the list of items
    } catch (err) {
        console.error("l'erreur est",err);
      res.status(500).json({ message: "Erreur lors de la récupération des composants" });
    }
  });

//récupérer un composant par l'id
router.get("/getComposantByID/:id",authenticateUser,  async (req, res) => {
    try {
      // Vérifier si l'ID est valide avant la requête
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "ID invalide" });
      }
  
      // Chercher l'élément dans la base de données
      const composant = await Composant.findById(req.params.id);
  
      if (!composant) {
        return res.status(404).json({ message: "composant non trouvé" });
      }
  
      res.status(200).json(composant);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de l'appel du composant" });
    }
  });

//supprimer un composant
router.delete("/deleteComposant/:id", authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
    const { id } = req.params; // Récupérer l'ID du composant
  
    try {
      // Vérifier si le composant existe avant de tenter de le supprimer
      const deletedComposant = await Composant.findByIdAndDelete(id);
      if (!deletedComposant) {
        return res.status(404).json({ message: "Composant introuvable" });
      }
  
      // Supprimer la référence du composant dans l'équipement associé
      if (deletedComposant.equipement) {
        await Equipement.findByIdAndUpdate(
          deletedComposant.equipement, 
          { $pull: { composants: id } }, // Vérifier que "composants" est bien un tableau d'IDs dans Equipement
          { new: true }
        );
      }
  
      res.status(200).json({ message: "Composant supprimé avec succès" });
  
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      res.status(500).json({ message: "Erreur lors de la suppression du composant" });
    }
  });
  

//modification du composant
router.put("/updateComposant/:id",authenticateUser, async (req, res) => {
  const { id } = req.params;  // Get the item ID from the URL parameter
  const { nom, description, numSerieComposant, dateInstallation, etat, type, departement, equipement ,capteurs, fabricant, delaiExpi} = req.body;  // Get updated data from request body

  try {
    const updatedComposant = await Composant.findByIdAndUpdate(
      id,  // Find the item by its ID
      { nom, description, numSerieComposant, dateInstallation, etat, type, departement, equipement ,capteurs, fabricant, delaiExpi},  // Update the fields
      { new: true }  // Return the updated document
    );

    if (!updatedComposant) {
      return res.status(404).json({ message: "not found" });
    }
    res.status(200).json(updatedComposant);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création du composant" });
  }
});

//get composant by type
router.get("/getComposantBytype/:type",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
    try {
      const {type}=req.params;
      // Chercher l'élément dans la base de données
      const composants = await Composant.find({type});

      if (composants.length === 0) {
        return res.status(404).json({ message: "Aucun composant trouvé pour ce type" });
    }

    res.status(200).json(composants);
  
    } catch (err) {
        console.error("Erreur lors de la récupération des composants :", err);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

//get composant by equipement
router.get("/getComposantByequipement/:equipement",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
  try {
    const {equipement}=req.params;
    // Chercher l'élément dans la base de données
    const composants = await Composant.find({equipement});

    if (composants.length === 0) {
      return res.status(404).json({ message: "Aucun composant trouvé pour ce type" });
  }

  res.status(200).json(composants);

  } catch (err) {
      console.error("Erreur lors de la récupération des composants :", err);
      res.status(500).json({ message: "Erreur interne du serveur" });
  }
});


module.exports = router;