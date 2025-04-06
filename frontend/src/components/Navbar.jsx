import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, User } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const Navbar = ({ labelText, onMenuClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [userFullName, setUserFullName] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Récupère les infos utilisateur depuis le token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
        
        if (decodedToken.nom && decodedToken.prenom) {
          setUserFullName(`${capitalize(decodedToken.prenom)} ${capitalize(decodedToken.nom)}`);
        } else if (decodedToken.name) {
          const [prenom, nom] = decodedToken.name.split(' ');
          setUserFullName(`${capitalize(prenom)}${nom ? ' ' + capitalize(nom) : ''}`);
        }
      } catch (error) {
        console.error('Erreur de décodage:', error);
      }
    }
  }, []);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 p-4 w-full transition-colors duration-300">
      {/* Partie gauche */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={handleMenuClick}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
        <span className="text-2xl font-semibold text-gray-800 dark:text-white">
          {labelText}
        </span>
      </div>

      {/* Partie droite */}
      <div className="flex items-center space-x-5">
        {/* Notification */}
        <div className="relative group">
          <div className="rounded-full p-3 transition-all group-hover:scale-110 border-2 border-green-500 dark:border-green-400 bg-white dark:bg-gray-700">
            <Bell className="h-7 w-7 text-green-500 dark:text-green-400" />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-medium">
            10
          </div>
        </div>

        {/* Bouton Dark Mode */}
        <button 
          onClick={toggleDarkMode}
          className="rounded-full p-3 transition-all hover:scale-110 border-2 border-green-500 dark:border-green-400 bg-white dark:bg-gray-700"
          aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {darkMode ? (
            <Sun className="h-7 w-7 text-green-500 dark:text-green-400" />
          ) : (
            <Moon className="h-7 w-7 text-green-500 dark:text-green-400" />
          )}
        </button>

        {/* Profil utilisateur avec icône User */}
        <div className="flex items-center group">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 px-5 py-2.5 rounded-full shadow-sm border border-green-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="p-2 bg-green-100 dark:bg-gray-600 rounded-full group-hover:bg-green-200 dark:group-hover:bg-gray-500 transition-colors duration-300">
              <User size={22} className="text-green-600 dark:text-green-300" />
            </div>
            <span className="font-medium text-gray-800 dark:text-white text-base">
              {userFullName || 'Utilisateur'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;