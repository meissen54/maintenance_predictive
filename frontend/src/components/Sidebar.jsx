import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users, Settings, BarChart, Wrench, Cpu, Thermometer,
  Bell, ChevronDown, ChevronUp, Home, LogOut, Palette, LayoutDashboard, ClipboardList
} from "lucide-react";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import LOGO from "/src/assets/logo.png";

const Sidebar = ({ isMenuOpen, selectedColor, setSelectedColor, darkMode }) => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const colors = [
    { name: "Rouge", value: "#e74c3c" },
    { name: "Vert", value: "#22C55E" },
    { name: "Bleu", value: "#3498db" },
    { name: "Jaune", value: "#f1c40f" },
    { name: "Violet", value: "#9b59b6" },
    { name: "Orange", value: "#e67e22" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (e) {
        console.error("Erreur de décodage:", e);
      }
    }

    const savedColor = localStorage.getItem("selectedColor");
    if (savedColor) {
      setSelectedColor(savedColor);
    }
  }, []);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    localStorage.setItem("selectedColor", color);
  };
  const toggleDashboard = () => setIsDashboardOpen(!isDashboardOpen);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const isActive = (path) => location.pathname === path;
  const isAdmin = userRole === "Administrateur";
  const isTechnicien = userRole === "Technicien";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Tous les liens avec leurs icônes correspondantes
  const allLinks = [
    { path: "/utilisateurs", icon: <Users size={20} />, adminOnly: true },
    { path: "/depart", icon: <Home size={20} />, adminOnly: true },
    { path: "/dashboard", icon: <Wrench size={20} /> },
    { path: "/dashboard1", icon: <Cpu size={20} /> },
    { path: "/capteurs", icon: <Thermometer size={20} /> },
    { path: "/alertes", icon: <Bell size={20} /> },
    { path: "/demandes", icon: <ClipboardList size={20} />, roles: ["Administrateur", "Technicien"] },
    { path: "/stats", icon: <BarChart size={20} /> },
  ];

  // Filtrer les liens selon le rôle de l'utilisateur
  const filteredLinks = allLinks.filter(link => {
    if (link.adminOnly) return isAdmin;
    if (link.roles) return link.roles.includes(userRole);
    return true;
  });

  // Icônes principales pour la sidebar réduite
  const mainIcons = filteredLinks.map(link => ({
    path: link.path,
    icon: link.icon
  }));

  return (
    <div
      className={`${isMenuOpen ? "w-64" : "w-20"} h-screen ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg p-4 transition-all duration-300 ease-in-out flex flex-col overflow-y-auto max-h-screen hide-scrollbar`}
    >
      <div className="flex-grow">
        <div className="text-center mb-6">
          {isMenuOpen ? (
            <img src={LOGO} alt="Logo" className="w-64 mx-auto" />
          ) : (
            <div className="flex justify-center">
              <LayoutDashboard 
                size={32} 
                className={darkMode ? "text-gray-200" : "text-gray-800"} 
              />
            </div>
          )}
        </div>

        {isMenuOpen ? (
          <ul className="space-y-2">
            <li>
              <button
                onClick={toggleDashboard}
                style={isDashboardOpen ? { backgroundColor: selectedColor } : {}}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-full ${
                  isDashboardOpen
                    ? "text-white"
                    : darkMode
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-100 text-gray-800"
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
                {isDashboardOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {isDashboardOpen && (
                <ul className="pl-6 space-y-2">
                  {filteredLinks
                    .filter(link => link.path !== "/stats")
                    .map((link, index) => (
                      <li key={index}>
                        <Link
                          to={link.path}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isActive(link.path)
                              ? { color: selectedColor }
                              : darkMode
                              ? "text-gray-300 hover:text-gray-400"
                              : "text-gray-700 hover:text-gray-500"
                          }`}
                          style={isActive(link.path) ? { color: selectedColor } : {}}
                        >
                          {link.icon}
                          {link.path === "/utilisateurs" && "Utilisateurs"}
                          {link.path === "/depart" && "Départements"}
                          {link.path === "/dashboard" && "Équipements"}
                          {link.path === "/dashboard1" && "Composants"}
                          {link.path === "/capteurs" && "Capteurs"}
                          {link.path === "/alertes" && "Alertes"}
                          {link.path === "/demandes" && "Demandes"}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </li>

            <li>
              <Link
                to="/rapport"
                className={`flex items-center gap-3 p-3 rounded-lg font-bold ${
                  isActive("/stats")
                  ? { color: selectedColor }
                  : darkMode
                  ? "text-gray-300 hover:text-gray-400"
                  : "text-gray-700 hover:text-gray-500"
                }`}
                style={isActive("/stats") ? { color: selectedColor } : {}}
              >
                <BarChart size={20} /> Stats
              </Link>
            </li>

            <li>
              <button
                onClick={toggleSettings}
                className={`flex items-center gap-3 p-3 w-full text-left rounded-lg ${
                  isSettingsOpen
                  ? { color: selectedColor }
                  : darkMode
                  ? "text-gray-300 hover:text-gray-400"
                  : "text-gray-700 hover:text-gray-500"
                }`}
                style={isSettingsOpen ? { color: selectedColor } : {}}
              >
                <Settings size={20} /> Settings
                {isSettingsOpen ? <ChevronUp size={20} className="ml-auto" /> : <ChevronDown size={20} className="ml-auto" />}
              </button>
              {isSettingsOpen && (
                <div className="pl-6 space-y-2 mt-2">
                  <div className="p-2">
                    <label className={`flex items-center gap-2 text-sm mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      <Palette size={16} /> Couleurs des boutons
                    </label>
                    <div className="space-y-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange(color.value)}
                          className={`flex items-center w-full p-2 rounded-lg text-sm ${
                            selectedColor === color.value
                              ? darkMode
                              ? "bg-gray-700 font-medium"
                              : "bg-gray-100 font-medium"
                              : darkMode
                              ? "hover:bg-gray-700 text-gray-200"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: color.value }}></span>
                          <span>{color.name}</span>
                          {selectedColor === color.value && (
                            <span className="ml-auto" style={{ color: selectedColor }}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>
          </ul>
        ) : (
          // Version réduite de la sidebar avec toutes les icônes de liens
          <ul className="space-y-4">
            {mainIcons.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  className={`flex justify-center p-3 rounded-lg ${
                    isActive(link.path)
                      ? darkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                      : darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
                  style={isActive(link.path) ? { backgroundColor: selectedColor } : {}}
                >
                  {link.icon}
                </Link>
              </li>
            ))}
            
            {/* Bouton Paramètres */}
            <li>
              <button
                onClick={toggleSettings}
                className={`flex justify-center p-3 rounded-lg w-full ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <Settings size={20} />
              </button>
            </li>
          </ul>
        )}
      </div>

      <div className="mt-auto pt-4 border-gray-600">
        <button
          onClick={handleLogout}
          className={`flex ${isMenuOpen ? "items-center gap-2" : "justify-center"} w-full p-2 rounded-lg transition-colors ${
            darkMode
              ? "text-gray-300 hover:text-red-400 hover:bg-gray-700"
              : "text-gray-600 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {isMenuOpen && <span className="text-sm font-medium">Se déconnecter</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;