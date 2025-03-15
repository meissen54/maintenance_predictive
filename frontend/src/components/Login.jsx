import { Link } from "react-router-dom";
import { motion } from "framer-motion";  // Importation de motion
import COVER_IMAGE from "/src/assets/medical-equipment-dealer.jpg";
import "../index.css";

const Login = () => {
  return (
    <div className="w-full h-screen flex">
      {/* Partie gauche avec l'image */}
      <div className="w-1/2 h-full">
        <img src={COVER_IMAGE} className="w-full h-full object-cover" />
      </div>

      {/* Partie droite avec le formulaire */}
      <div className="w-1/2 flex justify-center items-center bg-gray-100">
        <div className="bg-white p-12 rounded-3xl shadow-xl w-96">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Connexion</h2>
          
          <form>
            {/* Champ Email */}
            <div className="mb-6">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 hover:border-green-500"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="mb-6">
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 hover:border-green-500"
              />
            </div>

            {/* Bouton Connexion avec motion */}
            <motion.button
              className="w-full mt-6 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }} // Animation sur hover
              whileTap={{ scale: 0.95 }} // Animation sur click
              transition={{ type: "spring", stiffness: 300, damping: 15 }} // Rendre l'animation plus rapide
            >
              Se connecter
            </motion.button>
          </form>

          {/* Lien Mot de passe oublié */}
          <p className="text-center text-gray-500 mt-6">
            <Link to="/reset-password" className="text-green-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
