import { Link } from "react-router-dom";
import Logo from "/src/assets/logo.png";
import "../index.css";

const Navbar = () => {
  return (
    <nav className="bg-red-500 border-b-0 shadow-none p-4  hover:-translate-y-16 transform transition-transform duration-1000" >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Logo ou nom du site */}
        <div className="absolute left-4 top-2">
          <img src={Logo} alt="TechSanté" className="w-32 h-auto" />
        </div>

        {/* Menu de navigation aligné à droite */}
        <div className="flex space-x-6 ml-auto">
          <div>
            <Link to="/about" className="text-gray-700 hover:text-green-600 transition duration-300">À propos</Link>
          </div>
          <div>
            <Link to="/contact" className="text-gray-700 hover:text-green-600 transition duration-300">Réclamation</Link>
          </div>
          <div>
            <Link to="/login" className="text-gray-700 hover:text-green-600 transition duration-300">Connexion</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
