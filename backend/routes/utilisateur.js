const express= require("express");
const Utilisateur = require("../models/utilisateur");
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

//Crud utilisateurs

//récupérer les utilisateurs depuis la base de données
router.get("/getUtilisateur",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
    try {
      const utilisateurs = await Utilisateur.find();  // Fetch all items from the MongoDB collection
      res.status(200).json(utilisateurs);      // Send back the list of items
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des éléments" });
    }
  });

//inscription
router.post("/register",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
    try {
    const { nom, prenom, tel, DateNaissance, type_utilisateur, email, motDePasse } = req.body;  
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      let utilisateur = await Utilisateur.findOne({ email });
      if (utilisateur) return res.status(400).json({ message: "Cet email est déjà utilisé !" });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(motDePasse, salt);
  
      utilisateur = new Utilisateur({ nom, prenom, tel, DateNaissance, type_utilisateur, email, motDePasse: hashedPassword });
      await utilisateur.save();
  
      res.status(201).json({ message: "Inscription réussie !" });
        } catch (error) {
          res.status(500).json({ message: "Erreur serveur", error });
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
    const { nom, prenom, tel, DateNaissance, type_utilisateur, email, motDePasse } = req.body;
  
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
      const token = jwt.sign({ id: utilisateur._id, email: utilisateur.email ,role: utilisateur.type_utilisateur, role: utilisateur.type_utilisateur}, SECRET_KEY, { expiresIn: '1h' });
  
      res.json({ message: 'Connexion réussie', token });
  
    } catch (error) {
      console.error('Erreur lors du login:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

//logout
router.post('/logout',async(req,res)=>{
  try{
    
    res.json({ message: 'Déconnexion réussie' });

  }catch(error){
      console.error('Erreur ',error);
      res.status(500).json({message:'erreur serveur'});
  }
})

//supprimer un utilisateur
router.delete("/deleleteUtilisateur/:id",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params; // Get the item ID from the URL parameter

  try {
    const deletedUtilisateur = await Utilisateur.findByIdAndDelete(id); // Find and delete the item

    if (!deletedUtilisateur) {
      return res.status(404).json({ message: "utilisateur non trouvé" });
    }

    res.status(200).json({ message: "utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
});

//modifier un utilisateur
router.put("/updateUtilisateur/:id",authenticateUser, authorizeRole("Administrateur"), async (req, res) => {
  const { id } = req.params;  // Get the item ID from the URL parameter
  const { nom, prenom, tel, DateNaissance, type_utilisateur, email, motDePasse } = req.body;  // Get updated data from request body

  try {
    const updatedUtilisateur = await Utilisateur.findByIdAndUpdate(
      id,  // Find the item by its ID
      { nom, prenom, tel, DateNaissance, type_utilisateur, email, motDePasse },  // Update the fields
      { new: true }  // Return the updated document
    );

    if (!updatedUtilisateur) {
      return res.status(404).json({ message: "not found" });
    }
    res.status(200).json(updatedUtilisateur);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
  }
});


module.exports = router;