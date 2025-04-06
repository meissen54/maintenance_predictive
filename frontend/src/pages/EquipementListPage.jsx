import EquipementList from "../components/EquipementList";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const EquipementListPage = ({ darkMode, setDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#22C55E"); // Ajout de l'état pour la couleur

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Passage des props selectedColor et setSelectedColor au Sidebar */}
      <Sidebar 
        isMenuOpen={isMenuOpen} 
        darkMode={darkMode}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />
      
      <div className="flex flex-col w-full" style={{ marginLeft: isMenuOpen ? "0" : "-16rem" }}>
        <Navbar 
          labelText="Liste d'équipements"
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        
        <div className={`p-6 flex-grow overflow-y-auto ${darkMode ? 'dark:bg-gray-800' : 'bg-[#f3f8f5]'}`}>
          {/* Passage de la selectedColor à EquipementList */}
          <EquipementList 
            darkMode={darkMode} 
            selectedColor={selectedColor}
          />
        </div>
      </div>
    </div>
  );
};

export default EquipementListPage;