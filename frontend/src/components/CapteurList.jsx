import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Plus, Trash, Edit, Eye, ChevronDown, ChevronUp, X, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AddCapteurModal from './AddCapteurModal';
import UpdateCapteurModal from './UpdateCapteurModal';
import CapteurSearchBar from './CapteurSearchBar';
import CapteurReportModal from './CapteurReportModal';

const CapteurList = ({ selectedColor, darkMode }) => {
  const [capteurs, setCapteurs] = useState([]);
  const [filteredCapteurs, setFilteredCapteurs] = useState([]);
  const [globalQuery, setGlobalQuery] = useState("");
  const [typeQueries, setTypeQueries] = useState({});
  const [composantQueries, setComposantQueries] = useState({});
  const [role, setRole] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [capteurToUpdate, setCapteurToUpdate] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCapteur, setSelectedCapteur] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [expandedTypes, setExpandedTypes] = useState({});
  const [expandedComposants, setExpandedComposants] = useState({});
  const [pagination, setPagination] = useState({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [capteurToDelete, setCapteurToDelete] = useState(null);
  const [searchType, setSearchType] = useState("numSerie");
  const [typeSearchType, setTypeSearchType] = useState({});
  const [composantSearchType, setComposantSearchType] = useState({});
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [globalSearchHasFocus, setGlobalSearchHasFocus] = useState(false);
  const [activeTypeFilters, setActiveTypeFilters] = useState({});
  const [activeComposantFilters, setActiveComposantFilters] = useState({});
  const [focusedTypeSearch, setFocusedTypeSearch] = useState(null);
  const [focusedComposantSearch, setFocusedComposantSearch] = useState(null);

  const navigate = useNavigate();
  const globalFilterRef = useRef(null);
  const typeFilterRefs = useRef({});
  const composantFilterRefs = useRef({});

  const setTypeFilterRef = useCallback((type, el) => {
    if (el) {
      typeFilterRefs.current[type] = el;
    } else {
      delete typeFilterRefs.current[type];
    }
  }, []);

  const setComposantFilterRef = useCallback((composant, el) => {
    if (el) {
      composantFilterRefs.current[composant] = el;
    } else {
      delete composantFilterRefs.current[composant];
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (globalFilterRef.current && !globalFilterRef.current.contains(event.target)) {
        setShowSearchOptions(false);
      }
      
      Object.keys(typeFilterRefs.current).forEach(type => {
        const ref = typeFilterRefs.current[type];
        if (ref && !ref.contains(event.target)) {
          setActiveTypeFilters(prev => ({
            ...prev,
            [type]: false
          }));
          setFocusedTypeSearch(prev => prev === type ? null : prev);
        }
      });

      Object.keys(composantFilterRefs.current).forEach(composant => {
        const ref = composantFilterRefs.current[composant];
        if (ref && !ref.contains(event.target)) {
          setActiveComposantFilters(prev => ({
            ...prev,
            [composant]: false
          }));
          setFocusedComposantSearch(prev => prev === composant ? null : prev);
        }
      });
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleType = useCallback((type) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  }, []);

  const toggleComposant = useCallback((composant) => {
    setExpandedComposants(prev => ({
      ...prev,
      [composant]: !prev[composant]
    }));
  }, []);

  const closeAllDivs = useCallback(() => {
    setExpandedTypes(prev => 
      Object.keys(prev).reduce((acc, type) => {
        acc[type] = false;
        return acc;
      }, {})
    );
    setExpandedComposants(prev => 
      Object.keys(prev).reduce((acc, composant) => {
        acc[composant] = false;
        return acc;
      }, {})
    );
  }, []);

  const fetchCapteurs = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trouvé");
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);

      let url = "http://localhost:4000/apiCapteur/getCapteur";
      if (decodedToken.role === "technicien") {
        url = "http://localhost:4000/apiCapteur/getCapteurByTechnicien";
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      
      if (Array.isArray(data)) {
        setCapteurs(data);
        setFilteredCapteurs(data);
        
        const newTypeState = {};
        const newComposantState = {};
        const paginationInit = {};
        
        data.forEach(capteur => {
          const type = capteur.type || "Autre";
          const composant = capteur.composant?.nom || "Autre";
          
          if (type) {
            newTypeState[type] = false;
            if (!paginationInit[type]) {
              paginationInit[type] = {
                currentPage: 1,
                itemsPerPage: 3
              };
            }
          }
          
          if (composant) {
            newComposantState[composant] = false;
            if (!paginationInit[composant]) {
              paginationInit[composant] = {
                currentPage: 1,
                itemsPerPage: 3
              };
            }
          }
        });
        
        setExpandedTypes(newTypeState);
        setExpandedComposants(newComposantState);
        setPagination(paginationInit);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des capteurs:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchCapteurs();
  }, [fetchCapteurs]);

  useEffect(() => {
    if (globalQuery === "") {
      closeAllDivs();
    }

    const filtered = capteurs.filter(capteur => {
      if (!globalQuery) return true;
      
      const query = globalQuery.toLowerCase();
      const searchFields = {
        'numSerie': capteur.numSerie,
        'type': capteur.type,
        'description': capteur.description,
        'departement': capteur.composant?.departement?.nom || capteur.composant?.equipement?.departement?.nom,
        'composant': capteur.composant?.nom,
        'equipement': capteur.composant?.equipement?.nom
      };

      return searchFields[searchType]?.toLowerCase().includes(query) || false;
    });

    setFilteredCapteurs(filtered);

    if (globalQuery) {
      const matchingTypes = {};
      const matchingComposants = {};
      
      filtered.forEach(capteur => {
        const type = capteur.type || "Autre";
        const composant = capteur.composant?.nom || "Autre";
        
        if (type) {
          matchingTypes[type] = true;
        }
        if (composant) {
          matchingComposants[composant] = true;
        }
      });
      
      setExpandedTypes(prev => ({ ...prev, ...matchingTypes }));
      setExpandedComposants(prev => ({ ...prev, ...matchingComposants }));
    }
  }, [globalQuery, capteurs, searchType, closeAllDivs]);

  const handleTypeSearch = (type, query) => {
    setTypeQueries(prev => ({
      ...prev,
      [type]: query
    }));
  
    if (query.trim()) {
      const hasResults = capteurs.some(c => {
        const capteurType = c.type || "Autre";
        if (capteurType !== type) return false;
        
        const searchType = typeSearchType[type] || 'numSerie';
        const fieldValue = 
          searchType === 'numSerie' ? c.numSerie :
          searchType === 'departement' ? (c.composant?.departement?.nom || c.composant?.equipement?.departement?.nom || "") :
          searchType === 'equipement' ? (c.composant?.equipement?.nom || "") :
          c.numSerie;
        
        return fieldValue?.toLowerCase().includes(query.toLowerCase());
      });
  
      setExpandedTypes(prev => ({
        ...prev,
        [type]: hasResults ? true : prev[type]
      }));
    } else {
      setExpandedTypes(prev => ({
        ...prev,
        [type]: false
      }));
    }
  };

  const handleComposantSearch = (composant, query) => {
    setComposantQueries(prev => ({
      ...prev,
      [composant]: query
    }));
  
    if (query.trim()) {
      const hasResults = capteurs.some(c => {
        const capteurComposant = c.composant?.nom || "Autre";
        if (capteurComposant !== composant) return false;
        
        const searchType = composantSearchType[composant] || 'dateInstallation';
        const fieldValue = 
          searchType === 'dateInstallation' ? formatDate(c.dateInstallation) :
          searchType === 'description' ? c.description :
          searchType === 'numSerie' ? c.numSerie :
          searchType === 'equipement' ? (c.composant?.equipement?.nom || "") :
          formatDate(c.dateInstallation);
        
        return fieldValue?.toLowerCase().includes(query.toLowerCase());
      });
  
      setExpandedComposants(prev => ({
        ...prev,
        [composant]: hasResults ? true : prev[composant]
      }));
    } else {
      setExpandedComposants(prev => ({
        ...prev,
        [composant]: false
      }));
    }
  };

  const setTypeFilterType = (type, searchType) => {
    setTypeSearchType(prev => ({
      ...prev,
      [type]: searchType
    }));
    setActiveTypeFilters(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const setComposantFilterType = (composant, searchType) => {
    setComposantSearchType(prev => ({
      ...prev,
      [composant]: searchType
    }));
    setActiveComposantFilters(prev => ({
      ...prev,
      [composant]: false
    }));
  };

  const toggleTypeFilter = (type, event) => {
    event.stopPropagation();
    setActiveTypeFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const toggleComposantFilter = (composant, event) => {
    event.stopPropagation();
    setActiveComposantFilters(prev => ({
      ...prev,
      [composant]: !prev[composant]
    }));
  };

  const filterCapteursByTypeQuery = (capteurs, type) => {
    const query = typeQueries[type] || "";
    if (!query.trim()) return capteurs;
    
    const searchType = typeSearchType[type] || 'numSerie';
    const queryLower = query.toLowerCase();

    return capteurs.filter(capteur => {
      const capteurType = capteur.type || "Autre";
      if (capteurType !== type) return false;

      switch (searchType) {
        case 'numSerie':
          return capteur.numSerie?.toLowerCase().includes(queryLower);
        case 'departement':
          return (capteur.composant?.departement?.nom || capteur.composant?.equipement?.departement?.nom || "")
            .toLowerCase().includes(queryLower);
        case 'equipement':
          return (capteur.composant?.equipement?.nom || "")
            .toLowerCase().includes(queryLower);
        default:
          return capteur.numSerie?.toLowerCase().includes(queryLower);
      }
    });
  };

  const filterCapteursByComposantQuery = (capteurs, composant) => {
    const query = composantQueries[composant] || "";
    if (!query.trim()) return capteurs;
    
    const searchType = composantSearchType[composant] || 'dateInstallation';
    const queryLower = query.toLowerCase();

    return capteurs.filter(capteur => {
      const capteurComposant = capteur.composant?.nom || "Autre";
      if (capteurComposant !== composant) return false;

      switch (searchType) {
        case 'dateInstallation':
          return formatDate(capteur.dateInstallation).toLowerCase().includes(queryLower);
        case 'description':
          return capteur.description?.toLowerCase().includes(queryLower);
        case 'numSerie':
          return capteur.numSerie?.toLowerCase().includes(queryLower);
        case 'equipement':
          return (capteur.composant?.equipement?.nom || "")
            .toLowerCase().includes(queryLower);
        default:
          return formatDate(capteur.dateInstallation).toLowerCase().includes(queryLower);
      }
    });
  };

  const groupCapteursByType = useCallback((capteursList) => {
    return capteursList.reduce((acc, capteur) => {
      const type = capteur.type || "Autre";
      const composant = capteur.composant?.nom || "Autre";
      
      if (!acc[type]) {
        acc[type] = {};
      }
      
      if (!acc[type][composant]) {
        acc[type][composant] = [];
      }
      
      acc[type][composant].push(capteur);
      return acc;
    }, {});
  }, []);

  const groupedCapteurs = useMemo(() => 
    groupCapteursByType(filteredCapteurs), 
    [filteredCapteurs, groupCapteursByType]
  );

  const handlePageChange = useCallback((type, newPage) => {
    setPagination(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        currentPage: newPage
      }
    }));
  }, []);

  const getPaginatedCapteurs = useCallback((type, capteurs) => {
    if (!pagination[type]) return capteurs;
    
    const { currentPage, itemsPerPage } = pagination[type];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return capteurs.slice(startIndex, endIndex);
  }, [pagination]);

  const confirmDelete = useCallback((capteur) => {
    setCapteurToDelete(capteur);
    setShowDeleteConfirmation(true);
  }, []);

  const handleDeleteCapteur = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !capteurToDelete) return;

      await axios.delete(`http://localhost:4000/apiCapteur/deleteCapteur/${capteurToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchCapteurs();
      
      setShowDeletePopup(true);
      setShowDeleteConfirmation(false);
      
      setTimeout(() => {
        setShowDeletePopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }, [capteurToDelete, fetchCapteurs]);

  const handleCapteurAdded = useCallback(async (newCapteur) => {
    try {
      await fetchCapteurs();
      setShowAddPopup(true);
      
      const type = newCapteur.type || "Autre";
      const composant = newCapteur.composant?.nom || "Autre";
      
      if (type) {
        setExpandedTypes(prev => ({
          ...prev,
          [type]: true
        }));
      }
      
      if (composant) {
        setExpandedComposants(prev => ({
          ...prev,
          [composant]: true
        }));
      }
      
      setTimeout(() => {
        const element = document.getElementById(`type-${type}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      
      setTimeout(() => {
        setShowAddPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la liste des capteurs:", error);
    }
  }, [fetchCapteurs]);

  const handleCapteurUpdated = useCallback(async () => {
    try {
      await fetchCapteurs();
      setShowUpdatePopup(true);
      setTimeout(() => {
        setShowUpdatePopup(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la liste des capteurs:", error);
    }
  }, [fetchCapteurs]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return "N/A";
    }
  }, []);

  const truncateText = useCallback((text, maxLength = 25) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }, []);

  const handleOpenUpdateModal = useCallback((capteur) => {
    setCapteurToUpdate(capteur);
    setIsUpdateModalOpen(true);
  }, []);

  const handleShowDescription = useCallback((description) => {
    setCurrentDescription(description);
    setShowDescriptionModal(true);
  }, []);

  const handleOpenReportModal = useCallback((capteur) => {
    setSelectedCapteur(capteur);
    setShowReportModal(true);
  }, []);

  return (
    <div className={`w-full h-screen p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
      {showAddPopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Capteur ajouté avec succès !
        </div>
      )}

      {showDeletePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
        }`}>
          Capteur supprimé avec succès !
        </div>
      )}

      {showUpdatePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Capteur mis à jour avec succès !
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <h3 className="text-xl font-semibold mb-4">Confirmer la suppression</h3>
            <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Êtes-vous sûr de vouloir supprimer le capteur <span className="font-semibold">{capteurToDelete?.numSerie}</span> ?
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
                onClick={handleDeleteCapteur}
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

      <div className="mb-6 flex justify-between items-center">
        {role === "Administrateur" && (
          <button
            className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
            style={{ backgroundColor: selectedColor }}
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Ajouter un nouveau capteur"
          >
            <Plus size={20} />
            Ajouter
          </button>
        )}

        <div className="relative w-96" ref={globalFilterRef}>
          <CapteurSearchBar
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

      <AddCapteurModal
        isModalOpen={isAddModalOpen}
        setIsModalOpen={setIsAddModalOpen}
        onCapteurAdded={handleCapteurAdded}
        selectedColor={selectedColor}
        darkMode={darkMode}
      />

      {selectedCapteur && (
        <CapteurReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          capteur={selectedCapteur}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      {capteurToUpdate && (
        <UpdateCapteurModal
          isModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          capteurToUpdate={capteurToUpdate}
          onCapteurUpdated={handleCapteurUpdated}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      <div className="space-y-6">
        {Object.entries(groupedCapteurs).map(([type, composants]) => {
          const filteredByType = filterCapteursByTypeQuery(
            Object.values(composants).flat(),
            type
          );
          
          const hasResults = filteredByType.length > 0 || typeQueries[type]?.trim();

          return (
            <div key={`type-${type}`} id={`type-${type}`} className={`shadow-xl rounded-2xl overflow-hidden ${
              darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <div 
                className={`flex justify-between items-center p-4 border-b ${
                  darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => toggleType(type)}
                aria-expanded={expandedTypes[type]}
              >
                <div className="flex items-center gap-4">
                  <h2 className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>{type}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}>
                    {filteredByType.length} capteur{filteredByType.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div 
                    className="relative w-64 transition-all duration-300"
                    ref={el => setTypeFilterRef(type, el)}
                  >
                    <CapteurSearchBar
                      searchType={typeSearchType[type] || 'numSerie'}
                      setSearchType={(searchType) => setTypeFilterType(type, searchType)}
                      query={typeQueries[type] || ""}
                      setQuery={(query) => handleTypeSearch(type, query)}
                      showOptions={activeTypeFilters[type]}
                      setShowOptions={(show) => setActiveTypeFilters(prev => ({
                        ...prev,
                        [type]: show
                      }))}
                      size="small"
                      includeCapteurFields={true}
                      hasFocus={focusedTypeSearch === type}
                      setHasFocus={(focus) => setFocusedTypeSearch(focus ? type : null)}
                      darkMode={darkMode}
                      selectedColor={selectedColor}
                    />
                  </div>
                  
                  <button 
                    className={`p-2 rounded-full ${
                      darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
                    } transition-colors`}
                    aria-label={expandedTypes[type] ? "Réduire la section" : "Développer la section"}
                  >
                    {expandedTypes[type] ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </button>
                </div>
              </div>

              {expandedTypes[type] && (
                <div className={`space-y-4 p-4 ${
                  darkMode ? "dark:bg-gray-800" : "bg-white"
                }`}>
                  {Object.entries(composants).map(([composant, capteurs]) => {
                    const filteredByComposant = filterCapteursByComposantQuery(
                      filterCapteursByTypeQuery(capteurs, type),
                      composant
                    );
                    
                    const paginatedCapteurs = getPaginatedCapteurs(type, filteredByComposant);
                    const totalPages = Math.ceil(filteredByComposant.length / (pagination[type]?.itemsPerPage || 3));
                    const currentPage = pagination[type]?.currentPage || 1;
                    const currentSearchType = composantSearchType[composant] || 'dateInstallation';

                    return (
                      <div 
                        key={`composant-${composant}`} 
                        id={`composant-${composant}`}
                        className={`rounded-xl overflow-hidden border ${
                          darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className={`flex justify-between items-center p-4 border-b ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}>
                          <div 
                            className="flex items-center gap-4 cursor-pointer" 
                            onClick={() => toggleComposant(composant)}
                          >
                            <h3 className={`text-lg font-semibold ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}>{composant}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
                            }`}>
                              {filteredByComposant.length} capteur{filteredByComposant.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div 
                              className="relative w-64 transition-all duration-300"
                              ref={el => setComposantFilterRef(composant, el)}
                            >
                              <CapteurSearchBar
                                searchType={currentSearchType}
                                setSearchType={(type) => setComposantFilterType(composant, type)}
                                query={composantQueries[composant] || ""}
                                setQuery={(query) => handleComposantSearch(composant, query)}
                                showOptions={activeComposantFilters[composant]}
                                setShowOptions={(show) => setActiveComposantFilters(prev => ({
                                  ...prev,
                                  [composant]: show
                                }))}
                                size="small"
                                hasFocus={focusedComposantSearch === composant}
                                setHasFocus={(focus) => setFocusedComposantSearch(focus ? composant : null)}
                                darkMode={darkMode}
                                selectedColor={selectedColor}
                              />
                            </div>
                            
                            <button
                              onClick={() => toggleComposant(composant)}
                              className={`p-2 rounded-full ${
                                expandedComposants[composant] 
                                  ? darkMode 
                                    ? "bg-gray-600 text-gray-300" 
                                    : "bg-gray-200 text-gray-700" 
                                  : darkMode 
                                    ? "text-gray-400 hover:bg-gray-600" 
                                    : "text-gray-500 hover:bg-gray-200"
                              } transition-colors`}
                              aria-label={expandedComposants[composant] ? "Réduire la section" : "Développer la section"}
                            >
                              {expandedComposants[composant] ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </div>
                        </div>

                        {expandedComposants[composant] && (
                          <>
                            {filteredByComposant.length > 0 ? (
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
                                          <th className="p-4 font-semibold text-sm w-[12%]">N° Série</th>
                                          <th className="p-4 font-semibold text-sm w-[18%]">Description</th>
                                          <th className="p-4 font-semibold text-sm w-[15%]">Département</th>
                                          <th className="p-4 font-semibold text-sm w-[15%]">Équipement</th>
                                          <th className="p-4 font-semibold text-sm w-[15%]">Date Installation</th>
                                          <th className="p-4 font-semibold text-sm w-[10%]"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paginatedCapteurs.map((capteur, index) => (
                                          <tr 
                                            key={capteur._id} 
                                            className={`border-t ${
                                              darkMode 
                                                ? index % 2 === 1 
                                                  ? "bg-gray-800" 
                                                  : "bg-gray-700" 
                                                : index % 2 === 1 
                                                  ? "bg-gray-50" 
                                                  : "bg-white"
                                            } h-16`}
                                          >
                                            <td className={`p-4 border-b ${
                                              darkMode ? "text-gray-300" : "text-gray-700"
                                            } whitespace-nowrap overflow-hidden text-ellipsis`}>
                                              {capteur.numSerie || "N/A"}
                                            </td>
                                            <td className={`p-4 border-b ${
                                              darkMode ? "text-gray-300" : "text-gray-600"
                                            }`}>
                                              {truncateText(capteur.description)}
                                              {capteur.description?.length > 25 && (
                                                <button 
                                                  onClick={() => handleShowDescription(capteur.description)}
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
                                              {capteur.composant?.departement?.nom || capteur.composant?.equipement?.departement?.nom || "N/A"}
                                            </td>
                                            <td className={`p-4 border-b ${
                                              darkMode ? "text-gray-300" : "text-gray-600"
                                            }`}>
                                              {capteur.composant?.equipement?.nom || "N/A"}
                                            </td>
                                            <td className={`p-4 border-b ${
                                              darkMode ? "text-gray-300" : "text-gray-700"
                                            }`}>
                                              {formatDate(capteur.dateInstallation)}
                                            </td>
                                            <td className={`p-4 border-b text-center ${
                                              darkMode ? "border-gray-600" : "border-gray-200"
                                            }`}>
                                             <div className="flex justify-center items-center gap-4">
                                                <button
                                                    className="transition duration-200"
                                                    style={{ color: selectedColor }}
                                                    onClick={() => handleOpenReportModal(capteur)}
                                                    title="Voir le rapport"
                                                    aria-label={`Voir le rapport pour ${capteur.numSerie}`}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                {role === "Administrateur" && (
                                                    <>
                                                    <button
                                                        className={`transition duration-200 ${
                                                        darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                                                        }`}
                                                        onClick={() => handleOpenUpdateModal(capteur)}
                                                        title="Modifier"
                                                        aria-label={`Modifier ${capteur.numSerie}`}
                                                    >
                                                        <Edit size={20} />
                                                    </button>
                                                    <button
                                                        className={`transition duration-200 ${
                                                        darkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"
                                                        }`}
                                                        onClick={() => confirmDelete(capteur)}
                                                        title="Supprimer"
                                                        aria-label={`Supprimer ${capteur.numSerie}`}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                    </>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {totalPages > 1 && (
                                  <div className="flex justify-center pb-4">
                                    <div className={`flex items-center gap-2 rounded-lg p-2 border shadow-sm ${
                                      darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-green-100"
                                    }`}>
                                      <button
                                        onClick={() => handlePageChange(type, currentPage - 1)}
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
                                            onClick={() => handlePageChange(type, page)}
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
                                        onClick={() => handlePageChange(type, currentPage + 1)}
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
                                  Aucun capteur ne correspond aux critères de recherche
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

export default CapteurList;