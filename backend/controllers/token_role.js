const jwt = require("jsonwebtoken");
const blackListToken = require("../models/blackListToken");
const SECRET_KEY = process.env.JWT_SECRET || "monSuperSecret";

//fonction pour gérer les roles et la connexion
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format : "Bearer <token>"
  
  if (!token) return res.status(401).json({ message: 'Token non fourni' });
  
  // Vérifie si le token est dans la liste noire
  const isBlacklisted = await blackListToken.findOne({ token });
  if (isBlacklisted) {
    return res.status(403).json({ message: 'Token invalide (déconnexion)' });
  }
  // Vérifie la validité du token
  jwt.verify(token, process.env.SECRET_KEY, (err, utilisateur) => {
    if (err) return res.status(403).json({ message: 'Token invalide ou expiré' });
    req.utilisateur = utilisateur; // Ajoute les informations de l'utilisateur à la requête
    next();
  });
};
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.utilisateur || req.utilisateur.role !== role) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    next();
  };
};
module.exports = { authenticateUser, authorizeRole };