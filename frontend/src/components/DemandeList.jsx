import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check, X, Clock, Trash2, Plus, MoreVertical, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import SearchbarDemande from './SearchbarDemande';

const DemandeList = ({ selectedColor, darkMode }) => {
  const [demandes, setDemandes] = useState([]);
  const [filteredDemandes, setFilteredDemandes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("raison");
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [demandeToDelete, setDemandeToDelete] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [role, setRole] = useState("");
  const [globalSearchHasFocus, setGlobalSearchHasFocus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentDemande, setCurrentDemande] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipements, setEquipements] = useState([]);
  const [composants, setComposants] = useState([]);
  const [capteurs, setCapteurs] = useState([]);
  const [selectedType, setSelectedType] = useState('equipement');
  const [formData, setFormData] = useState({
    type: 'equipement',
    equipement: '',
    composant: '',
    capteur: '',
    raison: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    equipement: false,
    composant: false,
    capteur: false,
    raison: false
  });
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [showNumSerieModal, setShowNumSerieModal] = useState(false);
  const [selectedNumSerie, setSelectedNumSerie] = useState("");

  const navigate = useNavigate();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatutClass = useCallback((statut) => {
    switch (statut.toLowerCase()) {
      case 'approuvé':
        return { 
          color: "#10B981",
          className: darkMode ? "text-green-400" : "text-green-600",
          icon: <Check size={16} />
        };
      case 'décliné':
        return { 
          color: "#DC2626",
          className: darkMode ? "text-red-400" : "text-red-600",
          icon: <X size={16} />
        };
      case 'en cours de traitemant':
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

  const fetchDemandes = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);

      const endpoint = decodedToken.role === 'Technicien' 
        ? "http://localhost:4000/apiDemande/getByUser" 
        : "http://localhost:4000/apiDemande/get";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDemandes(response.data);
      setFilteredDemandes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  const fetchEquipements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/apiEquipement/getEquipementBydepart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipements(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
      setEquipements([]);
    }
  };

  const fetchComposants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/apiComposant/getComposantByDepart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComposants(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des composants:', error);
      setComposants([]);
    }
  };

  const fetchCapteursByDepartement = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/apiCapteur/getCapteurByDepart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCapteurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des capteurs:', error);
      setCapteurs([]);
    }
  };

  const fetchCapteursByComposant = async (composantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/apiCapteur/getCapteursByComposant/${composantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCapteurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des capteurs:', error);
      setCapteurs([]);
    }
  };

  const validateFields = () => {
    const errors = {
      equipement: selectedType === 'equipement' && !formData.equipement,
      composant: selectedType === 'composant' && !formData.composant,
      capteur: selectedType === 'capteur' && !formData.capteur,
      raison: !formData.raison
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setFormData({
      type: 'equipement',
      equipement: '',
      composant: '',
      capteur: '',
      raison: ''
    });
    setFieldErrors({
      equipement: false,
      composant: false,
      capteur: false,
      raison: false
    });
    setCapteurs([]);
    setError(null);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setFormData({
      ...formData,
      type,
      equipement: '',
      composant: '',
      capteur: ''
    });
    setFieldErrors({
      ...fieldErrors,
      equipement: false,
      composant: false,
      capteur: false
    });
    setCapteurs([]);
    
    if (type === 'capteur') {
      fetchCapteursByDepartement();
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    setFieldErrors({
      ...fieldErrors,
      [name]: false
    });

    if (name === 'composant' && value) {
      await fetchCapteursByComposant(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        raison: formData.raison,
        equipement: formData.type === 'equipement' ? formData.equipement : null,
        composant: formData.type === 'composant' ? formData.composant : null,
        capteur: formData.type === 'capteur' ? formData.capteur : null
      };

      const response = await axios.post('http://localhost:4000/apiDemande/addDemande', payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
        handleCloseModal();
        fetchDemandes();
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error.response?.data || error.message);
      setError(`Erreur lors de l'envoi de la demande: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, [fetchDemandes]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredDemandes(demandes);
      setCurrentPage(1);
      return;
    }

    const filtered = demandes.filter(demande => {
      const query = searchQuery.toLowerCase();
      
      if (searchType === "raison") {
        return demande.raison.toLowerCase().includes(query);
      } else if (searchType === "statut") {
        return demande.statut.toLowerCase().includes(query);
      }

      return false;
    });

    setFilteredDemandes(filtered);
    setCurrentPage(1);
  }, [searchQuery, demandes, searchType]);

  const handleDeleteDemande = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/apiDemande/delete/${demandeToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchDemandes();
      setShowDeletePopup(true);
      setShowDeleteConfirmation(false);
      
      setTimeout(() => setShowDeletePopup(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }, [demandeToDelete, fetchDemandes]);

  const handleDeclineDemande = async (demandeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:4000/apiDemande/decDemande/${demandeId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchDemandes();
      setShowStatusModal(false);
    } catch (error) {
      console.error("Erreur lors du déclin de la demande:", error);
    }
  };

  const handleUpdateStatus = async (demandeId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:4000/apiDemande/updateStatus/${demandeId}`,
        { statut: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchDemandes();
      setShowStatusModal(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const openStatusModal = (demande) => {
    setCurrentDemande(demande);
    setShowStatusModal(true);
  };

  const openReasonModal = (raison) => {
    setSelectedReason(raison);
    setShowReasonModal(true);
  };

  const openNumSerieModal = (numSerie) => {
    setSelectedNumSerie(numSerie);
    setShowNumSerieModal(true);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getElementInfo = (demande) => {
    if (demande.equipement) {
      return demande.equipement.nom;
    } else if (demande.composant) {
      return demande.composant.nom;
    } else if (demande.capteur) {
      return demande.capteur.type;
    }
    return "N/A";
  };

  const getNumSerie = (demande) => {
    if (demande.equipement) {
      return demande.equipement.numSerie || "N/A";
    } else if (demande.composant) {
      return demande.composant.numSerieComposant || "N/A";
    } else if (demande.capteur) {
      return demande.capteur.numSerie || "N/A";
    }
    return "N/A";
  };

  const getElementType = (demande) => {
    if (demande.equipement) {
      return "Équipement";
    } else if (demande.composant) {
      return "Composant";
    } else if (demande.capteur) {
      return "Capteur";
    }
    return "N/A";
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    if (role === 'Technicien') {
      fetchEquipements();
      fetchComposants();
      if (selectedType === 'capteur') {
        fetchCapteursByDepartement();
      }
    }
  };

  return (
    <div className={`w-full h-screen p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>
      {/* Notifications */}
      {showSuccessPopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-green-700 text-white" : "bg-green-500 text-white"
        }`}>
          Demande envoyée avec succès !
        </div>
      )}

      {showDeletePopup && (
        <div className={`fixed top-28 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          darkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
        }`}>
          Demande supprimée avec succès !
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl ${
            darkMode ? "dark:bg-gray-800 text-white" : "bg-white text-gray-800"
          }`}>
            <h3 className="text-xl font-semibold mb-4">Confirmer la suppression</h3>
            <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Êtes-vous sûr de vouloir supprimer cette demande ?
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
                onClick={handleDeleteDemande}
                className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                style={{ backgroundColor: selectedColor }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && currentDemande && (
        <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
          <div className={`p-6 rounded-lg shadow-xl w-1/3 min-w-[400px] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Traiter la demande</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}
              >
                <X size={24} />
              </button>
            </div>

            <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Voulez-vous approuver ou décliner la demande de suppression de <strong>{getElementInfo(currentDemande)}</strong> ?
            </p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleUpdateStatus(currentDemande._id, "Approuvé")}
                className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                style={{ backgroundColor: selectedColor }}
              >
                <Check size={20} />
                Approuver
              </button>
              
              <button
                onClick={() => handleDeclineDemande(currentDemande._id)}
                className={`px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300 ${
                  darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                <X size={20} />
                Décliner
              </button>
            </div>
          </div>
        </div>
      )}

      {showReasonModal && (
        <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
          <div className={`p-6 rounded-lg shadow-xl w-1/3 min-w-[400px] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Détail de la raison</h3>
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

      {showNumSerieModal && (
        <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
          <div className={`p-6 rounded-lg shadow-xl w-1/3 min-w-[400px] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Numéro de série complet</h3>
              <button
                onClick={() => setShowNumSerieModal(false)}
                className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <p className={`whitespace-pre-wrap ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                {selectedNumSerie}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowNumSerieModal(false)}
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

      {showDeleteModal && role === 'Technicien' && (
        <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
          <div className={`p-6 rounded-lg shadow-xl w-1/3 min-w-[400px] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Demande de suppression</h3>
              <button
                onClick={handleCloseModal}
                className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className={`border px-4 py-3 rounded relative mb-4 ${
                darkMode ? "bg-red-900 border-red-700 text-red-100" : "bg-red-100 border-red-400 text-red-700"
              }`}>
                <span className="block sm:inline">{error}</span>
                <button 
                  className="absolute top-0 bottom-0 right-0 px-4 py-3" 
                  onClick={() => setError(null)}
                >
                  <X size={20} className={darkMode ? "text-red-300" : "text-red-500"} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Type d'élément à supprimer
                  </label>
                  <select
                    name="type"
                    value={selectedType}
                    onChange={handleTypeChange}
                    className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                      darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                      'border-gray-300 focus:border-blue-500'
                    }`}
                    required
                  >
                    <option value="equipement">Équipement</option>
                    <option value="composant">Composant</option>
                    <option value="capteur">Capteur</option>
                  </select>
                </div>

                {selectedType === 'equipement' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Sélectionnez un équipement {fieldErrors.equipement && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
                    </label>
                    <select
                      name="equipement"
                      value={formData.equipement}
                      onChange={handleInputChange}
                      className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                        fieldErrors.equipement ? 'border-red-500' : 
                        darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                        'border-gray-300 focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value="">Sélectionnez un équipement</option>
                      {equipements.map((equipement) => (
                        <option key={equipement._id} value={equipement._id}>
                          {equipement.nom} - {equipement.departement?.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedType === 'composant' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Sélectionnez un composant {fieldErrors.composant && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
                    </label>
                    <select
                      name="composant"
                      value={formData.composant}
                      onChange={handleInputChange}
                      className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                        fieldErrors.composant ? 'border-red-500' : 
                        darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                        'border-gray-300 focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value="">Sélectionnez un composant</option>
                      {composants.map((composant) => (
                        <option key={composant._id} value={composant._id}>
                          {composant.nom} - {composant.equipement?.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedType === 'capteur' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Sélectionnez un capteur {fieldErrors.capteur && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
                    </label>
                    <select
                      name="capteur"
                      value={formData.capteur}
                      onChange={handleInputChange}
                      className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                        fieldErrors.capteur ? 'border-red-500' : 
                        darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                        'border-gray-300 focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value="">Sélectionnez un capteur</option>
                      {capteurs.map((capteur) => (
                        <option key={capteur._id} value={capteur._id}>
                          {capteur.type} - {capteur.numSerie} ({capteur.composant?.nom})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Raison de la suppression {fieldErrors.raison && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
                  </label>
                  <input
                    type="text"
                    name="raison"
                    value={formData.raison}
                    onChange={handleInputChange}
                    className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                      fieldErrors.raison ? 'border-red-500' : 
                      darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                      'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Pourquoi souhaitez-vous supprimer cet élément ?"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                <button
                  className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
                  style={{ backgroundColor: selectedColor }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    "Envoi en cours..."
                  ) : (
                    <>
                      <Plus size={20} />
                      Envoyer la demande
                    </>
                  )}
                </button>
                <button
                  className={`px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300 ${
                    darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  <X size={20} />
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        {role === 'Technicien' && (
          <button
            onClick={handleOpenDeleteModal}
            className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
            style={{ backgroundColor: selectedColor }}
          >
            <Plus size={20} />
            Nouvelle demande
          </button>
        )}
        <div className="relative w-96">
          <SearchbarDemande
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
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Élément à supprimer</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Type</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Numéro de série</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Demandeur</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Statut</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Raison</th>
                <th className="p-4 font-semibold text-sm whitespace-nowrap">Date de création</th>
                {role === 'Administrateur' && (
                  <th className="p-4 font-semibold text-sm whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((demande, index) => {
                  const statutClass = getStatutClass(demande.statut);
                  const numSerie = getNumSerie(demande);
                  return (
                    <tr 
                      key={demande._id} 
                      className={`border-t ${
                        darkMode 
                          ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" 
                          : index % 2 === 1 ? "bg-gray-50" : "bg-white"
                      } h-16`}
                    >
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {getElementInfo(demande)}
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {getElementType(demande)}
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        <div className="flex items-center">
                          <div className="line-clamp-1 flex-1">
                            {numSerie.length > 6 ? `${numSerie.substring(0, 6)}...` : numSerie}
                          </div>
                          {numSerie.length > 6 && (
                            <button 
                              onClick={() => openNumSerieModal(numSerie)}
                              className={`ml-2 text-sm ${darkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-800"}`}
                            >
                              Voir plus
                            </button>
                          )}
                        </div>
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {demande.demandeur?.prenom} {demande.demandeur?.nom}
                      </td>
                      <td className={`p-4 border-b whitespace-nowrap`}>
                        <span className={`flex items-center gap-1 ${statutClass.className}`}>
                          {statutClass.icon} {demande.statut}
                        </span>
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        <div className="flex items-center">
                          <div className="line-clamp-2 flex-1">
                            {demande.raison.length > 10 ? `${demande.raison.substring(0, 10)}...` : demande.raison}
                          </div>
                          {demande.raison.length > 10 && (
                            <button 
                              onClick={() => openReasonModal(demande.raison)}
                              className={`ml-2 text-sm ${darkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-800"}`}
                            >
                              Voir plus
                            </button>
                          )}
                        </div>
                      </td>
                      <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                        {formatDate(demande.timestamp)}
                      </td>
                      {role === 'Administrateur' && (
                        <td className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} text-center`}>
                          <div className="flex justify-center">
                            {demande.statut === 'en cours de traitemant' ? (
                              <button
                                onClick={() => openStatusModal(demande)}
                                className="px-3 py-2 rounded-full shadow-lg flex items-center gap-1 hover:shadow-xl transition duration-200"
                                style={{ 
                                  backgroundColor: selectedColor,
                                  color: "white"
                                }}
                              >
                                <MoreVertical size={14} />
                                <span>Traiter</span>
                              </button>
                            ) : (
                                <span style={{ color: selectedColor }}>Traitée</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={role === 'Administrateur' ? 8 : 7} className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Aucune demande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredDemandes.length > itemsPerPage && (
          <div className={`flex items-center justify-between p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <div className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredDemandes.length)} sur {filteredDemandes.length} demandes
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

export default DemandeList;