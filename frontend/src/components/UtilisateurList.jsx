import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash, Edit, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AddUtilisateurModal from './AddUtilisateurModal';
import UpdateUtilisateurModal from './UpdateUtilisateurModal';
import UtilisateurSearchBar from './UtilisateurSearchBar';
import UtilisateurReportModal from './UtilisateurReportModal';

const UtilisateurList = ({ selectedColor, darkMode }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("nom");
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [utilisateurToUpdate, setUtilisateurToUpdate] = useState(null);
  const [utilisateurToView, setUtilisateurToView] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [utilisateurToDelete, setUtilisateurToDelete] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showDepartementsModal, setShowDepartementsModal] = useState(false);
  const [currentDepartements, setCurrentDepartements] = useState([]);
  const [role, setRole] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [globalSearchHasFocus, setGlobalSearchHasFocus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const navigate = useNavigate();

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUtilisateurs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUtilisateurs.length / itemsPerPage);

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Récupération des utilisateurs
  const fetchUtilisateurs = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);
      setCurrentUserEmail(decodedToken.email);

      const response = await axios.get("http://localhost:4000/apiUtilisateur/getUtilisateur", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Trier pour mettre l'utilisateur courant en premier
      const sortedUtilisateurs = [...response.data].sort((a, b) => {
        if (a.email === decodedToken.email) return -1;
        if (b.email === decodedToken.email) return 1;
        return 0;
      });

      setUtilisateurs(sortedUtilisateurs);
      setFilteredUtilisateurs(sortedUtilisateurs);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchUtilisateurs();
  }, [fetchUtilisateurs]);

  // Fonction pour afficher les départements
  const displayDepartements = (departements) => {
    if (!departements || departements.length === 0) {
      return "Non affecté";
    }
    
    if (departements.length === 1) {
      return departements[0].nom;
    }

    return (
      <>
        {departements[0].nom} 
        <span 
          className="text-blue-500 cursor-pointer ml-1"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentDepartements(departements);
            setShowDepartementsModal(true);
          }}
        >
          (+{departements.length - 1})
        </span>
      </>
    );
  };

  // Filtrage des utilisateurs
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredUtilisateurs(utilisateurs);
      setCurrentPage(1);
      return;
    }

    const filtered = utilisateurs.filter(utilisateur => {
      const query = searchQuery.toLowerCase();
      const searchFields = {
        'nom': utilisateur.nom,
        'prenom': utilisateur.prenom,
        'email': utilisateur.email,
        'tel': utilisateur.tel,
        'type_utilisateur': utilisateur.type_utilisateur,
        'departement': utilisateur.departement?.map(d => d.nom).join(' ') || '',
        'date_creation': formatDate(utilisateur.createdAt)
      };

      return searchFields[searchType]?.toLowerCase().includes(query) || false;
    });

    setFilteredUtilisateurs(filtered);
    setCurrentPage(1);
  }, [searchQuery, utilisateurs, searchType]);

  // Gestion suppression utilisateur
  const handleDeleteUtilisateur = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/apiUtilisateur/deleteUtilisateur/${utilisateurToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchUtilisateurs();
      setShowDeletePopup(true);
      setShowDeleteConfirmation(false);
      
      setTimeout(() => setShowDeletePopup(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }, [utilisateurToDelete, fetchUtilisateurs]);

  // Callbacks pour les modales
  const handleUtilisateurAdded = useCallback(async () => {
    await fetchUtilisateurs();
    setShowAddPopup(true);
    setTimeout(() => setShowAddPopup(false), 3000);
  }, [fetchUtilisateurs]);

  const handleUtilisateurUpdated = useCallback(async () => {
    await fetchUtilisateurs();
    setShowUpdatePopup(true);
    setTimeout(() => setShowUpdatePopup(false), 3000);
  }, [fetchUtilisateurs]);

  // Pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`w-full h-screen p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
      {/* Notifications */}
      {showAddPopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Utilisateur ajouté avec succès !
        </div>
      )}

      {showDeletePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
        }`}>
          Utilisateur supprimé avec succès !
        </div>
      )}

      {showUpdatePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Utilisateur mis à jour avec succès !
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
              Êtes-vous sûr de vouloir supprimer l'utilisateur <span className="font-semibold">{utilisateurToDelete?.nom} {utilisateurToDelete?.prenom}</span> ?
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
                onClick={handleDeleteUtilisateur}
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

      {/* Modale d'affichage des départements */}
      {showDepartementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Départements</h3>
              <button 
                onClick={() => setShowDepartementsModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <ul className="space-y-2">
                {currentDepartements.map((departement, index) => (
                  <li key={index} className="py-2 border-b dark:border-gray-700">
                    {departement.nom}
                  </li>
                ))}
              </ul>
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
            aria-label="Ajouter un nouvel utilisateur"
          >
            <Plus size={20} />
            Ajouter
          </button>
        )}

        <div className="relative w-96">
          <UtilisateurSearchBar
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

      {/* Modale d'ajout */}
      <AddUtilisateurModal
        isModalOpen={isAddModalOpen}
        setIsModalOpen={setIsAddModalOpen}
        onUtilisateurAdded={handleUtilisateurAdded}
        selectedColor={selectedColor}
        darkMode={darkMode}
      />

      {/* Modale de mise à jour */}
      {utilisateurToUpdate && (
        <UpdateUtilisateurModal
          isModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          utilisateurToUpdate={utilisateurToUpdate}
          onUtilisateurUpdated={handleUtilisateurUpdated}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      {/* Modale de rapport */}
      {utilisateurToView && (
        <UtilisateurReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          utilisateur={utilisateurToView}
          selectedColor={selectedColor}
          darkMode={darkMode}
        />
      )}

      {/* Tableau des utilisateurs */}
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
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Prénom</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Email</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Téléphone</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Département</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Type</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Date création</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((utilisateur, index) => (
                <tr 
                  key={utilisateur._id} 
                  className={`border-t ${
                    darkMode 
                      ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" 
                      : index % 2 === 1 ? "bg-gray-50" : "bg-white"
                  } h-16`}
                >
                  <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                    {utilisateur.email === currentUserEmail ? (
                      <>
                        <span className="text-red-500">(Vous)</span> {utilisateur.nom}
                      </>
                    ) : (
                      utilisateur.nom
                    )}
                  </td>
                  <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                    {utilisateur.prenom}
                  </td>
                  <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                    {utilisateur.email}
                  </td>
                  <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                    {utilisateur.tel || "N/A"}
                  </td>
                  <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                    {displayDepartements(utilisateur.departement)}
                  </td>
                  <td className={`p-4 border-b ${
                    utilisateur.type_utilisateur === "Administrateur" 
                      ? "text-red-500 font-semibold" 
                      : darkMode ? "text-gray-300" : "text-gray-700"
                  } whitespace-nowrap`}>
                    {utilisateur.type_utilisateur}
                  </td>
                  <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                    {formatDate(utilisateur.createdAt)}
                  </td>
                  <td className={`p-4 border-b text-center ${darkMode ? "border-gray-700" : "border-gray-200"} whitespace-nowrap`}>
                    <div className="flex justify-center items-center gap-4">
                      <button
                        className="transition duration-200"
                        style={{ color: selectedColor }}
                        onClick={() => {
                          setUtilisateurToView(utilisateur);
                          setIsReportModalOpen(true);
                        }}
                        title="Voir détails"
                        aria-label={`Voir détails de ${utilisateur.nom}`}
                      >
                        <Eye size={20} />
                      </button>
                      {role === "Administrateur" && utilisateur.email !== currentUserEmail && (
                        <>
                          <button
                            className={`transition duration-200 ${
                              darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-700"
                            }`}
                            onClick={() => {
                              setUtilisateurToUpdate(utilisateur);
                              setIsUpdateModalOpen(true);
                            }}
                            title="Modifier"
                            aria-label={`Modifier ${utilisateur.nom}`}
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            className={`transition duration-200 ${
                              darkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"
                            }`}
                            onClick={() => {
                              setUtilisateurToDelete(utilisateur);
                              setShowDeleteConfirmation(true);
                            }}
                            title="Supprimer"
                            aria-label={`Supprimer ${utilisateur.nom}`}
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

        {/* Pagination */}
        {filteredUtilisateurs.length > itemsPerPage && (
          <div className={`flex items-center justify-between p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <div className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredUtilisateurs.length)} sur {filteredUtilisateurs.length} utilisateurs
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

export default UtilisateurList;