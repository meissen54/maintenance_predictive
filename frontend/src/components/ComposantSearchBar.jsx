import React, { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Filter } from "lucide-react";

const ComposantSearchBar = ({
  searchType,
  setSearchType,
  query,
  setQuery,
  showOptions,
  setShowOptions,
  filterRef,
  size = "default",
  className = "",
  hasFocus = false,
  setHasFocus = () => {},
  includeAllFields = false,
  includeEquipementAndEtat = false,
  includeComposantFields = false,
  darkMode = false,
  selectedColor = "#10B981" // Couleur verte par défaut
}) => {
  const localRef = useRef(null);
  const finalRef = filterRef || localRef;

  // Options de recherche en fonction des props
  const getSearchOptions = () => {
    if (includeAllFields) {
      // Barre de recherche globale - tous les champs
      return [
        { value: 'nom', label: 'Nom' },
        { value: 'numSerieComposant', label: 'Numéro de série' },
        { value: 'etat', label: 'État' },
        { value: 'type', label: 'Type' },
        { value: 'fabricant', label: 'Fabricant' },
        { value: 'equipement', label: 'Équipement' },
        { value: 'departement', label: 'Département' }
      ];
    } else if (includeEquipementAndEtat) {
      // Barre de recherche par département - seulement équipement et état
      return [
        { value: 'equipement', label: 'Équipement' },
        { value: 'etat', label: 'État' }
      ];
    } else if (includeComposantFields) {
      // Barre de recherche par équipement - champs des composants
      return [
        { value: 'nom', label: 'Nom' },
        { value: 'numSerieComposant', label: 'Numéro de série' },
        { value: 'etat', label: 'État' },
        { value: 'fabricant', label: 'Fabricant' }
      ];
    } else {
      // Par défaut, retourne les options de base
      return [
        { value: 'nom', label: 'Nom' },
        { value: 'numSerieComposant', label: 'Numéro de série' },
        { value: 'etat', label: 'État' }
      ];
    }
  };

  const searchOptions = getSearchOptions();
  const currentFilterLabel = searchOptions.find(opt => opt.value === searchType)?.label;

  const sizes = {
    default: {
      input: "py-2.5 text-sm pl-11 pr-10",
      icon: 18,
      options: "text-sm",
      container: "h-11",
      dropdownIcon: 16
    },
    large: {
      input: "py-3 text-base pl-12 pr-11",
      icon: 20,
      options: "text-base",
      container: "h-12",
      dropdownIcon: 18
    },
    small: {
      input: "py-2 text-xs pl-10 pr-9",
      icon: 16,
      options: "text-xs",
      container: "h-10",
      dropdownIcon: 14
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (finalRef.current && !finalRef.current.contains(event.target)) {
        setHasFocus(false);
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [finalRef, setShowOptions, setHasFocus]);

  const currentSize = sizes[size] || sizes.default;

  const handleOptionClick = (optionValue) => {
    setSearchType(optionValue);
    setShowOptions(false);
  };

  const handleClearSearch = () => setQuery("");

  const toggleOptions = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
    setHasFocus(true);
  };

  const handleInputFocus = () => {
    setHasFocus(true);
  };

  // Fonction pour déterminer si la couleur est claire ou foncée
  const isLightColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128;
  };

  return (
    <div className={`relative ${className}`} ref={finalRef}>
      {/* Conteneur principal de la barre de recherche */}
      <div 
        className={`relative flex items-center ${currentSize.container} rounded-lg border transition-all duration-200 ${
          darkMode ? 'bg-gray-700' : 'bg-white'
        }`}
        style={{
          borderColor: hasFocus ? selectedColor : (darkMode ? '#4B5563' : '#E5E7EB')
        }}
      >
        {/* Icône de recherche */}
        <div className={`absolute left-3 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
          <Search size={currentSize.icon} />
        </div>
        
        {/* Champ de recherche */}
        <input
          type="text"
          placeholder={`Rechercher par ${currentFilterLabel?.toLowerCase()}`}
          className={`flex-grow ${currentSize.input} bg-transparent outline-none ${
            darkMode ? "placeholder-gray-400 text-gray-200" : "placeholder-gray-400 text-gray-700"
          }`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
        />
        
        {/* Bouton de suppression du texte */}
        {query && (
          <button
            onClick={handleClearSearch}
            className={`absolute right-10 p-1 transition-colors ${
              darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <X size={currentSize.icon} />
          </button>
        )}
        
        {/* Bouton du dropdown avec icône de filtre */}
        <button
          onClick={toggleOptions}
          className={`absolute right-0 h-full px-3 flex items-center justify-center rounded-r-lg transition-colors gap-1 ${
            hasFocus 
              ? isLightColor(selectedColor) 
                ? 'text-gray-800' 
                : 'text-white'
              : darkMode 
                ? "text-gray-300" 
                : "text-gray-500"
          }`}
          style={{
            backgroundColor: hasFocus ? selectedColor : (darkMode ? "#4B5563" : "#F3F4F6")
          }}
        >
          <Filter size={currentSize.dropdownIcon - 2} />
          <ChevronDown 
            size={currentSize.dropdownIcon} 
            className={`transition-transform ${showOptions ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      
      {/* Menu déroulant des options */}
      {showOptions && (
        <div 
          className={`absolute right-0 mt-1.5 w-56 rounded-lg shadow-lg z-50 overflow-hidden ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"
          }`}
        >
          <div className="py-1">
            {/* En-tête amélioré avec icône */}
            <div className={`px-4 py-2 flex items-center gap-2 border-b ${
              darkMode 
                ? "border-gray-700 text-gray-300" 
                : "border-gray-100 text-gray-600"
            }`}>
              <Filter size={14} className="opacity-70" />
              <span className="text-sm font-medium">Filtrer par :</span>
            </div>
            
            {/* Options de filtrage */}
            <div className="py-1">
              {searchOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick(option.value);
                  }}
                  className={`w-full text-left px-4 py-2.5 ${currentSize.options} flex items-center transition-colors ${
                    searchType === option.value 
                      ? "font-medium"
                      : darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-50"
                  }`}
                  style={
                    searchType === option.value
                      ? { 
                          backgroundColor: darkMode 
                            ? `${selectedColor}40` 
                            : `${selectedColor}20`,
                          color: darkMode 
                            ? isLightColor(selectedColor) 
                              ? selectedColor 
                              : '#FFFFFF'
                            : selectedColor
                        }
                      : {}
                  }
                >
                  {option.label}
                  {searchType === option.value && (
                    <span 
                      className="ml-auto"
                      style={{
                        color: darkMode 
                          ? isLightColor(selectedColor) 
                            ? selectedColor 
                            : '#FFFFFF'
                          : selectedColor
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComposantSearchBar;