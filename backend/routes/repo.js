const express= require("express");
const mongoose = require("mongoose");
const Data = require("../models/data");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const blackListToken= require("../models/blackListToken");
const Utilisateur = require("../models/utilisateur");
const Equipement = require("../models/equipement");
const Capteur = require("../models/capteur");
const Composant = require("../models/composant");
const Alerte = require("../models/alerte");
const Repo = require("../models/repo");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
const { authenticateUser, authorizeRole } = require("../controllers/token_role");

//Crud repo


// Route pour importer tous les IDs des modèles dans Repo
router.post("/importToRepo", async (req, res) => {
    try {
      // Récupérer tous les ObjectIds des documents dans chaque collection
      const composantsIds = await Composant.find().distinct('_id');
      const equipementsIds = await Equipement.find().distinct('_id');
      const capteursIds = await Capteur.find().distinct('_id');
      const alertesIds = await Alerte.find().distinct('_id');
      const utilisateursIds = await Utilisateur.find().distinct('_id');
  
      // Créer un nouvel objet Repo avec tous les IDs des collections
      const newRepo = new Repo({
        composant: composantsIds,  // Remplir le champ 'composant' avec tous les ObjectIds de la collection Composant
        equipement: equipementsIds,  // Remplir le champ 'equipement' avec tous les ObjectIds de la collection Equipement
        capteurs: capteursIds,  // Remplir le champ 'capteurs' avec tous les ObjectIds de la collection Capteur
        alertes: alertesIds,  // Remplir le champ 'alertes' avec tous les ObjectIds de la collection Alerte
        utilisateurs: utilisateursIds  // Remplir le champ 'utilisateurs' avec tous les ObjectIds de la collection Utilisateur
      });
  
      // Sauvegarder le nouveau Repo dans la base de données
      await newRepo.save();
  
      // Répondre avec le Repo créé
      res.status(201).json(newRepo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur lors de l'importation des IDs dans le Repo" });
    }
  });

//récupérer repo
router.get("/getRepo", authenticateUser, async (req, res) => {
    try {
        // Extraction des dates de début et de fin à partir des paramètres de requête
        const { startDate, endDate } = req.query;

        // Vérification de la validité des dates fournies
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Veuillez fournir un intervalle de temps valide (startDate et endDate)." });
        }

        // Conversion en objets Date
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Format de date invalide." });
        }

        // Trouver les composants dont `dateAjout` est dans l’intervalle
        const composantsFiltrés = await Composant.find({ dateAjout: { $gte: start, $lte: end } });
        //Trouver les equipements dont `dateAjout` est dans l’intervalle
        const equipementsFiltrés = await Equipement.find({ dateAjout: { $gte: start, $lte: end } });
        //Trouver les capteurs dont `dateInstallation` est dans l’intervalle
        const capteursFiltrés = await Capteur.find({ dateInstallation: { $gte: start, $lte: end } });
        //Trouver les alertes dont `dateInstallation` est dans l’intervalle
        const alertesFiltrés = await Alerte.find({ dateAjout: { $gte: start, $lte: end } });
        //Trouver les utilisateurs dont `dateAjout` est dans l’intervalle
        const utilisateursFiltrés = await Utilisateur.find({ createdAt: { $gte: start, $lte: end } });

        const repo=["get composants:",composantsFiltrés,"get equipement",equipementsFiltrés,"get capteurs",capteursFiltrés,"get alertes",alertesFiltrés,"get utilisateurs",utilisateursFiltrés];
      res.status(200).json({ repo });

    } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        res.status(500).json({ message: "Erreur interne du serveur lors de la récupération des données." });
    }
});

//récupérer tous les départements
router.get("/getR", async (req, res) => {
    try {
      const repo = await Repo.find();  // Fetch all items from the MongoDB collection
      res.status(200).json(repo);      // Send back the list of items
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des départements" });
    }
  });



module.exports = router;