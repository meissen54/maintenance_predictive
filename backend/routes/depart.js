const express= require("express");
const mongoose = require("mongoose");
const Departement = require("../models/depart");
const Equipement = require("../models/equipement");
const Composant = require("../models/composant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const blackListToken= require("../models/blackListToken");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
const { authenticateUser, authorizeRole } = require("../controllers/token_role");
const { populate } = require("../models/data");

//Crud département


//ajout d'un département
router.post("/addDepart",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
    const { nom, code,equipements } = req.body;  // Extract fields from the request body
    console.log(req.body);
    try {
      const newDepartement = new Departement({ nom, code ,equipements});
      await newDepartement.save();  // Save the new item to MongoDB
      res.status(201).json(newDepartement);  // Send back the newly created item
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la création du département" });
    }
  });

//récupérer tous les départements
router.get("/getDepart",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
    try {
      const departement = await Departement.find()
      .populate([
        {
            path: "equipements",
            model: "Equipement",
            select: "nom composants",
            populate: [
                {
                    path: "composants",
                    model: "Composant",
                    select: "nom type capteurs",
                    populate: {
                        path: "capteurs",
                        model: "Capteur",
                        select: "type valeur",
                    },
                },
            ],
        },
    ])
    .lean();

      res.status(200).json(departement);      // Send back the list of items
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des départements" });
      console.error(err);
    }
  });

//récupérer un département par l'id
router.get("/getDepartByID/:id",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
    try {
      // Vérifier si l'ID est valide avant la requête
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "ID invalide" });
      }
  
      // Chercher l'élément dans la base de données
      const departement = await Departement.findById(req.params.id);
  
      if (!departement) {
        return res.status(404).json({ message: "departement non trouvé" });
      }
  
      res.status(200).json(departement);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de l'appel  du département" });
    }
  });

//supprimer un département
router.delete("/deleteDepart/:id",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params; // Get the item ID from the URL parameter

  try {
    const deletedDepartement = await Departement.findByIdAndDelete(id); // Find and delete the item
    if (!deletedDepartement) {
      return res.status(404).json({ message: "département non trouvé" });
    }

    res.status(200).json({ message: "département supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du département" });
  }
});

//modification du département
router.put("/updateDepart/:id",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params;  // Get the item ID from the URL parameter
  const { nom, code, equipements } = req.body;  // Get updated data from request body

  try {
    const updatedDepartement = await Departement.findByIdAndUpdate(
      id,  // Find the item by its ID
      { nom, code, equipements},  // Update the fields
      { new: true }  // Return the updated document
    );

    if (!updatedDepartement) {
      return res.status(404).json({ message: "not found" });
    }
    res.status(200).json(updatedDepartement);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création du département" });
  }
});

module.exports = router;