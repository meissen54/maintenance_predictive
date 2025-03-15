import { Link } from "react-router-dom";
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
        <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Connexion</h2>
          
          <form>
            {/* Champ Email */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="mb-4">
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Bouton Connexion */}
            <button className="w-full mt-4 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold">
              Se connecter
            </button>
          </form>

          {/* Lien Mot de passe oublié */}
          <p className="text-center text-gray-500 mt-4">
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
