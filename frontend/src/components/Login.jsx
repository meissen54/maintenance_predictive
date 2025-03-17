import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import COVER_IMAGE from "/src/assets/medical-equipment-dealer.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser l'erreur
  
    try {
      const response = await axios.post("http://localhost:4000/apiUtilisateur/login", { email, motDePasse });
      
      // Stocker le token et rediriger si tout est correct
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      // Vérifier si le backend a renvoyé une erreur et afficher son message
      if (err.response && err.response.data) {
        setError(err.response.data); // Directement afficher le message d'erreur du backend
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };
  

  return (
    <div className="w-full h-screen flex relative">
      {/* Image de fond avec flou et opacité */}
      <div className="absolute inset-0">
        <img src={COVER_IMAGE} className="w-full h-full object-cover filter blur-sm brightness-75" />
      </div>

      {/* Contenu principal centré */}
      <div className="relative w-full h-full flex justify-center items-center">
        <motion.div
          className="bg-white bg-opacity-10 backdrop-blur-lg p-10 rounded-2xl shadow-lg w-96"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Titre */}
          <h2 className="text-2xl font-semibold text-white text-center mb-6">Connexion</h2>

          {/* Message d'erreur */}
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin}>
            {/* Champ Email */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 bg-transparent border border-white border-opacity-50 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="mb-4">
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full p-3 bg-transparent border border-white border-opacity-50 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>

            {/* Bouton de Connexion avec animation */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-green-600 transition-all duration-300"
              type="submit"
            >
              Se connecter
            </motion.button>
          </form>

          {/* Lien Mot de passe oublié */}
          <div className="mt-4 text-center">
            <Link to="/reset-password" className="text-white text-opacity-80 hover:text-green-300 transition-all duration-300">
              Mot de passe oublié ?
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
