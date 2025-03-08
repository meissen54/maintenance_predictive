const express= require("express");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
require('dotenv').config();
const Utilisateur = require("../models/utilisateur");
const Depart = require("../models/depart");
const DemandeSup = require("../models/demande");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const blackListToken= require("../models/blackListToken");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";
const { authenticateUser, authorizeRole } = require("../controllers/token_role");
const {validatePassword}=require("../controllers/password")

//Crud utilisateurs

//récupérer les utilisateurs depuis la base de données
router.get("/getUtilisateur",authenticateUser, authorizeRole("Administrateur"),async (req, res) => {
    try {
      const utilisateurs = await Utilisateur.find()  // Fetch all items from the MongoDB collection
      .populate([
        {
          path: "departement",
          model: "Depart",
          select: "nom"
        }
      ])
      .lean(); // Pour améliorer la performance
      res.status(200).json(utilisateurs);      // Send back the list of items
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des éléments" });
    }
  });

//inscription
router.post("/register",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
    try {
    const { nom, prenom, tel, DateNaissance, type_utilisateur, email, motDePasse,departement } = req.body;  
    // Vérifier si un utilisateur a déjà ce département
    const utilisateurExist = await Utilisateur.findOne({ departement });

    if (utilisateurExist) {
        return res.status(400).json({ message: 'Ce département est déjà attribué à un autre utilisateur.' });
    }
    // Vérifier le type d'utilisateur
    if (type_utilisateur !== 'Technicien') {
      return res.status(403).json({ message: 'Accès refusé. vous ne pouvez créer de compte que pour les techniciens.' });
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      let utilisateur = await Utilisateur.findOne({ email });
      if (utilisateur) return res.status(400).json({ message: "Cet email est déjà utilisé !" });
    // Vérification de la robustesse du mot de passe
    const passwordValidation = validatePassword(motDePasse);
    if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
    }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(motDePasse, salt);
  
      utilisateur = new Utilisateur({ nom, prenom, tel, DateNaissance, type_utilisateur, email,departement, motDePasse: hashedPassword });
      await utilisateur.save();
  
      res.status(201).json({ message: "Inscription réussie !" });
        } catch (error) {
          res.status(500).json({ message: "Erreur serveur", error });
          console.error(error);
        }
      });


//récupérer un utilisateur par l'id
router.get("/getUserByID/:id",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
    try {
      // Vérifier si l'ID est valide avant la requête
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "ID invalide" });
      }
  
      // Chercher l'élément dans la base de données
      const utilisateur = await Utilisateur.findById(req.params.id);
  
      if (!utilisateur) {
        return res.status(404).json({ message: "Élément non trouvé" });
      }
  
      res.status(200).json(utilisateur);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de l'appel  de l'élément" });
    }
  });

//login
router.post('/login', async (req, res) => {
    const { nom, prenom, tel, DateNaissance, type_utilisateur, email, motDePasse ,departement} = req.body;
  
    try {
      
      // Vérifier si l'utilisateur existe
      const utilisateur = await Utilisateur.findOne({ email });
      if (!utilisateur) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  
      // Vérifier le mot de passe
      const passwordMatch = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  
      // Générer un token JWT
      const token = jwt.sign({ id: utilisateur._id, email: utilisateur.email ,role: utilisateur.type_utilisateur,departement:utilisateur.departement}, process.env.SECRET_KEY, /*{ expiresIn: '30s' }*/);
  
      res.json({ message: 'Connexion réussie', token });
  
    } catch (error) {
      console.error('Erreur lors du login:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

//logout
router.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(400).json({ message: 'Token non fourni' });

  // Ajoute le token à la liste noire
  await blackListToken.create({ token });

  res.status(200).json({ message: 'Déconnexion réussie' });
});

//supprimer un utilisateur
router.delete("/deleleteUtilisateur/:id", authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'utilisateur à partir des paramètres de l'URL

  try {
    // Trouver et supprimer l'utilisateur
    const deletedUtilisateur = await Utilisateur.findByIdAndDelete(id);

    if (!deletedUtilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre à jour le statut de la demande associée à cet utilisateur
    const updatedDemande = await DemandeSup.findOneAndUpdate(
      { demandeur: deletedUtilisateur._id }, // Trouver la demande correspondant à l'utilisateur
      { statut: "approuvé" }, // Mettre à jour le statut à "approuvé"
      { new: true } // Retourner le document mis à jour
    );

    if (!updatedDemande) {
      return res.status(404).json({ message: "Demande associée non trouvée" });
    }

    // Retourner une réponse avec succès
    res.status(200).json({ message: "Utilisateur supprimé avec succès et demande mise à jour", demande: updatedDemande });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur ou de la mise à jour de la demande" });
    console.error(err);
  }
});


//modifier un utilisateur
router.put("/updateUtilisateur/:id", authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, tel, DateNaissance, type_utilisateur, email, motDePasse, departement } = req.body;

  try {
      // Vérifier si l'utilisateur existe
      const utilisateur = await Utilisateur.findById(id);
      if (!utilisateur) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Déclarer updatedFields avec let pour pouvoir modifier le mot de passe
      let updatedFields = { nom, prenom, tel, DateNaissance, type_utilisateur, email, departement };

      // Vérifier si un nouveau mot de passe est fourni et le hacher
      if (motDePasse && motDePasse !== utilisateur.motDePasse) {
          const salt = await bcrypt.genSalt(10);
          updatedFields.motDePasse = await bcrypt.hash(motDePasse, salt);
      } else {
          updatedFields.motDePasse = utilisateur.motDePasse; // Conserver l'ancien mot de passe
      }

      // Mettre à jour l'utilisateur
      const updatedUtilisateur = await Utilisateur.findByIdAndUpdate(
          id,
          updatedFields,
          { new: true }
      );

      res.status(200).json(updatedUtilisateur);
  } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error: err.message });
  }
});

module.exports = router;