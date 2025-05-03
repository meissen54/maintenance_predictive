import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, User, Settings, Palette, ArrowLeft, ArrowRight } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import AlertsModal from './AlertsModal';

const Navbar = ({ 
  labelText, 
  onMenuClick, 
  selectedColor = "#3498db", 
  darkMode = false, 
  setDarkMode,
  setSelectedColor 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [userFullName, setUserFullName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  
  const navigate = useNavigate();
  const colors = [
    { name: "Rouge", value: "#e74c3c" },
    { name: "Vert", value: "#22C55E" },
    { name: "Bleu", value: "#3498db" },
    { name: "Jaune", value: "#f1c40f" },
    { name: "Violet", value: "#9b59b6" },
    { name: "Orange", value: "#e67e22" },
  ];

  // Synchronisation de la couleur
  const [localColor, setLocalColor] = useState(selectedColor);
  useEffect(() => {
    setLocalColor(selectedColor);
  }, [selectedColor]);

  // Chargement des données utilisateur
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const formatName = (str) => str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase() || '';
        
        if (decoded.nom && decoded.prenom) {
          setUserFullName(`${formatName(decoded.prenom)} ${formatName(decoded.nom)}`);
        } else if (decoded.name) {
          const [first, last] = decoded.name.split(' ');
          setUserFullName(`${formatName(first)}${last ? ' ' + formatName(last) : ''}`);
        }

        if (decoded.role) {
          setUserRole(decoded.role);
        }
      } catch (error) {
        console.error('Erreur de décodage:', error);
      }
    }
  }, []);

  // Chargement des alertes non lues
  useEffect(() => {
    const fetchUnreadAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        let apiUrl = 'http://localhost:4000/apiAlerte/getUnreadAlerts';
        
        if (userRole === 'Technicien') {
          apiUrl = 'http://localhost:4000/apiAlerte/getUnreadAlertsByUser';
        }

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUnreadAlertsCount(userRole === 'Technicien' ? data.totalUnread : data.totalAlerts);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des alertes:', error);
        setUnreadAlertsCount(0);
      }
    };

    if (userRole) {
      fetchUnreadAlerts();
      const interval = setInterval(fetchUnreadAlerts, 2000);

      return () => clearInterval(interval);
    }
  }, [userRole]);

  // Gestion du menu
  const handleMenuClick = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    onMenuClick?.(newState);
  };

  // Gestion du mode sombre
  const handleDarkModeToggle = () => {
    setDarkMode?.(!darkMode);
  };

  // Gestion du changement de couleur
  const handleColorChange = (color) => {
    setLocalColor(color);
    if (setSelectedColor) setSelectedColor(color);
    localStorage.setItem('selectedColor', color);
    setShowSettingsDropdown(false);
  };

  // Gestion du dropdown des paramètres
  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  // Gestion du modal des alertes
  const toggleAlertsModal = () => {
    setShowAlertsModal(!showAlertsModal);
  };

  // Gestion du clic en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.settings-dropdown') && !event.target.closest('.alerts-modal-container')) {
        setShowSettingsDropdown(false);
        setShowAlertsModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronisation entre onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'selectedColor') {
        setLocalColor(e.newValue);
        if (setSelectedColor) setSelectedColor(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.addEventListener('storage', handleStorageChange);
  }, [setSelectedColor]);

  return (
    <nav className={`flex justify-between items-center bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 p-4 w-full transition-colors duration-300`}>
      {/* Partie gauche - Logo et titre */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleMenuClick}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <ArrowLeft 
              className="h-7 w-7" 
              style={{ 
                color: localColor,
                strokeWidth: 2.5 
              }} 
            />
          ) : (
            <ArrowRight 
              className="h-7 w-7" 
              style={{ 
                color: localColor,
                strokeWidth: 2.5 
              }} 
            />
          )}
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {labelText}
        </h1>
      </div>

      {/* Partie droite - Contrôles utilisateur */}
      <div className="flex items-center space-x-5">
        {/* Menu Paramètres */}
        <div className="relative settings-dropdown">
          <button
            onClick={toggleSettingsDropdown}
            className="rounded-full p-2.5 transition-all hover:scale-110 bg-white dark:bg-gray-700 border-2"
            style={{ borderColor: localColor }}
            aria-label="Paramètres"
          >
            <Settings className="h-6 w-6" style={{ color: localColor }} />
          </button>

          {showSettingsDropdown && (
            <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <div className="p-4">
                <div className="mb-4">
                  <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Palette size={16} /> Couleurs des boutons
                  </h3>
                  <div className="space-y-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleColorChange(color.value)}
                        className={`flex items-center w-full p-2 rounded-lg text-sm ${
                          localColor === color.value
                            ? darkMode
                              ? 'bg-gray-600 font-medium'
                              : 'bg-gray-100 font-medium'
                            : darkMode
                            ? 'hover:bg-gray-600 text-gray-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: color.value }} />
                        <span>{color.name}</span>
                        {localColor === color.value && (
                          <span className="ml-auto" style={{ color: localColor }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification */}
        <div className="relative group">
          <button
            onClick={toggleAlertsModal}
            className="rounded-full p-2.5 transition-all group-hover:scale-110 border-2 bg-white dark:bg-gray-700"
            style={{ borderColor: localColor }}
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" style={{ color: localColor }} />
          </button>
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-medium">
              { unreadAlertsCount}
            </span>
          )}
        </div>

        {/* Modal des alertes */}
        {showAlertsModal && (
          <AlertsModal 
            unreadAlertsCount={unreadAlertsCount}
            localColor={localColor}
            darkMode={darkMode}
            onClose={() => setShowAlertsModal(false)}
          />
        )}

        {/* Bouton Dark Mode */}
        <button
          onClick={handleDarkModeToggle}
          className="rounded-full p-2.5 transition-all hover:scale-110 bg-white dark:bg-gray-700 border-2"
          style={{ borderColor: localColor }}
          aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {darkMode ? (
            <Sun className="h-6 w-6" style={{ color: localColor }} />
          ) : (
            <Moon className="h-6 w-6" style={{ color: localColor }} />
          )}
        </button>

        {/* Profil utilisateur */}
        <div className="flex items-center group">
          <div
            className="flex items-center space-x-3 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            style={{
              borderColor: darkMode ? '#4B5563' : `${localColor}40`,
              borderWidth: '1px',
              background: darkMode
                ? 'linear-gradient(to right, #374151, #4B5563)'
                : `linear-gradient(to right, ${localColor}10, ${localColor}20)`
            }}
          >
            <div
              className="p-2 rounded-full group-hover:bg-opacity-50 transition-colors duration-300"
              style={{
                backgroundColor: darkMode ? '#4B5563' : `${localColor}20`
              }}
            >
              <User size={22} style={{ color: localColor }} />
            </div>
            <span className="font-medium text-gray-800 dark:text-white text-base">
              {userFullName || 'Utilisateur'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;