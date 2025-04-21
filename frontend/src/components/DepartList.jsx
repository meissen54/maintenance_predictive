import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash, Edit, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AddDepartModal from './AddDepartModal';
import UpdateDepartModal from './UpdateDepartModal';
import DepartSearchBar from './DepartSearchBar';
import DepartReportModal from './DepartReportModal';

const DepartList = ({ selectedColor, darkMode }) => {
  const [departements, setDepartements] = useState([]);
  const [filteredDeparts, setFilteredDeparts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("nom");
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [departToUpdate, setDepartToUpdate] = useState(null);
  const [departToView, setDepartToView] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [departToDelete, setDepartToDelete] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showEquipementsModal, setShowEquipementsModal] = useState(false);
  const [equipementsList, setEquipementsList] = useState([]);
  const [role, setRole] = useState("");
  const [globalSearchHasFocus, setGlobalSearchHasFocus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [searchMode, setSearchMode] = useState("default");

  const navigate = useNavigate();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeparts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeparts.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const fetchDeparts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);

      const response = await axios.get("http://localhost:4000/apiDepart/getDepart", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const processedData = response.data.map(depart => ({
        ...depart,
        dateInstallation: depart.dateInstallation || null,
        description: depart.description || '',
        equipements: Array.isArray(depart.equipements) ? depart.equipements : [],
        createdAt: depart.timestamp || new Date()
      }));

      setDepartements(processedData);
      setFilteredDeparts(processedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des départements:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchDeparts();
  }, [fetchDeparts]);

  const displayEquipements = (equipements) => {
    if (!equipements || equipements.length === 0) {
      return <span className="text-gray-500">Aucun équipement</span>;
    }

    return (
      <span 
        className="cursor-pointer"
        onClick={(e) => {
          if (equipements.length > 1) {
            e.stopPropagation();
            setEquipementsList(equipements.map(e => e.nom));
            setShowEquipementsModal(true);
          }
        }}
      >
        {equipements.length === 1 ? (
          equipements[0].nom
        ) : (
          <>
            {equipements[0].nom} <span className="text-blue-500 hover:underline">(Voir plus)</span>
          </>
        )}
      </span>
    );
  };

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredDeparts(departements);
      setCurrentPage(1);
      return;
    }

    const filtered = departements.filter(depart => {
      const query = searchQuery.toLowerCase();
      
      if (searchMode === "default") {
        const searchFields = {
          'nom': depart.nom,
          'code': depart.code || '',
          'equipement': Array.isArray(depart.equipements) 
            ? depart.equipements.map(e => e.nom).join(' ') 
            : '',
          'date_creation': formatDate(depart.timestamp || depart.createdAt)
        };
        return searchFields[searchType]?.toLowerCase().includes(query) || false;
      }
      else if (searchMode === "capteur") {
        const searchFields = {
          'numSerie': depart.numSerie || '',
          'departement': depart.departement || ''
        };
        return searchFields[searchType]?.toLowerCase().includes(query) || false;
      }
      else if (searchMode === "composant") {
        const searchFields = {
          'dateInstallation': depart.dateInstallation ? formatDate(depart.dateInstallation) : '',
          'description': depart.description || ''
        };
        return searchFields[searchType]?.toLowerCase().includes(query) || false;
      }

      return false;
    });

    setFilteredDeparts(filtered);
    setCurrentPage(1);
  }, [searchQuery, departements, searchType, searchMode]);

  const handleDeleteDepart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/apiDepart/deleteDepart/${departToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchDeparts();
      setShowDeletePopup(true);
      setShowDeleteConfirmation(false);
      
      setTimeout(() => setShowDeletePopup(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }, [departToDelete, fetchDeparts]);

  const handleDepartAdded = useCallback(async () => {
    await fetchDeparts();
    setShowAddPopup(true);
    setTimeout(() => setShowAddPopup(false), 3000);
  }, [fetchDeparts]);

  const handleDepartUpdated = useCallback(async () => {
    await fetchDeparts();
    setShowUpdatePopup(true);
    setTimeout(() => setShowUpdatePopup(false), 3000);
  }, [fetchDeparts]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`w-full h-screen p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
      {showAddPopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Département ajouté avec succès !
        </div>
      )}

      {showDeletePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
        }`}>
          Département supprimé avec succès !
        </div>
      )}

      {showUpdatePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Département mis à jour avec succès !
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <h3 className="text-xl font-semibold mb-4">Confirmer la suppression</h3>
            <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Êtes-vous sûr de vouloir supprimer le département <span className="font-semibold">{departToDelete?.nom}</span> ?
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
                onClick={handleDeleteDepart}
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

      {showEquipementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Liste des équipements</h3>
              <button 
                onClick={() => setShowEquipementsModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <ul className="space-y-2">
                {equipementsList.map((equipement, index) => (
                  <li key={index} className="py-2 border-b dark:border-gray-700">
                    <div className="font-medium">{equipement}</div>
                  </li>
                ))}
              </ul>
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
            aria-label="Ajouter un nouveau département"
          >
            <Plus size={20} />
            Ajouter
          </button>
        )}

        <div className="relative w-96">
          <DepartSearchBar
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
            includeAllFields={searchMode === "default"}
            includeCapteurFields={searchMode === "capteur"}
            onSearchModeChange={setSearchMode}
          />
        </div>
      </div>

      <AddDepartModal
        isModalOpen={isAddModalOpen}
        setIsModalOpen={setIsAddModalOpen}
        onDepartAdded={handleDepartAdded}
        selectedColor={selectedColor}
        darkMode={darkMode}
      />

      {departToUpdate && (
        <UpdateDepartModal
          isModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          departToUpdate={departToUpdate}
          onDepartUpdated={handleDepartUpdated}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      {departToView && (
        <DepartReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          departement={departToView}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      <div className={`shadow-xl rounded-2xl overflow-hidden ${
        darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className={`text-left ${
              darkMode 
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" 
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
            }`}>
              <tr className="h-16">
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Nom</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Code</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Équipements</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Date création</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((depart, index) => (
                  <tr 
                    key={depart._id} 
                    className={`border-t ${
                      darkMode 
                        ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" 
                        : index % 2 === 1 ? "bg-gray-50" : "bg-white"
                    } h-16`}
                  >
                    <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                      {depart.nom}
                    </td>
                    <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                      {depart.code || "N/A"}
                    </td>
                    <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                      {displayEquipements(depart.equipements)}
                    </td>
                    <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                      {formatDate(depart.timestamp || depart.createdAt)}
                    </td>
                    <td className={`p-4 border-b text-center ${darkMode ? "border-gray-700" : "border-gray-200"} whitespace-nowrap`}>
                      <div className="flex justify-center items-center gap-4">
                        <button
                          className="transition duration-200"
                          style={{ color: selectedColor }}
                          onClick={() => {
                            setDepartToView(depart);
                            setIsReportModalOpen(true);
                          }}
                          title="Voir détails"
                          aria-label={`Voir détails de ${depart.nom}`}
                        >
                          <Eye size={20} />
                        </button>
                        {role === "Administrateur" && (
                          <>
                            <button
                              className={`transition duration-200 ${
                                darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                              }`}
                              onClick={() => {
                                setDepartToUpdate(depart);
                                setIsUpdateModalOpen(true);
                              }}
                              title="Modifier"
                              aria-label={`Modifier ${depart.nom}`}
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              className={`transition duration-200 ${
                                darkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"
                              }`}
                              onClick={() => {
                                setDepartToDelete(depart);
                                setShowDeleteConfirmation(true);
                              }}
                              title="Supprimer"
                              aria-label={`Supprimer ${depart.nom}`}
                            >
                              <Trash size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Aucun département trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredDeparts.length > itemsPerPage && (
          <div className={`flex items-center justify-between p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <div className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredDeparts.length)} sur {filteredDeparts.length} départements
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

export default DepartList;