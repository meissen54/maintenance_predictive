import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash, Edit, Eye, ChevronDown, ChevronUp, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AddEquipementModal from './AddEquipementModal';
import UpdateEquipementModal from './UpdateEquipement';
import ComposantsModal from './ComposantModal';
import SearchBar from './SearchBar';

const EquipementList = ({ selectedColor, darkMode }) => {
  // États principaux
  const [equipements, setEquipements] = useState([]);
  const [filteredEquipements, setFilteredEquipements] = useState([]);
  const [globalQuery, setGlobalQuery] = useState("");
  const [departementQueries, setDepartementQueries] = useState({});
  const [role, setRole] = useState("");
  
  // États des modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [equipementToUpdate, setEquipementToUpdate] = useState(null);
  
  // États des notifications
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  
  // États des modales d'affichage
  const [showComposantsModal, setShowComposantsModal] = useState(false);
  const [selectedComposants, setSelectedComposants] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [equipementToDelete, setEquipementToDelete] = useState(null);
  
  // États de l'interface
  const [expandedDepartements, setExpandedDepartements] = useState({});
  const [pagination, setPagination] = useState({});
  
  // États des descriptions et listes
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [showComposantsListModal, setShowComposantsListModal] = useState(false);
  const [currentComposantsList, setCurrentComposantsList] = useState([]);
  const [showCapteursListModal, setShowCapteursListModal] = useState(false);
  const [currentCapteursList, setCurrentCapteursList] = useState([]);
  
  // États du filtrage
  const [searchType, setSearchType] = useState("nom");
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeDepartementFilters, setActiveDepartementFilters] = useState({});
  const [departementSearchType, setDepartementSearchType] = useState({});
  const [focusedDepartementSearch, setFocusedDepartementSearch] = useState(null);
  const [globalSearchHasFocus, setGlobalSearchHasFocus] = useState(false);

  const navigate = useNavigate();
  const filterRef = useRef(null);
  const deptFilterRefs = useRef({});

  // Fonction pour gérer correctement les refs des départements
  const setDeptFilterRef = useCallback((departement, el) => {
    if (el) {
      deptFilterRefs.current[departement] = el;
    } else {
      delete deptFilterRefs.current[departement];
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowSearchOptions(false);
        setFocusedDepartementSearch(null);
      }
      
      Object.keys(deptFilterRefs.current).forEach(departement => {
        const ref = deptFilterRefs.current[departement];
        if (ref && !ref.contains(event.target)) {
          setActiveDepartementFilters(prev => ({
            ...prev,
            [departement]: false
          }));
          setFocusedDepartementSearch(prev => prev === departement ? null : prev);
        }
      });
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!globalQuery.trim()) {
      setExpandedDepartements(prev => {
        const newState = {};
        Object.keys(prev).forEach(key => {
          newState[key] = false;
        });
        return newState;
      });
    }
  }, [globalQuery]);

  const toggleDepartement = (departement) => {
    setExpandedDepartements(prev => ({
      ...prev,
      [departement]: !prev[departement]
    }));
  };

  const toggleDepartementFilter = (departement, event) => {
    event.stopPropagation();
    setActiveDepartementFilters(prev => ({
      ...prev,
      [departement]: !prev[departement]
    }));
  };

  const setDepartementFilterType = (departement, type) => {
    setDepartementSearchType(prev => ({
      ...prev,
      [departement]: type
    }));
    setActiveDepartementFilters(prev => ({
      ...prev,
      [departement]: false
    }));
  };

  const handleDepartementSearch = (departement, query) => {
    setDepartementQueries(prev => ({
      ...prev,
      [departement]: query
    }));
  
    if (query.trim()) {
      const hasResults = equipements.some(e => 
        e.departement?.nom === departement && 
        [e.nom, e.numSerie, e.etat].some(field =>
          field?.toLowerCase().includes(query.toLowerCase())
        )
      );
  
      setExpandedDepartements(prev => ({
        ...prev,
        [departement]: hasResults ? true : prev[departement]
      }));
    } else {
      setExpandedDepartements(prev => ({
        ...prev,
        [departement]: false
      }));
    }
  };
  
  const fetchEquipements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trouvé");
        return;
      }

      const decodedToken = jwtDecode(token);
      const role = decodedToken.role;
      setRole(role);

      const apiURL =
        role === "Administrateur"
          ? "http://localhost:4000/apiEquipement/getEquipement"
          : "http://localhost:4000/apiEquipement/getEquipementBydepart";

      const response = await axios.get(apiURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.equipements || response.data;
      
      if (Array.isArray(data)) {
        setEquipements(data);
        setFilteredEquipements(data);
        
        setExpandedDepartements(prev => {
          const newState = {};
          data.forEach(equipement => {
            if (equipement.departement?.nom) {
              newState[equipement.departement.nom] = prev[equipement.departement.nom] || false;
            }
          });
          return newState;
        });

        const paginationInit = data.reduce((acc, equipement) => {
          if (equipement.departement?.nom) {
            if (!acc[equipement.departement.nom]) {
              acc[equipement.departement.nom] = {
                currentPage: 1,
                itemsPerPage: 3
              };
            }
          }
          return acc;
        }, {});
        setPagination(paginationInit);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des équipements:", error);
    }
  };

  useEffect(() => {
    fetchEquipements();
  }, []);

  useEffect(() => {
    const filtered = equipements.filter(equipement => {
      if (!globalQuery) {
        return true;
      }
      
      const query = globalQuery.toLowerCase();
      switch (searchType) {
        case 'nom':
          return equipement.nom?.toLowerCase().includes(query);
        case 'departement':
          return equipement.departement?.nom.toLowerCase().includes(query);
        case 'numSerie':
          return equipement.numSerie?.toLowerCase().includes(query);
        case 'etat':
          return equipement.etat?.toLowerCase().includes(query);
        default:
          return equipement.nom?.toLowerCase().includes(query);
      }
    });

    setFilteredEquipements(filtered);

    if (globalQuery) {
      const matchingDepartements = {};
      Object.entries(equipementsParDepartement).forEach(([departement, eqs]) => {
        if (eqs.some(e => {
          switch (searchType) {
            case 'nom': return e.nom?.toLowerCase().includes(globalQuery.toLowerCase());
            case 'departement': return e.departement?.nom.toLowerCase().includes(globalQuery.toLowerCase());
            case 'numSerie': return e.numSerie?.toLowerCase().includes(globalQuery.toLowerCase());
            case 'etat': return e.etat?.toLowerCase().includes(globalQuery.toLowerCase());
            default: return e.nom?.toLowerCase().includes(globalQuery.toLowerCase());
          }
        })) {
          matchingDepartements[departement] = true;
        }
      });
      setExpandedDepartements(prev => ({ ...prev, ...matchingDepartements }));
    }
  }, [globalQuery, equipements, searchType]);

  const equipementsParDepartement = filteredEquipements.reduce((acc, equipement) => {
    if (equipement.departement?.nom) {
      acc[equipement.departement.nom] = acc[equipement.departement.nom] || [];
      acc[equipement.departement.nom].push(equipement);
    }
    return acc;
  }, {});

  const handlePageChange = (departement, newPage) => {
    setPagination(prev => ({
      ...prev,
      [departement]: {
        ...prev[departement],
        currentPage: newPage
      }
    }));
  };

  const confirmDelete = (equipement) => {
    setEquipementToDelete(equipement);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteEquipement = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !equipementToDelete) return;

      await axios.delete(`http://localhost:4000/apiEquipement/deleteEquipement/${equipementToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchEquipements();
      
      setShowDeletePopup(true);
      setShowDeleteConfirmation(false);
      
      setTimeout(() => {
        setShowDeletePopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleEquipementAdded = async (newEquipement) => {
    try {
      await fetchEquipements();
      setShowAddPopup(true);
      
      if (newEquipement.departement?.nom) {
        setExpandedDepartements(prev => ({
          ...prev,
          [newEquipement.departement.nom]: true
        }));
        
        setTimeout(() => {
          const element = document.getElementById(`departement-${newEquipement.departement.nom}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
      
      setTimeout(() => {
        setShowAddPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la liste des équipements:", error);
    }
  };

  const handleEquipementUpdated = async (updatedEquipement) => {
    try {
      await fetchEquipements();
      setShowUpdatePopup(true);
      setTimeout(() => {
        setShowUpdatePopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la liste des équipements:", error);
    }
  };

  const filterEquipementsByDepartementQuery = (equipements, departement) => {
    const query = departementQueries[departement] || "";
    if (!query.trim()) return equipements;
    
    const searchType = departementSearchType[departement] || 'nom';
    const queryLower = query.toLowerCase();

    return equipements.filter(equipement => {
      if (equipement.departement?.nom !== departement) {
        return false;
      }

      switch (searchType) {
        case 'nom':
          return equipement.nom?.toLowerCase().includes(queryLower);
        case 'numSerie':
          return equipement.numSerie?.toLowerCase().includes(queryLower);
        case 'etat':
          return equipement.etat?.toLowerCase().includes(queryLower);
        default:
          return equipement.nom?.toLowerCase().includes(queryLower);
      }
    });
  };
  
  const getPaginatedEquipements = (departement, equipements) => {
    if (!pagination[departement]) return equipements;
    
    const { currentPage, itemsPerPage } = pagination[departement];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return equipements.slice(startIndex, endIndex);
  };

  const getEtatClass = (etat) => {
    const baseClasses = {
      "fonctionnel": { color: selectedColor, className: "text-green-600 dark:text-green-400" },
      "en maintenance": { color: "#f97316", className: "text-orange-400 dark:text-orange-300" },
      "défectueux": { color: "#dc2626", className: "text-red-600 dark:text-red-400" },
      "default": { color: "#4b5563", className: "text-gray-600 dark:text-gray-400" }
    };
    
    return baseClasses[etat] || baseClasses.default;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const handleShowComposants = (composants) => {
    setSelectedComposants(composants?.length > 0 ? composants.map(c => c._id) : []);
    setShowComposantsModal(true);
  };

  const handleOpenUpdateModal = (equipement) => {
    setEquipementToUpdate(equipement);
    setIsUpdateModalOpen(true);
  };

  const handleShowDescription = (description) => {
    setCurrentDescription(description);
    setShowDescriptionModal(true);
  };

  const handleShowComposantsList = (composants) => {
    setCurrentComposantsList(composants || []);
    setShowComposantsListModal(true);
  };

  const handleShowCapteursList = (capteurs) => {
    setCurrentCapteursList(capteurs || []);
    setShowCapteursListModal(true);
  };

  return (
    <div className={`w-full h-screen p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
      {/* Notifications */}
      {showAddPopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Équipement ajouté avec succès !
        </div>
      )}

      {showDeletePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
        }`}>
          Équipement supprimé avec succès !
        </div>
      )}

      {showUpdatePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Équipement mis à jour avec succès !
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <h3 className="text-xl font-semibold mb-4">Confirmer la suppression</h3>
            <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Êtes-vous sûr de vouloir supprimer l'équipement <span className="font-semibold">{equipementToDelete?.nom}</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className={`px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300 ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-400 hover:bg-gray-300 text-white"
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteEquipement}
                className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                style={{ backgroundColor: selectedColor }}
              >
                <Trash size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de description */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <h3 className="text-xl font-semibold mb-4">Description complète</h3>
            <p className={`mb-6 whitespace-pre-line ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {currentDescription || "Aucune description disponible"}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                style={{ backgroundColor: selectedColor }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale des composants */}
      {showComposantsListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <h3 className="text-xl font-semibold mb-4">
              Liste des composants ({currentComposantsList.length})
            </h3>
            {currentComposantsList.length > 0 ? (
              <ul className="space-y-2 mb-6">
                {currentComposantsList.map((composant, index) => (
                  <li key={index} className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{composant.nom}</div>
                    {composant.type && (
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{composant.type}</div>
                    )}
                    {composant.description && (
                      <div className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{composant.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Aucun composant disponible</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowComposantsListModal(false)}
                className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                style={{ backgroundColor: selectedColor }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale des capteurs */}
      {showCapteursListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <h3 className="text-xl font-semibold mb-4">
              Liste des capteurs ({currentCapteursList.length})
            </h3>
            {currentCapteursList.length > 0 ? (
              <ul className="space-y-2 mb-6">
                {currentCapteursList.map((capteur, index) => (
                  <li key={index} className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{capteur.type}</div>
                    {capteur.emplacement && (
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Emplacement: {capteur.emplacement}</div>
                    )}
                    {capteur.unite && (
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Unité: {capteur.unite}</div>
                    )}
                    {capteur.description && (
                      <div className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{capteur.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Aucun capteur disponible</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowCapteursListModal(false)}
                className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                style={{ backgroundColor: selectedColor }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale des composants (détails) */}
      <ComposantsModal
        isOpen={showComposantsModal}
        onClose={() => {
          setShowComposantsModal(false);
          setSelectedComposants([]);
        }}
        composantIds={selectedComposants}
        selectedColor={selectedColor}
        darkMode={darkMode}
      />

      {/* En-tête avec bouton d'ajout et barre de recherche */}
      <div className="mb-6 flex justify-between items-center">
        {role === "Administrateur" && (
          <button
            className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
            style={{ backgroundColor: selectedColor }}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            Ajouter
          </button>
        )}

        {/* Barre de recherche principale */}
        <div className="relative w-96" ref={filterRef}>
          <SearchBar
            searchType={searchType}
            setSearchType={setSearchType}
            query={globalQuery}
            setQuery={setGlobalQuery}
            showOptions={showSearchOptions}
            setShowOptions={setShowSearchOptions}
            size="large"
            className="shadow-xl"
            hasFocus={globalSearchHasFocus}
            setHasFocus={setGlobalSearchHasFocus}
            darkMode={darkMode}
            selectedColor={selectedColor}
          />
        </div>
      </div>

      {/* Modale d'ajout */}
      <AddEquipementModal
        isModalOpen={isAddModalOpen}
        setIsModalOpen={setIsAddModalOpen}
        onEquipementAdded={handleEquipementAdded}
        selectedColor={selectedColor}
        darkMode={darkMode}
      />

      {/* Modale de mise à jour */}
      {equipementToUpdate && (
        <UpdateEquipementModal
          isModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          equipementToUpdate={equipementToUpdate}
          onEquipementUpdated={handleEquipementUpdated}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      {/* Liste des équipements par département */}
      <div className="space-y-4">
        {Object.entries(equipementsParDepartement).map(([departement, equipements]) => {
          const filteredEquipements = filterEquipementsByDepartementQuery(equipements, departement);
          const paginatedEquipements = getPaginatedEquipements(departement, filteredEquipements);
          const totalPages = Math.ceil(filteredEquipements.length / (pagination[departement]?.itemsPerPage || 3));
          const currentPage = pagination[departement]?.currentPage || 1;
          const currentSearchType = departementSearchType[departement] || 'nom';

          return (
            <div 
              key={departement} 
              id={`departement-${departement}`}
              className={`shadow-xl rounded-2xl overflow-hidden transition-all duration-300 ${
                darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {/* En-tête du département */}
              <div className={`flex justify-between items-center p-4 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}>
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleDepartement(departement)}>
                  <h3 className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>{departement}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}>
                    {filteredEquipements.length} équipement{filteredEquipements.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Barre de recherche et boutons */}
                <div className="flex items-center gap-4">
                  <div 
                    className="relative w-64 transition-all duration-300"
                    ref={el => setDeptFilterRef(departement, el)}
                  >
                    <SearchBar
                      searchType={currentSearchType}
                      setSearchType={(type) => setDepartementFilterType(departement, type)}
                      query={departementQueries[departement] || ""}
                      setQuery={(query) => handleDepartementSearch(departement, query)}
                      showOptions={activeDepartementFilters[departement]}
                      setShowOptions={(show) => setActiveDepartementFilters(prev => ({
                        ...prev,
                        [departement]: show
                      }))}
                      size="default"
                      excludeDepartement={true}
                      hasFocus={focusedDepartementSearch === departement}
                      setHasFocus={(focus) => setFocusedDepartementSearch(focus ? departement : null)}
                      darkMode={darkMode}
                      selectedColor={selectedColor}
                    />
                  </div>
                  
                  {/* Bouton d'expansion */}
                  <button
                    onClick={() => toggleDepartement(departement)}
                    className={`p-2 rounded-full ${
                      expandedDepartements[departement] 
                        ? darkMode 
                          ? "bg-gray-700 text-gray-300" 
                          : "bg-gray-100 text-gray-700" 
                        : darkMode 
                          ? "text-gray-400 hover:bg-gray-700" 
                          : "text-gray-500 hover:bg-gray-100"
                    } transition-colors`}
                  >
                    {expandedDepartements[departement] ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Liste des équipements (si département expansé) */}
              {expandedDepartements[departement] && (
                <>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className={`text-left ${
                          darkMode 
                            ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" 
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
                        }`}>
                          <tr className="h-16">
                            <th className="p-4 font-semibold text-sm w-[12%]">Nom</th>
                            <th className="p-4 font-semibold text-sm w-[12%]">N° Série</th>
                            <th className="p-4 font-semibold text-sm w-[16%]">Description</th>
                            <th className="p-4 font-semibold text-sm w-[12%]">État</th>
                            <th className="p-4 font-semibold text-sm w-[16%]">Composants</th>
                            <th className="p-4 font-semibold text-sm w-[16%]">Capteurs</th>
                            <th className="p-4 font-semibold text-sm w-[8%]">Date Achat</th>
                            <th className="p-4 font-semibold text-sm w-[8%]">Date Ajout</th>
                            <th className="p-4 font-semibold text-sm w-[8%]"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedEquipements.map((equipement, index) => {
                            const etatClass = getEtatClass(equipement.etat);
                            return (
                              <tr key={equipement._id} className={`border-t ${
                                darkMode 
                                  ? index % 2 === 1 
                                    ? "bg-gray-900" 
                                    : "bg-gray-800" 
                                  : index % 2 === 1 
                                    ? "bg-gray-50" 
                                    : "bg-white"
                              } h-16`}>
                                <td className={`p-4 border-b ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                } h-16 overflow-hidden`}>
                                  {equipement.nom || "N/A"}
                                </td>
                                <td className={`p-4 border-b ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                } whitespace-nowrap overflow-hidden text-ellipsis`}>
                                  {equipement.numSerie || "N/A"}
                                </td>
                                <td className={`p-4 border-b ${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                } h-16`}>
                                  {truncateText(equipement.description)}
                                  {equipement.description?.length > 25 && (
                                    <button 
                                      onClick={() => handleShowDescription(equipement.description)}
                                      className={`ml-1 text-sm ${
                                        darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                                      }`}
                                    >
                                      Voir plus
                                    </button>
                                  )}
                                </td>
                                <td className="p-4 border-b h-16">
                                  <span className={`flex items-center gap-2 ${etatClass.className} whitespace-nowrap`}>
                                    <span className="text-lg" style={{ color: etatClass.color }}>•</span> {equipement.etat || "N/A"}
                                  </span>
                                </td>
                                <td className={`p-4 border-b ${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                } h-16`}>
                                  {equipement.composants?.length > 0 ? (
                                    <>
                                      {truncateText(equipement.composants.map(c => c.nom).join(', '))}
                                      {equipement.composants.map(c => c.nom).join(', ').length > 25 && (
                                        <button 
                                          onClick={() => handleShowComposantsList(equipement.composants)}
                                          className={`ml-1 text-sm ${
                                            darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                                          }`}
                                        >
                                          Voir plus
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span>Aucun composant</span>
                                  )}
                                </td>
                                <td className={`p-4 border-b ${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                } h-16`}>
                                  {equipement.composants?.flatMap(c => c.capteurs || []).length > 0 ? (
                                    <>
                                      {truncateText(
                                        equipement.composants
                                          .flatMap(c => c.capteurs || [])
                                          .map(c => c.type)
                                          .join(', ')
                                      )}
                                      {equipement.composants
                                        .flatMap(c => c.capteurs || [])
                                        .map(c => c.type)
                                        .join(', ').length > 25 && (
                                        <button 
                                          onClick={() => handleShowCapteursList(equipement.composants.flatMap(c => c.capteurs || []))}
                                          className={`ml-1 text-sm ${
                                            darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                                          }`}
                                        >
                                          Voir plus
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span>Aucun capteur</span>
                                  )}
                                </td>
                                <td className={`p-4 border-b ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                } h-16`}>{formatDate(equipement.dateAchat)}</td>
                                <td className={`p-4 border-b ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                } h-16`}>{formatDate(equipement.dateAjout)}</td>
                                <td className={`p-4 border-b text-center h-16 ${
                                  darkMode ? "border-gray-700" : "border-gray-200"
                                }`}>
                                  <div className="flex justify-center items-center gap-4">
                                    <button
                                      className="transition duration-200"
                                      style={{ color: selectedColor }}
                                      onClick={() => handleShowComposants(equipement.composants)}
                                    >
                                      <Eye size={20} />
                                    </button>

                                    {role === "Administrateur" && (
                                      <>
                                        <button
                                          className={`transition duration-200 ${
                                            darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                                          }`}
                                          onClick={() => handleOpenUpdateModal(equipement)}
                                        >
                                          <Edit size={20} />
                                        </button>
                                        <button
                                          className={`transition duration-200 ${
                                            darkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"
                                          }`}
                                          onClick={() => confirmDelete(equipement)}
                                        >
                                          <Trash size={20} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center pb-4">
                      <div className={`flex items-center gap-2 rounded-lg p-2 border shadow-sm ${
                        darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-green-100"
                      }`}>
                        <button
                          onClick={() => handlePageChange(departement, currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-md flex items-center justify-center ${
                            currentPage === 1 
                              ? 'text-gray-500 cursor-not-allowed' 
                              : darkMode 
                                ? 'text-green-400 hover:bg-gray-700 hover:text-green-300' 
                                : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                          } transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <div className="flex items-center gap-1 mx-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(departement, page)}
                              className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                                page === currentPage
                                  ? 'text-white shadow-inner'
                                  : darkMode 
                                    ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' 
                                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                              } transition-colors`}
                              style={page === currentPage ? { backgroundColor: selectedColor } : {}}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(departement, currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-md flex items-center justify-center ${
                            currentPage === totalPages 
                              ? 'text-gray-500 cursor-not-allowed' 
                              : darkMode 
                                ? 'text-green-400 hover:bg-gray-700 hover:text-green-300' 
                                : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                          } transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipementList;