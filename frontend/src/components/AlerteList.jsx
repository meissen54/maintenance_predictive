import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Check, X, Clock, Eye } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SearchbarAlerte from './SearchbarAlerte';

const AlerteList = ({ selectedColor, darkMode }) => {
  // États
  const [alertes, setAlertes] = useState([]);
  const [filteredAlertes, setFilteredAlertes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("panne");
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [globalSearchHasFocus, setGlobalSearchHasFocus] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [itemsPerPage] = useState(8);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [currentAlerte, setCurrentAlerte] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [highlightedAlert, setHighlightedAlert] = useState(null);
  const highlightTimeoutRef = useRef(null);

  // Références
  const lastUpdateRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Style dynamique pour la surbrillance
  const highlightStyle = {
    light: {
      animation: 'highlight-pulse 1.5s infinite',
      backgroundColor: `${selectedColor}20`, // 20% de transparence
      position: 'relative',
      zIndex: 10,
      transform: 'scale(1.01)',
      transition: 'all 0.3s ease',
    },
    dark: {
      animation: 'highlight-pulse 1.5s infinite',
      backgroundColor: `${selectedColor}30`, // 30% de transparence
      position: 'relative',
      zIndex: 10,
      transform: 'scale(1.01)',
      transition: 'all 0.3s ease',
    }
  };

  // Composant pour l'animation de surbrillance
  const HighlightAnimation = () => (
    <style>
      {`
        @keyframes highlight-pulse {
          0% { box-shadow: 0 0 0 0 ${selectedColor}70; }
          70% { box-shadow: 0 0 0 10px ${selectedColor}00; }
          100% { box-shadow: 0 0 0 0 ${selectedColor}00; }
        }
      `}
    </style>
  );

  // Fonctions utilitaires
  const formatDateTunisia = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("fr-FR", {
        timeZone: "Africa/Tunis",
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "N/A";
    }
  };

  const getEtatClass = useCallback((etat) => {
    switch (etat.toLowerCase()) {
      case 'fonctionnel':
        return { 
          color: "#10B981",
          className: darkMode ? "text-green-400" : "text-green-600",
          icon: <Check size={16} />
        };
      case 'défectueux':
        return { 
          color: "#DC2626",
          className: darkMode ? "text-red-400" : "text-red-600",
          icon: <X size={16} />
        };
      case 'en maintenance':
        return { 
          color: "#F97316",
          className: darkMode ? "text-orange-300" : "text-orange-600",
          icon: <Clock size={16} />
        };
      default:
        return { 
          color: "#6B7280", 
          className: darkMode ? "text-gray-400" : "text-gray-600",
          icon: "?"
        };
    }
  }, [darkMode]);

  const getStatutClass = useCallback((statut) => {
    switch (statut.toLowerCase()) {
      case 'consulté':
        return { 
          color: "#3B82F6",
          className: darkMode ? "text-blue-400" : "text-blue-600",
          icon: <Eye size={16} />
        };
      case 'pas consulté':
        return { 
          color: "#EF4444",
          className: darkMode ? "text-red-400" : "text-red-600",
          icon: <Clock size={16} />
        };
      default:
        return { 
          color: "#6B7280", 
          className: darkMode ? "text-gray-400" : "text-gray-600",
          icon: "?"
        };
    }
  }, [darkMode]);

  // Effet pour initialiser la surbrillance depuis l'état de navigation
  useEffect(() => {
    if (location.state?.highlightAlertId) {
      setHighlightedAlert(location.state.highlightAlertId);
    }
  }, [location.state]);

  // Effet pour gérer le scroll et la surbrillance
  useEffect(() => {
    const handleHighlight = () => {
      if (highlightedAlert) {
        const alertExists = filteredAlertes.some(a => a._id === highlightedAlert);
        
        if (!alertExists) {
          // Si l'alerte n'est pas sur la page actuelle, trouver la bonne page
          const fetchCorrectPage = async () => {
            const token = localStorage.getItem("token");
            try {
              const response = await fetch(
                `http://localhost:4000/apiAlerte/getAlertPage/${highlightedAlert}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              
              if (response.ok) {
                const data = await response.json();
                if (data.page && data.page !== currentPage) {
                  handlePageChange(data.page);
                }
              }
            } catch (error) {
              console.error("Erreur:", error);
            }
          };
          
          fetchCorrectPage();
          return;
        }

        // Scroll vers l'élément après un léger délai
        const timer = setTimeout(() => {
          const element = document.getElementById(highlightedAlert);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 100);

        // Enlever la surbrillance après 3 secondes
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedAlert(null);
        }, 3000);

        return () => {
          clearTimeout(timer);
          if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
          }
        };
      }
    };

    handleHighlight();
  }, [highlightedAlert, filteredAlertes, currentPage]);

  // Récupération des alertes
  const fetchAlertes = useCallback(async (page = 1, fullRefresh = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);

      if (!['Administrateur', 'Technicien'].includes(decodedToken.role)) {
        navigate("/unauthorized");
        return;
      }

      const apiEndpoint = decodedToken.role === 'Technicien' 
        ? 'getAlertByUser' 
        : 'getAlert';

      const url = fullRefresh 
        ? `http://localhost:4000/apiAlerte/${apiEndpoint}?page=${page}`
        : `http://localhost:4000/apiAlerte/${apiEndpoint}?page=${page}&since=${lastUpdateRef.current || ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
        }
        throw new Error('Erreur réseau');
      }

      const data = await response.json();

      if (data.lastUpdate) {
        lastUpdateRef.current = data.lastUpdate;
      }

      // Conserver la surbrillance si l'alerte existe dans les nouvelles données
      setAlertes(prev => {
        const newAlerts = data.alerts;
        const shouldKeepHighlight = highlightedAlert && newAlerts.some(a => a._id === highlightedAlert);
        if (!shouldKeepHighlight && highlightedAlert) {
          // Si l'alerte surlignée n'est pas sur cette page, la conserver dans l'état
          navigate(`?page=${page}`, {
            replace: true,
            state: {
              highlightAlertId: highlightedAlert,
              shouldScrollToAlert: true
            }
          });
        }
        return newAlerts;
      });

      setFilteredAlertes(data.alerts);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalAlerts(data.totalAlerts);

    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
      if (!fullRefresh) {
        await fetchAlertes(page, true);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, highlightedAlert]);

  // Chargement initial et intervalle de rafraîchissement
  useEffect(() => {
    fetchAlertes(currentPage, true);
    
    const interval = setInterval(() => {
      fetchAlertes(currentPage);
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchAlertes, currentPage]);

  // Filtrage des alertes
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredAlertes(alertes);
      return;
    }

    const filtered = alertes.filter(alerte => {
      const query = searchQuery.toLowerCase();
      
      if (searchType === "panne") {
        return alerte.panne.toLowerCase().includes(query);
      } else if (searchType === "etat") {
        return alerte.etat.toLowerCase().includes(query);
      } else if (searchType === "composant") {
        return alerte.composant?.nom.toLowerCase().includes(query);
      } else if (searchType === "equipement") {
        return alerte.equipement?.nom.toLowerCase().includes(query);
      } else if (searchType === "statut") {
        return alerte.statut.toLowerCase().includes(query);
      }

      return false;
    });

    setFilteredAlertes(filtered);
  }, [searchQuery, alertes, searchType]);

  // Gestion des modales
  const openSolutionModal = (alerte) => {
    setCurrentAlerte(alerte);
    setShowSolutionModal(true);
    setHighlightedAlert(alerte._id);
  };

  const openReasonModal = (raison) => {
    setSelectedReason(raison);
    setShowReasonModal(true);
  };

  // Changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams({ page });
    
    navigate(`?page=${page}`, {
      replace: true,
      state: {
        highlightAlertId: highlightedAlert,
        shouldScrollToAlert: !!highlightedAlert
      }
    });
    
    fetchAlertes(page, true);
  };

  // Mise à jour de l'état d'une alerte
  const handleUpdateEtat = async (alerteId, newEtat) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/apiAlerte/updateEtat/${alerteId}`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ etat: newEtat })
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setAlertes(prevAlertes => 
        prevAlertes.map(alert => 
          alert._id === alerteId ? { ...alert, etat: newEtat } : alert
        )
      );
      
      setFilteredAlertes(prevFiltered => 
        prevFiltered.map(alert => 
          alert._id === alerteId ? { ...alert, etat: newEtat } : alert
        )
      );

      setShowSolutionModal(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état:", error);
    }
  };

  // Mise à jour du statut d'une alerte
  const handleUpdateStatut = async (alerteId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/apiAlerte/updateStatut/${alerteId}`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ statut: "consulté" })
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setAlertes(prevAlertes => 
        prevAlertes.map(alert => 
          alert._id === alerteId ? { ...alert, statut: "consulté" } : alert
        )
      );
      
      setFilteredAlertes(prevFiltered => 
        prevFiltered.map(alert => 
          alert._id === alerteId ? { ...alert, statut: "consulté" } : alert
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  // Affichage du loader pendant le chargement
  if (loading && alertes.length === 0) {
    return (
      <div className={`w-full h-screen p-8 flex items-center justify-center ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: selectedColor }}></div>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
      <HighlightAnimation />
      
      {/* Modale de détail de panne */}
      {showReasonModal && (
        <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
          <div className={`p-6 rounded-lg shadow-xl w-1/3 min-w-[400px] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Détail de la panne</h3>
              <button
                onClick={() => setShowReasonModal(false)}
                className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <p className={`whitespace-pre-wrap ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                {selectedReason}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowReasonModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de solution */}
      {showSolutionModal && currentAlerte && (
        <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
          <div className={`p-6 rounded-lg shadow-xl w-1/3 min-w-[400px] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Détails de l'alerte</h3>
              <button
                onClick={() => setShowSolutionModal(false)}
                className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Équipement:</h4>
              <p className={darkMode ? "text-gray-200" : "text-gray-800"}>{currentAlerte.equipement?.nom || "N/A"}</p>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Composant:</h4>
              <p className={darkMode ? "text-gray-200" : "text-gray-800"}>{currentAlerte.composant?.nom || "N/A"}</p>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Statut:</h4>
              <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                <span className={`flex items-center gap-1 ${getStatutClass(currentAlerte.statut).className}`}>
                  {getStatutClass(currentAlerte.statut).icon} {currentAlerte.statut}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Panne:</h4>
              <p className={darkMode ? "text-gray-200" : "text-gray-800"}>{currentAlerte.panne}</p>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date:</h4>
              <p className={darkMode ? "text-gray-200" : "text-gray-800"}>
                {formatDateTunisia(currentAlerte.timestamp)}
              </p>
            </div>
            
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => {
                  handleUpdateEtat(currentAlerte._id, "fonctionnel");
                  handleUpdateStatut(currentAlerte._id);
                }}
                className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                style={{ backgroundColor: selectedColor }}
              >
                <Check size={20} />
                Marquer comme fonctionnel
              </button>
              
              <button
                onClick={() => {
                  handleUpdateEtat(currentAlerte._id, "en maintenance");
                  handleUpdateStatut(currentAlerte._id);
                }}
                className={`px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300 ${
                  darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                <Clock size={20} />
                En maintenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="mb-6 flex justify-end">
        <div className="relative w-96">
          <SearchbarAlerte
            searchType={searchType}
            setSearchType={setSearchType}
            query={searchQuery}
            setQuery={setSearchQuery}
            showOptions={showSearchOptions}
            setShowOptions={setShowSearchOptions}
            size="large"
            className={`shadow-xl ${darkMode ? 'ring-1 ring-gray-600' : 'ring-1 ring-gray-200'}`}
            hasFocus={globalSearchHasFocus}
            setHasFocus={setGlobalSearchHasFocus}
            darkMode={darkMode}
            selectedColor={selectedColor}
            searchOptions={[
              { value: "panne", label: "Panne" },
              { value: "etat", label: "État" },
              { value: "composant", label: "Composant" },
              { value: "equipement", label: "Équipement" },
              { value: "statut", label: "Statut" }
            ]}
          />
        </div>
      </div>

      {/* Tableau des alertes */}
      <div className={`shadow-xl rounded-2xl overflow-hidden ${
        darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <table className="w-full border-collapse">
            <thead className={`text-left ${
              darkMode 
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" 
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
            }`}>
              <tr className="h-16">
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Équipement</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Composant</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Panne</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">État</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Statut</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Date (Tunisie)</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlertes.length > 0 ? (
                filteredAlertes.map((alerte, index) => {
                  const etatClass = getEtatClass(alerte.etat);
                  const statutClass = getStatutClass(alerte.statut);
                  return (
                    <tr 
                      key={alerte._id} 
                      id={alerte._id}
                      className={`border-t ${
                        darkMode 
                          ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" 
                          : index % 2 === 1 ? "bg-gray-50" : "bg-white"
                      } h-16 transition-all duration-300`}
                      style={highlightedAlert === alerte._id ? (darkMode ? highlightStyle.dark : highlightStyle.light) : {}}
                    >
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {alerte.equipement?.nom || "N/A"}
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {alerte.composant?.nom || "N/A"}
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                        <div className="flex items-center">
                          <div className="line-clamp-1 flex-1">
                            {alerte.panne.length > 15 ? `${alerte.panne.substring(0, 15)}...` : alerte.panne}
                          </div>
                          {alerte.panne.length > 15 && (
                            <button 
                              onClick={() => openReasonModal(alerte.panne)}
                              className={`ml-2 text-sm ${darkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-800"}`}
                            >
                              Voir plus
                            </button>
                          )}
                        </div>
                      </td>
                      <td className={`p-4 border-b whitespace-nowrap`}>
                        <span className={`flex items-center gap-1 ${etatClass.className}`}>
                          {etatClass.icon} {alerte.etat}
                        </span>
                      </td>
                      <td className={`p-4 border-b whitespace-nowrap`}>
                        <span className={`flex items-center gap-1 ${statutClass.className}`}>
                          {statutClass.icon} {alerte.statut}
                        </span>
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {formatDateTunisia(alerte.timestamp)}
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} text-center`}>
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              openSolutionModal(alerte);
                              handleUpdateStatut(alerte._id);
                            }}
                            className="px-3 py-2 rounded-full shadow-lg flex items-center gap-1 hover:shadow-xl transition duration-200"
                            style={{ 
                              backgroundColor: selectedColor,
                              color: "white"
                            }}
                          >
                            <Eye size={14} />
                            <span>Détails</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Aucune alerte trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`flex items-center justify-between p-4 border-t ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className={`text-sm ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalAlerts)} sur {totalAlerts} alertes
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md flex items-center justify-center ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
              } transition-colors`}
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                    pageNum === currentPage
                      ? 'text-white shadow-inner'
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                  } transition-colors`}
                  style={pageNum === currentPage ? { backgroundColor: selectedColor } : {}}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md flex items-center justify-center ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
              } transition-colors`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlerteList;