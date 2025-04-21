import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Plus, Trash, Edit, Eye, ChevronDown, ChevronUp, X, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AddComposantModal from './AddComposantModal';
import UpdateComposantModal from './UpdateComposantModal';
import ComposantSearchBar from './ComposantSearchBar';
import ComposantReportModal from './ComposantReportModal';

const ComposantList = ({ selectedColor, darkMode }) => {
  // États principaux
  const [composants, setComposants] = useState([]);
  const [filteredComposants, setFilteredComposants] = useState([]);
  const [globalQuery, setGlobalQuery] = useState("");
  const [departementQueries, setDepartementQueries] = useState({});
  const [equipementQueries, setEquipementQueries] = useState({});
  const [role, setRole] = useState("");
  
  // États des modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [composantToUpdate, setComposantToUpdate] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedComposant, setSelectedComposant] = useState(null);
  
  // États des notifications
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  
  // États des modales d'affichage
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [showCapteursListModal, setShowCapteursListModal] = useState(false);
  const [currentCapteursList, setCurrentCapteursList] = useState([]);
  
  // États de l'interface
  const [expandedDepartements, setExpandedDepartements] = useState({});
  const [expandedEquipements, setExpandedEquipements] = useState({});
  const [pagination, setPagination] = useState({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [composantToDelete, setComposantToDelete] = useState(null);
  
  // États du filtrage
  const [searchType, setSearchType] = useState("nom");
  const [departementSearchType, setDepartementSearchType] = useState({});
  const [equipementSearchType, setEquipementSearchType] = useState({});
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [globalSearchHasFocus, setGlobalSearchHasFocus] = useState(false);
  const [activeDepartementFilters, setActiveDepartementFilters] = useState({});
  const [activeEquipementFilters, setActiveEquipementFilters] = useState({});
  const [focusedDepartementSearch, setFocusedDepartementSearch] = useState(null);
  const [focusedEquipementSearch, setFocusedEquipementSearch] = useState(null);

  const navigate = useNavigate();
  const globalFilterRef = useRef(null);
  const departementFilterRefs = useRef({});
  const equipementFilterRefs = useRef({});

  // Fonctions pour gérer les refs
  const setDepartementFilterRef = useCallback((departement, el) => {
    if (el) {
      departementFilterRefs.current[departement] = el;
    } else {
      delete departementFilterRefs.current[departement];
    }
  }, []);

  const setEquipementFilterRef = useCallback((equipement, el) => {
    if (el) {
      equipementFilterRefs.current[equipement] = el;
    } else {
      delete equipementFilterRefs.current[equipement];
    }
  }, []);

  // Gestion du clic en dehors des options de recherche
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (globalFilterRef.current && !globalFilterRef.current.contains(event.target)) {
        setShowSearchOptions(false);
      }
      
      Object.keys(departementFilterRefs.current).forEach(departement => {
        const ref = departementFilterRefs.current[departement];
        if (ref && !ref.contains(event.target)) {
          setActiveDepartementFilters(prev => ({
            ...prev,
            [departement]: false
          }));
          setFocusedDepartementSearch(prev => prev === departement ? null : prev);
        }
      });
      
      Object.keys(equipementFilterRefs.current).forEach(equipement => {
        const ref = equipementFilterRefs.current[equipement];
        if (ref && !ref.contains(event.target)) {
          setActiveEquipementFilters(prev => ({
            ...prev,
            [equipement]: false
          }));
          setFocusedEquipementSearch(prev => prev === equipement ? null : prev);
        }
      });
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fonctions pour gérer l'expansion des sections
  const toggleDepartement = useCallback((departement) => {
    setExpandedDepartements(prev => ({
      ...prev,
      [departement]: !prev[departement]
    }));
  }, []);

  const toggleEquipement = useCallback((equipement) => {
    setExpandedEquipements(prev => ({
      ...prev,
      [equipement]: !prev[equipement]
    }));
  }, []);

  const closeAllDivs = useCallback(() => {
    setExpandedDepartements(prev => 
      Object.keys(prev).reduce((acc, dep) => {
        acc[dep] = false;
        return acc;
      }, {})
    );
    
    setExpandedEquipements(prev => 
      Object.keys(prev).reduce((acc, equip) => {
        acc[equip] = false;
        return acc;
      }, {})
    );
  }, []);

  // Récupération des composants
  const fetchComposants = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trouvé");
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);

      let url = "http://localhost:4000/apiComposant/getComposant";
      if (decodedToken.role === "technicien") {
        url = "http://localhost:4000/apiComposant/getComposantByDepart";
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      
      if (Array.isArray(data)) {
        setComposants(data);
        setFilteredComposants(data);
        
        const newDepartementState = {};
        const newEquipementState = {};
        const paginationInit = {};
        
        data.forEach(composant => {
          const departement = composant.departement?.nom || composant.equipement?.departement?.nom;
          if (departement) {
            newDepartementState[departement] = false;
          }
          if (composant.equipement?.nom) {
            newEquipementState[composant.equipement.nom] = false;
            if (!paginationInit[composant.equipement.nom]) {
              paginationInit[composant.equipement.nom] = {
                currentPage: 1,
                itemsPerPage: 3
              };
            }
          }
        });
        
        setExpandedDepartements(newDepartementState);
        setExpandedEquipements(newEquipementState);
        setPagination(paginationInit);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des composants:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchComposants();
  }, [fetchComposants]);

  // Filtrage global des composants
  useEffect(() => {
    if (globalQuery === "") {
      closeAllDivs();
    }

    const filtered = composants.filter(composant => {
      if (!globalQuery) return true;
      
      const query = globalQuery.toLowerCase();
      const searchFields = {
        'nom': composant.nom,
        'equipement': composant.equipement?.nom,
        'numSerieComposant': composant.numSerieComposant,
        'etat': composant.etat,
        'departement': composant.departement?.nom || composant.equipement?.departement?.nom,
        'fabricant': composant.fabricant,
        'type': composant.type
      };

      return searchFields[searchType]?.toLowerCase().includes(query) || false;
    });

    setFilteredComposants(filtered);

    if (globalQuery) {
      const matchingDepartements = {};
      const matchingEquipements = {};
      
      filtered.forEach(composant => {
        const departement = composant.departement?.nom || composant.equipement?.departement?.nom;
        if (departement) {
          matchingDepartements[departement] = true;
        }
        if (composant.equipement?.nom) {
          matchingEquipements[composant.equipement.nom] = true;
        }
      });
      
      setExpandedDepartements(prev => ({ ...prev, ...matchingDepartements }));
      setExpandedEquipements(prev => ({ ...prev, ...matchingEquipements }));
    }
  }, [globalQuery, composants, searchType, closeAllDivs]);

  // Gestion des recherches par département
  const handleDepartementSearch = (departement, query) => {
    setDepartementQueries(prev => ({
      ...prev,
      [departement]: query
    }));
  
    if (query.trim()) {
      const hasResults = composants.some(c => {
        const compDepartement = c.departement?.nom || c.equipement?.departement?.nom;
        if (compDepartement !== departement) return false;
        
        const searchType = departementSearchType[departement] || 'equipement';
        const fieldValue = 
          searchType === 'equipement' ? c.equipement?.nom :
          searchType === 'etat' ? c.etat :
          c.equipement?.nom;
        
        return fieldValue?.toLowerCase().includes(query.toLowerCase());
      });
  
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

  const toggleDepartementFilter = (departement, event) => {
    event.stopPropagation();
    setActiveDepartementFilters(prev => ({
      ...prev,
      [departement]: !prev[departement]
    }));
  };

  // Gestion des recherches par équipement
  const handleEquipementSearch = (equipement, query) => {
    setEquipementQueries(prev => ({
      ...prev,
      [equipement]: query
    }));
  
    if (query.trim()) {
      setExpandedEquipements(prev => ({
        ...prev,
        [equipement]: true
      }));
    } else {
      setExpandedEquipements(prev => ({
        ...prev,
        [equipement]: false
      }));
    }
  };

  const setEquipementFilterType = (equipement, type) => {
    setEquipementSearchType(prev => ({
      ...prev,
      [equipement]: type
    }));
    setActiveEquipementFilters(prev => ({
      ...prev,
      [equipement]: false
    }));
  };

  const toggleEquipementFilter = (equipement, event) => {
    event.stopPropagation();
    setActiveEquipementFilters(prev => ({
      ...prev,
      [equipement]: !prev[equipement]
    }));
  };

  // Filtrage des composants par département
  const filterComposantsByDepartementQuery = (composants, departement) => {
    const query = departementQueries[departement] || "";
    if (!query.trim()) return composants;
    
    const searchType = departementSearchType[departement] || 'equipement';
    const queryLower = query.toLowerCase();

    return composants.filter(composant => {
      const compDepartement = composant.departement?.nom || composant.equipement?.departement?.nom;
      if (compDepartement !== departement) return false;

      switch (searchType) {
        case 'equipement':
          return composant.equipement?.nom?.toLowerCase().includes(queryLower);
        case 'etat':
          return composant.etat?.toLowerCase().includes(queryLower);
        default:
          return composant.equipement?.nom?.toLowerCase().includes(queryLower);
      }
    });
  };

  // Filtrage des composants par équipement
  const filterComposantsByEquipementQuery = (composants, equipement) => {
    const query = equipementQueries[equipement] || "";
    if (!query.trim()) return composants;
    
    const searchType = equipementSearchType[equipement] || 'nom';
    const queryLower = query.toLowerCase();

    return composants.filter(composant => {
      if (composant.equipement?.nom !== equipement) {
        return false;
      }

      switch (searchType) {
        case 'nom':
          return composant.nom?.toLowerCase().includes(queryLower);
        case 'numSerieComposant':
          return composant.numSerieComposant?.toLowerCase().includes(queryLower);
        case 'etat':
          return composant.etat?.toLowerCase().includes(queryLower);
        default:
          return composant.nom?.toLowerCase().includes(queryLower);
      }
    });
  };

  // Groupement des composants par département puis par équipement
  const groupComposantsByDepartement = useCallback((composantsList) => {
    return composantsList.reduce((acc, composant) => {
      const departement = composant.departement?.nom || composant.equipement?.departement?.nom || "Non affecté";
      const equipement = composant.equipement?.nom || "Non affecté";
      
      if (!acc[departement]) {
        acc[departement] = {};
      }
      
      if (!acc[departement][equipement]) {
        acc[departement][equipement] = [];
      }
      
      acc[departement][equipement].push(composant);
      return acc;
    }, {});
  }, []);

  const groupedComposants = useMemo(() => 
    groupComposantsByDepartement(filteredComposants), 
    [filteredComposants, groupComposantsByDepartement]
  );

  // Gestion de la pagination
  const handlePageChange = useCallback((equipement, newPage) => {
    setPagination(prev => ({
      ...prev,
      [equipement]: {
        ...prev[equipement],
        currentPage: newPage
      }
    }));
  }, []);

  const getPaginatedComposants = useCallback((equipement, composants) => {
    if (!pagination[equipement]) return composants;
    
    const { currentPage, itemsPerPage } = pagination[equipement];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return composants.slice(startIndex, endIndex);
  }, [pagination]);

  // Gestion des suppressions
  const confirmDelete = useCallback((composant) => {
    setComposantToDelete(composant);
    setShowDeleteConfirmation(true);
  }, []);

  const handleDeleteComposant = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !composantToDelete) return;

      await axios.delete(`http://localhost:4000/apiComposant/deleteComposant/${composantToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchComposants();
      
      setShowDeletePopup(true);
      setShowDeleteConfirmation(false);
      
      setTimeout(() => {
        setShowDeletePopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }, [composantToDelete, fetchComposants]);

  // Gestion des ajouts et mises à jour
  const handleComposantAdded = useCallback(async (newComposant) => {
    try {
      await fetchComposants();
      setShowAddPopup(true);
      
      if (newComposant.equipement?.nom) {
        setExpandedEquipements(prev => ({
          ...prev,
          [newComposant.equipement.nom]: true
        }));
        
        const departement = newComposant.departement?.nom || newComposant.equipement?.departement?.nom;
        if (departement) {
          setExpandedDepartements(prev => ({
            ...prev,
            [departement]: true
          }));
        }
        
        setTimeout(() => {
          const element = document.getElementById(`equipement-${newComposant.equipement.nom}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
      
      setTimeout(() => {
        setShowAddPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la liste des composants:", error);
    }
  }, [fetchComposants]);

  const handleComposantUpdated = useCallback(async () => {
    try {
      await fetchComposants();
      setShowUpdatePopup(true);
      setTimeout(() => {
        setShowUpdatePopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la liste des composants:", error);
    }
  }, [fetchComposants]);

  // Fonctions utilitaires
  const getEtatClass = useCallback((etat) => {
    switch (etat) {
      case "fonctionnel": 
        return { color: selectedColor, className: "text-green-600 dark:text-green-400" };
      case "en maintenance": 
        return { color: "#f97316", className: "text-orange-400 dark:text-orange-300" };
      case "déféctueux": 
        return { color: "#dc2626", className: "text-red-600 dark:text-red-400" };
      default: 
        return { color: "#4b5563", className: "text-gray-600 dark:text-gray-400" };
    }
  }, [selectedColor]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  }, []);

  const truncateText = useCallback((text, maxLength = 25) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }, []);

  const handleOpenUpdateModal = useCallback((composant) => {
    setComposantToUpdate(composant);
    setIsUpdateModalOpen(true);
  }, []);

  const handleShowDescription = useCallback((description) => {
    setCurrentDescription(description);
    setShowDescriptionModal(true);
  }, []);

  const handleShowCapteursList = useCallback((capteurs) => {
    setCurrentCapteursList(capteurs || []);
    setShowCapteursListModal(true);
  }, []);

  const handleOpenReportModal = useCallback((composant) => {
    setSelectedComposant(composant);
    setShowReportModal(true);
  }, []);

  return (
    <div className={`w-full h-screen p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
      {/* Notifications */}
      {showAddPopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Composant ajouté avec succès !
        </div>
      )}

      {showDeletePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
        }`}>
          Composant supprimé avec succès !
        </div>
      )}

      {showUpdatePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Composant mis à jour avec succès !
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
              Êtes-vous sûr de vouloir supprimer le composant <span className="font-semibold">{composantToDelete?.nom}</span> ?
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
                onClick={handleDeleteComposant}
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
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{capteur.nom || capteur.type}</div>
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

      {/* En-tête avec bouton d'ajout et barre de recherche */}
      <div className="mb-6 flex justify-between items-center">
        {role === "Administrateur" && (
          <button
            className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
            style={{ backgroundColor: selectedColor }}
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Ajouter un nouveau composant"
          >
            <Plus size={20} />
            Ajouter
          </button>
        )}

        <div className="relative w-96" ref={globalFilterRef}>
          <ComposantSearchBar
            searchType={searchType}
            setSearchType={setSearchType}
            query={globalQuery}
            setQuery={setGlobalQuery}
            showOptions={showSearchOptions}
            setShowOptions={setShowSearchOptions}
            size="large"
            className={`shadow-xl ${darkMode ? 'ring-1 ring-gray-600' : 'ring-1 ring-gray-200'}`}
            hasFocus={globalSearchHasFocus}
            setHasFocus={setGlobalSearchHasFocus}
            darkMode={darkMode}
            selectedColor={selectedColor}
            includeAllFields={true}

          />
        </div>
      </div>

      {/* Modale d'ajout */}
      <AddComposantModal
        isModalOpen={isAddModalOpen}
        setIsModalOpen={setIsAddModalOpen}
        onComposantAdded={handleComposantAdded}
        selectedColor={selectedColor}
        darkMode={darkMode}
      />

      {/* Modale de rapport */}
      {selectedComposant && (
        <ComposantReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          composant={selectedComposant}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      {/* Modale de mise à jour */}
      {composantToUpdate && (
        <UpdateComposantModal
          isModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          composantToUpdate={composantToUpdate}
          onComposantUpdated={handleComposantUpdated}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      {/* Liste des composants groupés par département puis par équipement */}
      <div className="space-y-6">
        {Object.entries(groupedComposants).map(([departement, equipements]) => {
          const filteredByDepartement = filterComposantsByDepartementQuery(
            Object.values(equipements).flat(),
            departement
          );
          
          const hasResults = filteredByDepartement.length > 0 || departementQueries[departement]?.trim();

          return (
            <div key={departement} className={`shadow-xl rounded-2xl overflow-hidden ${
              darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
              {/* En-tête du département */}
              <div 
                className={`flex justify-between items-center p-4 border-b ${
                  darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => toggleDepartement(departement)}
                aria-expanded={expandedDepartements[departement]}
              >
                <div className="flex items-center gap-4">
                  <h2 className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>{departement}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}>
                    {filteredByDepartement.length} composant{filteredByDepartement.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Barre de recherche pour le département */}
                  <div 
                    className="relative w-64 transition-all duration-300"
                    ref={el => setDepartementFilterRef(departement, el)}
                  >
                    <ComposantSearchBar
                      searchType={departementSearchType[departement] || 'equipement'}
                      setSearchType={(type) => setDepartementFilterType(departement, type)}
                      query={departementQueries[departement] || ""}
                      setQuery={(query) => handleDepartementSearch(departement, query)}
                      showOptions={activeDepartementFilters[departement]}
                      setShowOptions={(show) => setActiveDepartementFilters(prev => ({
                        ...prev,
                        [departement]: show
                      }))}
                      size="small"
                      includeEquipementAndEtat={true}
                      hasFocus={focusedDepartementSearch === departement}
                      setHasFocus={(focus) => setFocusedDepartementSearch(focus ? departement : null)}
                      darkMode={darkMode}
                      selectedColor={selectedColor}
                    />
                  </div>
                  
                  <button 
                    className={`p-2 rounded-full ${
                      darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
                    } transition-colors`}
                    aria-label={expandedDepartements[departement] ? "Réduire la section" : "Développer la section"}
                  >
                    {expandedDepartements[departement] ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </button>
                </div>
              </div>

              {/* Liste des équipements (si département expansé) */}
              {expandedDepartements[departement] && (
                <div className={`space-y-4 p-4 ${
                  darkMode ? "dark:bg-gray-800" : "bg-white"
                }`}>
                  {Object.entries(equipements).map(([equipement, composants]) => {
                    const filteredComposants = filterComposantsByEquipementQuery(
                      filterComposantsByDepartementQuery(composants, departement),
                      equipement
                    );
                    
                    const paginatedComposants = getPaginatedComposants(equipement, filteredComposants);
                    const totalPages = Math.ceil(filteredComposants.length / (pagination[equipement]?.itemsPerPage || 3));
                    const currentPage = pagination[equipement]?.currentPage || 1;
                    const currentSearchType = equipementSearchType[equipement] || 'nom';

                    return (
                      <div 
                        key={equipement} 
                        id={`equipement-${equipement}`}
                        className={`rounded-xl overflow-hidden border ${
                          darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {/* En-tête de l'équipement */}
                        <div className={`flex justify-between items-center p-4 border-b ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}>
                          <div 
                            className="flex items-center gap-4 cursor-pointer" 
                            onClick={() => toggleEquipement(equipement)}
                          >
                            <h3 className={`text-lg font-semibold ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}>{equipement}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
                            }`}>
                              {filteredComposants.length} composant{filteredComposants.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* Barre de recherche pour l'équipement */}
                            <div 
                              className="relative w-64 transition-all duration-300"
                              ref={el => setEquipementFilterRef(equipement, el)}
                            >
                              <ComposantSearchBar
                                searchType={currentSearchType}
                                setSearchType={(type) => setEquipementFilterType(equipement, type)}
                                query={equipementQueries[equipement] || ""}
                                setQuery={(query) => handleEquipementSearch(equipement, query)}
                                showOptions={activeEquipementFilters[equipement]}
                                setShowOptions={(show) => setActiveEquipementFilters(prev => ({
                                  ...prev,
                                  [equipement]: show
                                }))}
                                size="small"
                                includeComposantFields={true}
                                hasFocus={focusedEquipementSearch === equipement}
                                setHasFocus={(focus) => setFocusedEquipementSearch(focus ? equipement : null)}
                                darkMode={darkMode}
                                selectedColor={selectedColor}
                              />
                            </div>
                            
                            {/* Bouton d'expansion */}
                            <button
                              onClick={() => toggleEquipement(equipement)}
                              className={`p-2 rounded-full ${
                                expandedEquipements[equipement] 
                                  ? darkMode 
                                    ? "bg-gray-600 text-gray-300" 
                                    : "bg-gray-200 text-gray-700" 
                                  : darkMode 
                                    ? "text-gray-400 hover:bg-gray-600" 
                                    : "text-gray-500 hover:bg-gray-200"
                              } transition-colors`}
                              aria-label={expandedEquipements[equipement] ? "Réduire la section" : "Développer la section"}
                            >
                              {expandedEquipements[equipement] ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Liste des composants (si équipement expansé) */}
                        {expandedEquipements[equipement] && (
                          <>
                            {filteredComposants.length > 0 ? (
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
                                          <th className="p-4 font-semibold text-sm w-[10%]">Nom</th>
                                          <th className="p-4 font-semibold text-sm w-[10%]">N° Série</th>
                                          <th className="p-4 font-semibold text-sm w-[15%]">Description</th>
                                          <th className="p-4 font-semibold text-sm w-[8%]">Type</th>
                                          <th className="p-4 font-semibold text-sm w-[10%]">Fabricant</th>
                                          <th className="p-4 font-semibold text-sm w-[15%]">Capteurs</th>
                                          <th className="p-4 font-semibold text-sm w-[8%]">État</th>
                                          <th className="p-4 font-semibold text-sm w-[10%]">Date Installation</th>
                                          <th className="p-4 font-semibold text-sm w-[10%]">Date Ajout</th>
                                          <th className="p-4 font-semibold text-sm w-[10%]">Date Expiration</th>
                                          <th className="p-4 font-semibold text-sm w-[10%]"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paginatedComposants.map((composant, index) => {
                                          const etatClass = getEtatClass(composant.etat);
                                          return (
                                            <tr 
                                              key={composant._id} 
                                              className={`border-t ${
                                                darkMode 
                                                  ? index % 2 === 1 
                                                    ? "bg-gray-900" 
                                                    : "bg-gray-800" 
                                                  : index % 2 === 1 
                                                    ? "bg-gray-50" 
                                                    : "bg-white"
                                              } h-16`}
                                            >
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-700"
                                              } overflow-hidden`}>
                                                {composant.nom || "N/A"}
                                              </td>
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-700"
                                              } whitespace-nowrap overflow-hidden text-ellipsis`}>
                                                {composant.numSerieComposant || "N/A"}
                                              </td>
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-600"
                                              }`}>
                                                {truncateText(composant.description)}
                                                {composant.description?.length > 25 && (
                                                  <button 
                                                    onClick={() => handleShowDescription(composant.description)}
                                                    className={`ml-1 text-sm ${
                                                      darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                                                    }`}
                                                    aria-label="Voir la description complète"
                                                  >
                                                    Voir plus
                                                  </button>
                                                )}
                                              </td>
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-600"
                                              }`}>
                                                {composant.type || "N/A"}
                                              </td>
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-600"
                                              }`}>
                                                {composant.fabricant || "N/A"}
                                              </td>
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-600"
                                              }`}>
                                                {composant.capteurs?.length > 0 ? (
                                                  <div className="flex flex-col">
                                                    <span>{composant.capteurs[0].nom || composant.capteurs[0].type}</span>
                                                    {composant.capteurs.length > 1 && (
                                                      <button 
                                                        onClick={() => handleShowCapteursList(composant.capteurs)}
                                                        className={`text-sm mt-1 ${
                                                          darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                                                        }`}
                                                        aria-label="Voir la liste des capteurs"
                                                      >
                                                        Voir plus ({composant.capteurs.length - 1})
                                                      </button>
                                                    )}
                                                  </div>
                                                ) : (
                                                  "Aucun"
                                                )}
                                              </td>
                                              <td className="p-4 border-b">
                                                <span className={`flex items-center gap-2 ${etatClass.className} whitespace-nowrap`}>
                                                  <span className="text-lg" style={{ color: etatClass.color }}>•</span> 
                                                  {composant.etat || "N/A"}
                                                </span>
                                              </td>
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-700"
                                              }`}>
                                                {formatDate(composant.dateInstallation)}
                                              </td>
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-700"
                                              }`}>
                                                {formatDate(composant.createdAt)}
                                              </td>
                                              <td className={`p-4 border-b ${
                                                darkMode ? "text-gray-300" : "text-gray-700"
                                              }`}>
                                                {formatDate(composant.delaiExpi)}
                                              </td>
                                              <td className={`p-4 border-b text-center ${
                                                darkMode ? "border-gray-700" : "border-gray-200"
                                              }`}>
                                                <div className="flex justify-center items-center gap-4">
                                                  <button
                                                    className="transition duration-200"
                                                    style={{ color: selectedColor }}
                                                    onClick={() => handleOpenReportModal(composant)}
                                                    title="Voir le rapport"
                                                    aria-label={`Voir le rapport pour ${composant.nom}`}
                                                  >
                                                    <Eye size={20} />
                                                  </button>
                                                  {role === "Administrateur" && (
                                                    <>
                                                      <button
                                                        className={`transition duration-200 ${
                                                          darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                                                        }`}
                                                        onClick={() => handleOpenUpdateModal(composant)}
                                                        title="Modifier"
                                                        aria-label={`Modifier ${composant.nom}`}
                                                      >
                                                        <Edit size={20} />
                                                      </button>
                                                      <button
                                                        className={`transition duration-200 ${
                                                          darkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"
                                                        }`}
                                                        onClick={() => confirmDelete(composant)}
                                                        title="Supprimer"
                                                        aria-label={`Supprimer ${composant.nom}`}
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
                                        onClick={() => handlePageChange(equipement, currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-md flex items-center justify-center ${
                                          currentPage === 1 
                                            ? 'text-gray-500 cursor-not-allowed' 
                                            : darkMode 
                                              ? 'text-green-400 hover:bg-gray-700 hover:text-green-300' 
                                              : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                                        } transition-colors`}
                                        aria-label="Page précédente"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                      
                                      <div className="flex items-center gap-1 mx-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                          <button
                                            key={page}
                                            onClick={() => handlePageChange(equipement, page)}
                                            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                                              page === currentPage
                                                ? 'text-white shadow-inner'
                                                : darkMode 
                                                  ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' 
                                                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                            } transition-colors`}
                                            style={page === currentPage ? { backgroundColor: selectedColor } : {}}
                                            aria-label={`Page ${page}`}
                                            aria-current={page === currentPage ? "page" : undefined}
                                          >
                                            {page}
                                          </button>
                                        ))}
                                      </div>
                                      
                                      <button
                                        onClick={() => handlePageChange(equipement, currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-md flex items-center justify-center ${
                                          currentPage === totalPages 
                                            ? 'text-gray-500 cursor-not-allowed' 
                                            : darkMode 
                                              ? 'text-green-400 hover:bg-gray-700 hover:text-green-300' 
                                              : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                                        } transition-colors`}
                                        aria-label="Page suivante"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="p-4 text-center">
                                <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  Aucun composant ne correspond aux critères de recherche
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComposantList;