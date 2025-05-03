import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";
import Rapport from "../components/Rapport";

const RapportPage = ({ darkMode, setDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#22C55E");

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div
        className={`${isMenuOpen ? "w-64" : "w-20"} 
        transition-all duration-300 flex-shrink-0 
        ${darkMode ? 'dark:bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}
      >
        <Sidebar
          isMenuOpen={isMenuOpen}
          darkMode={darkMode}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          labelText="Rapport"
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
          selectedColor={selectedColor}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          className={darkMode ? 'dark:bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}
        />

        <div
          className={`p-6 flex-grow overflow-y-auto transition-colors duration-300
          ${darkMode ? 'dark:bg-gray-900 text-gray-100' : 'bg-[#f3f8f5] text-gray-800'}`}
        >
          <Rapport darkMode={darkMode} selectedColor={selectedColor} />
        </div>
      </div>
    </div>
  );
};

export default RapportPage;
