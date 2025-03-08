const express = require('express');
const router = express.Router();
const DemandeSup = require('../models/demande');
const Utilisateur = require('../models/utilisateur');
const { authenticateUser, authorizeRole } = require("../controllers/token_role");

// Route pour envoyer une demande
router.post("/addDemande", authenticateUser, async (req, res) => {
  const { raison } = req.body;  // Récupérer la raison de la demande

  try {
      // Vérifier que l'utilisateur est correctement extrait du token
      if (!req.utilisateur || !req.utilisateur.id) {
          return res.status(400).json({ message: "ID utilisateur manquant dans le token" });
      }

      // Créer une nouvelle demande avec l'ID du demandeur récupéré du token
      const nouvelleDemande = new DemandeSup({
          demandeur: req.utilisateur.id,  // Utilisation de l'ID utilisateur extrait du token
          raison,                          // Raison de la demande
          statut: 'en cours de traitemant'        
      });

      // Sauvegarder la demande dans la base de données
      await nouvelleDemande.save();

      // Retourner la demande créée avec succès
      res.status(201).json({ message: "Demande créée avec succès", demande: nouvelleDemande });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur lors de la création de la demande" });
  }
});


//get
  router.get("/get",authenticateUser, authorizeRole("Administrateur"),async (req, res) => {
      try {
        const demandes = await DemandeSup.find() ; // Pour améliorer la performance
        res.status(200).json(demandes);      // Send back the list of items
      } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des éléments" });
      }
    });
  
  module.exports = router;  
