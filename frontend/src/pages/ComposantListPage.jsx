import ComposantList from "../components/ComposantList";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const ComposantListPage = ({ darkMode, setDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#22C55E");

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar avec largeur fixe */}
      <div className={`${isMenuOpen ? "w-64" : "w-20"} transition-all duration-300 flex-shrink-0`}>
        <Sidebar 
          isMenuOpen={isMenuOpen} 
          darkMode={darkMode}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      </div>
      
      {/* Contenu principal avec overflow */}
      <div className="flex flex-col flex-1 min-w-0"> {/* min-w-0 pour éviter les problèmes de largeur */}
        <Navbar 
          labelText="Liste des composants"
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
          selectedColor={selectedColor}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        
        <div className={`p-6 flex-grow overflow-y-auto ${darkMode ? 'dark:bg-gray-800' : 'bg-[#f3f8f5]'}`}>
          <ComposantList 
            darkMode={darkMode} 
            selectedColor={selectedColor}
          />
        </div>
      </div>
    </div>
  );
};

export default ComposantListPage;