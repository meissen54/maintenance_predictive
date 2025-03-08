const express= require("express");
const mongoose = require("mongoose");
const Equipement = require("../models/equipement");
const Composant = require("../models/composant");
const Depart=require("../models/depart");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const blackListToken= require("../models/blackListToken");
const { populate } = require("../models/utilisateur");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
const { authenticateUser, authorizeRole } = require("../controllers/token_role");
const depart = require("../models/depart");

//Crud equipement


//ajout d'un équipement
router.post("/addEquipement",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
    const { nom, description, numSerie, dateAchat, etat, departement, composants} = req.body;  // Extract fields from the request body
    try {
      const newEquipement = new Equipement({ nom, description, numSerie, dateAchat, etat, departement, composants });
      // Enregistrer le composant afin de pouvoir récupérer l'objet sauvegardé
          const savedEquipement = await newEquipement.save();
          
      // Ajouter l'ID du composant à la liste des composants de l'équipement correspondant
          await Depart.findByIdAndUpdate(departement, { 
              $push: { equipements: savedEquipement._id } 
            });
      res.status(201).json(newEquipement);  // Send back the newly created item
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la création de l'équipement" });
      console.error(err);
    }
  });

//récupérer tous les équipemements
router.get("/getEquipement",authenticateUser, async (req, res) => {
    try {
      const equipement = await Equipement.find() // Fetch all items from the MongoDB collection
      .populate([
        {
          path: "composants",
          model: "Composant",
          select: "nom capteurs",
          populate: {
            path: "capteurs",
            model: "Capteur",
            select: "nom type valeur" // Ajoute les champs que tu veux afficher pour chaque capteur
        }
        },
        {
          path: "departement",
          model: "Depart",
          select: "nom"
        }
      ])
      .lean(); // Pour améliorer la performance
      res.status(200).json(equipement);      // Send back the list of items
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des éléments" });
      console.log("l'équipement est",res);
    }
  });

//récupérer un équipement par l'id
router.get("/getEquipementByID/:id",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
    try {
      // Vérifier si l'ID est valide avant la requête
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "ID invalide" });
      }
  
      // Chercher l'élément dans la base de données
      const equipement = await Equipement.findById(req.params.id);
  
      if (!equipement) {
        return res.status(404).json({ message: "équipement non trouvé" });
      }
  
      res.status(200).json(equipement);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de l'appel  de l'équipement" });
    }
  });

//supprimer un équipement
router.delete("/deleteEquipement/:id",authenticateUser,authorizeRole("Administrateur"), async (req, res) => {
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
router.put("/updateEquipement/:id",authenticateUser, async (req, res) => {
  const { id } = req.params;  // Get the item ID from the URL parameter
  const { nom, description, numSerie, dateAchat, departement, composants } = req.body;  // Get updated data from request body

  try {
    const updatedEquipement = await Equipement.findByIdAndUpdate(
      id,  // Find the item by its ID
      { nom, description, numSerie, dateAchat, departement, composants },  // Update the fields
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

//modification de l'etat de l'equipement en fonctionnel
router.put("/updateEtatFonctionnel/:id", authenticateUser,authorizeRole("Technicien"), async (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'équipement depuis l'URL

  try {
    const updatedEquipement = await Equipement.findByIdAndUpdate(
      id, 
      { etat: "fonctionnel" }, // Mise à jour du champ 'etat'
      { new: true } // Retourner l'équipement mis à jour
    );

    if (!updatedEquipement) {
      return res.status(404).json({ message: "Équipement non trouvé" });
    }

    res.status(200).json({ message: "Équipement mis à jour avec succès", equipement: updatedEquipement });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'état de l'équipement :", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'équipement" });
  }
});

//modification de l'etat de l'equipement en en maintennace
router.put("/updateEtatMaintenance/:id", authenticateUser,authorizeRole("Technicien"), async (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'équipement depuis l'URL

  try {
    const updatedEquipement = await Equipement.findByIdAndUpdate(
      id, 
      { etat: "en maintenance" }, // Mise à jour du champ 'etat'
      { new: true } // Retourner l'équipement mis à jour
    );

    if (!updatedEquipement) {
      return res.status(404).json({ message: "Équipement non trouvé" });
    }

    res.status(200).json({ message: "Équipement mis à jour avec succès", equipement: updatedEquipement });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'état de l'équipement :", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'équipement" });
  }
});

//modification de l'etat de l'equipement en déféctueux
router.put("/updateEtatDefect/:id", authenticateUser,authorizeRole("Technicien"), async (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'équipement depuis l'URL

  try {
    const updatedEquipement = await Equipement.findByIdAndUpdate(
      id, 
      { etat: "déféctueux" }, // Mise à jour du champ 'etat'
      { new: true } // Retourner l'équipement mis à jour
    );

    if (!updatedEquipement) {
      return res.status(404).json({ message: "Équipement non trouvé" });
    }

    res.status(200).json({ message: "Équipement mis à jour avec succès", equipement: updatedEquipement });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'état de l'équipement :", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'équipement" });
  }
});

// Route pour récupérer les équipements par département
router.get('/getEquipementBydepart',  async (req, res) =>{
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format : "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ message: 'Token non fourni' });
  }

  try {
    // Vérifie la validité du token et extrait les informations du token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const departement = decoded.departement; // Récupère le département du token

    if (!departement) {
      return res.status(403).json({ message: 'Département manquant dans le token' });
    }

    // Ajoute le département à la requête pour pouvoir l'utiliser plus tard
    req.departement = departement;

    // Recherche les équipements associés à ce département
    const equipements = await Equipement.find({ departement: departement });

    if (!equipements || equipements.length === 0) {
      return res.status(404).json({ message: "Aucun équipement trouvé pour ce département" });
    }

    // Renvoie les équipements en réponse
    res.status(200).json(equipements);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des équipements', error: err.message });
  }
});

//update etat equipement selon composant
router.put('/equipementEtat/:id', async (req, res) => {
  try {
      const equipementId = req.params.id;
      console.log("id :",equipementId);
      // Récupérer tous les composants liés à cet équipement
      const composants = await Composant.find({ equipement: equipementId });

      console.log("Liste des composants 1:", composants);
      if (!composants) {
          return res.status(404).json({ message: 'Aucun composant trouvé pour cet équipement.' });
      }

      // Vérifier si un composant est défectueux
      let etatDefectueux = false;
      for (const composant of composants) {
          if (composant.etat === 'défectueux') {
              etatDefectueux = true;
              break;
          }

      }console.log(etatDefectueux);
      console.log("Liste des composants :", composants);

      // Déterminer le nouvel état de l'équipement avec if
      let nouvelEtat;
      if (etatDefectueux) {
          nouvelEtat = 'défectueux';
      } else {
          nouvelEtat = 'fonctionnel';
      }
      console.log(nouvelEtat);
      // Mettre à jour l'équipement
      await Equipement.findByIdAndUpdate(equipementId, { etat: nouvelEtat });

      res.json({ message: `L'état de l'équipement a été mis à jour en ${nouvelEtat}.` });

  } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipement:', error);
      res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;