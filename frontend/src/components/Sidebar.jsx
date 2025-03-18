import { Link, useLocation } from "react-router-dom";
import { Users, Settings, BarChart, Wrench, Cpu, Thermometer, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Importer l'image du logo
import LOGO from "/src/assets/logo.png";

const Sidebar = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const location = useLocation(); // Pour obtenir la route actuelle

  const toggleDashboard = () => setIsDashboardOpen(!isDashboardOpen);

  // Fonction pour vérifier si la route est active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-white shadow-lg p-4">
      {/* Afficher le logo avec une taille agrandie */}
      <div className="text-center mb-6">
        <img src={LOGO} alt="Logo" className="w-64 mx-auto" /> {/* Logo plus grand */}
      </div>

      <ul className="space-y-2">
        {/* Lien Dashboard avec flèche pour déplier/replier */}
        <li>
          <button
            onClick={toggleDashboard}
            className={`flex items-center gap-3 p-3 w-full text-left rounded-full ${
              isDashboardOpen ? "bg-green-500 text-white" : "hover:bg-green-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="flex-grow font-bold">Dashboard</span>
            {isDashboardOpen ? (
              <ChevronUp size={20} className="text-white" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </button>
          {isDashboardOpen && (
            <ul className="pl-6 space-y-2">
              <li>
                <Link
                  to="/utilisateurs"
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isActive("/utilisateurs") ? "text-green-500" : "hover:text-green-500"
                  }`}
                >
                  <Users size={20} /> Utilisateurs
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isActive("/dashboard") ? "text-green-500" : "hover:text-green-500"
                  }`}
                >
                  <Wrench size={20} /> Équipement
                </Link>
              </li>
              <li>
                <Link
                  to="/composant"
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isActive("/composant") ? "text-green-500" : "hover:text-green-500"
                  }`}
                >
                  <Cpu size={20} /> Composant
                </Link>
              </li>
              <li>
                <Link
                  to="/capteurs"
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isActive("/capteurs") ? "text-green-500" : "hover:text-green-500"
                  }`}
                >
                  <Thermometer size={20} /> Capteurs
                </Link>
              </li>
              <li>
                <Link
                  to="/alertes"
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isActive("/alertes") ? "text-green-500" : "hover:text-green-500"
                  }`}
                >
                  <Bell size={20} /> Alertes
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Autres liens */}
        <li>
          <Link
            to="/stats"
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isActive("/stats") ? "text-green-500" : "hover:text-green-500"
            } font-bold`}
          >
            <BarChart size={20} /> Stats
          </Link>
        </li>
        <li>
          <Link
            to="/settings"
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isActive("/settings") ? "text-green-500" : "hover:text-green-500"
            }`}
          >
            <Settings size={20} /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
