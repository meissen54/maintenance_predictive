import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check, X, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import SearchbarAlerte from './SearchbarAlerte';

const AlerteList = ({ selectedColor, darkMode }) => {
  const [alertes, setAlertes] = useState([]);
  const [filteredAlertes, setFilteredAlertes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("panne");
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [globalSearchHasFocus, setGlobalSearchHasFocus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [currentAlerte, setCurrentAlerte] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const navigate = useNavigate();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlertes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlertes.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const fetchAlertes = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== 'Administrateur') {
        navigate("/unauthorized");
        return;
      }

      const response = await axios.get("http://localhost:4000/apiAlerte/get", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAlertes(response.data);
      setFilteredAlertes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchAlertes();
  }, [fetchAlertes]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredAlertes(alertes);
      setCurrentPage(1);
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
      }

      return false;
    });

    setFilteredAlertes(filtered);
    setCurrentPage(1);
  }, [searchQuery, alertes, searchType]);

  const openSolutionModal = (alerte) => {
    setCurrentAlerte(alerte);
    setShowSolutionModal(true);
  };

  const openReasonModal = (raison) => {
    setSelectedReason(raison);
    setShowReasonModal(true);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleUpdateEtat = async (alerteId, newEtat) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:4000/apiAlerte/updateEtat/${alerteId}`,
        { etat: newEtat },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchAlertes();
      setShowSolutionModal(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état:", error);
    }
  };

  return (
    <div className={`w-full h-screen p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
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

      {showSolutionModal && currentAlerte && (
        <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
          <div className={`p-6 rounded-lg shadow-xl w-1/3 min-w-[400px] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Solution pour la panne</h3>
              <button
                onClick={() => setShowSolutionModal(false)}
                className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Composant:</h4>
              <p className={darkMode ? "text-gray-200" : "text-gray-800"}>{currentAlerte.composant?.nom || "N/A"}</p>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Panne:</h4>
              <p className={darkMode ? "text-gray-200" : "text-gray-800"}>{currentAlerte.panne}</p>
            </div>

            <div className="mb-6">
              <h4 className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Solution:</h4>
              <p className={darkMode ? "text-gray-200" : "text-gray-800"}>{currentAlerte.Solution || "Aucune solution fournie"}</p>
            </div>
            
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleUpdateEtat(currentAlerte._id, "fonctionnel")}
                className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                style={{ backgroundColor: selectedColor }}
              >
                <Check size={20} />
                Marquer comme fonctionnel
              </button>
              
              <button
                onClick={() => handleUpdateEtat(currentAlerte._id, "en maintenance")}
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
          />
        </div>
      </div>

      <div className={`shadow-xl rounded-2xl overflow-hidden ${
        darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>
            {`
              ::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <table className="w-full border-collapse">
            <thead className={`text-left ${
              darkMode 
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" 
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
            }`}>
              <tr className="h-16">
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Composant</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Panne</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Solution</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">État</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Date</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((alerte, index) => {
                  const etatClass = getEtatClass(alerte.etat);
                  return (
                    <tr 
                      key={alerte._id} 
                      className={`border-t ${
                        darkMode 
                          ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" 
                          : index % 2 === 1 ? "bg-gray-50" : "bg-white"
                      } h-16`}
                    >
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {alerte.composant?.nom || "N/A"}
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {alerte.Solution ? (
                          <div className="line-clamp-1">
                            {alerte.Solution.length > 15 ? `${alerte.Solution.substring(0, 15)}...` : alerte.Solution}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className={`p-4 border-b whitespace-nowrap`}>
                        <span className={`flex items-center gap-1 ${etatClass.className}`}>
                          {etatClass.icon} {alerte.etat}
                        </span>
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {formatDate(alerte.timestamp)}
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} text-center`}>
                        <div className="flex justify-center">
                          <button
                            onClick={() => openSolutionModal(alerte)}
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
                  <td colSpan={6} className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Aucune alerte trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAlertes.length > itemsPerPage && (
          <div className={`flex items-center justify-between p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <div className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredAlertes.length)} sur {filteredAlertes.length} alertes
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md flex items-center justify-center ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
                aria-label="Page précédente"
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                    number === currentPage
                      ? 'text-white shadow-inner'
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                  } transition-colors`}
                  style={number === currentPage ? { backgroundColor: selectedColor } : {}}
                  aria-label={`Page ${number}`}
                  aria-current={number === currentPage ? "page" : undefined}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md flex items-center justify-center ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
                aria-label="Page suivante"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlerteList;