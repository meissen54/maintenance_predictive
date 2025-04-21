import React, { useState, useEffect } from "react";
import { CalendarDaysIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../index.css";

const UpdateEquipementModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  equipementToUpdate, 
  onEquipementUpdated, 
  selectedColor,
  darkMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fonction pour formater la date pour l'input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Erreur de formatage de date:", e);
      return "";
    }
  };

  // Fonction pour extraire l'ID du département
  const getDepartementId = (departement) => {
    if (!departement) return "";
    if (typeof departement === 'object') return departement._id || "";
    return departement;
  };

  // Fonction pour extraire le nom du département
  const getDepartementName = (departement) => {
    if (!departement) return "";
    if (typeof departement === 'object') return departement.nom || "";
    return departement;
  };

  // État initial du formulaire
  const [updatedEquipement, setUpdatedEquipement] = useState({
    nom: equipementToUpdate.nom || "",
    description: equipementToUpdate.description || "",
    numSerie: equipementToUpdate.numSerie || "",
    dateAchat: formatDateForInput(equipementToUpdate.dateAchat),
    etat: equipementToUpdate.etat || "",
    departement: getDepartementId(equipementToUpdate.departement) || "",
  });

  const [departements, setDepartements] = useState([]);
  const [role, setRole] = useState("");

  // Récupérer le rôle de l'utilisateur
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setRole(decodedToken.role);
      } catch (error) {
        console.error("Erreur de décodage du token:", error);
      }
    }
  }, []);

  // Récupérer les départements
  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vous devez être connecté pour accéder à cette ressource.");
          return;
        }

        const apiURL = "http://localhost:4000/apiDepart/getDepart";
        const response = await axios.get(apiURL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setDepartements(response.data);
        } else {
          throw new Error("Format de données inattendu pour les départements");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des départements:", error);
        setError(error.message || "Impossible de charger les départements.");
        setDepartements([]);
      }
    };

    if (role) {
      fetchDepartements();
    }
  }, [role]);

  if (!isModalOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation des données
      if (!updatedEquipement.nom || !updatedEquipement.numSerie || !updatedEquipement.etat || !updatedEquipement.departement) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      // Préparation des données pour l'API
      const equipementData = {
        nom: updatedEquipement.nom,
        description: updatedEquipement.description,
        numSerie: updatedEquipement.numSerie,
        dateAchat: updatedEquipement.dateAchat ? new Date(updatedEquipement.dateAchat).toISOString() : null,
        etat: updatedEquipement.etat,
        departement: updatedEquipement.departement, // On envoie l'ID du département
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.put(
        `http://localhost:4000/apiEquipement/updateEquipement/${equipementToUpdate._id}`,
        equipementData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setIsModalOpen(false);
      onEquipementUpdated(response.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      
      let errorMessage = "Une erreur s'est produite lors de la mise à jour.";
      if (error.response) {
        // Erreur avec réponse du serveur
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage = "Erreur serveur - Veuillez contacter l'administrateur";
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMessage = "Pas de réponse du serveur - Vérifiez votre connexion";
      } else {
        // Erreur de configuration
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
      <div className={`p-6 rounded-lg shadow-xl w-2/3 flex flex-col ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
        {error && (
          <div className={`border px-4 py-3 rounded relative mb-4 ${
            darkMode ? "bg-red-900 border-red-700 text-red-100" : "bg-red-100 border-red-400 text-red-700"
          }`}>
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3" 
              onClick={() => setError(null)}
            >
              <XMarkIcon className={`h-5 w-5 ${darkMode ? "text-red-300" : "text-red-500"}`} />
            </button>
          </div>
        )}
        
        <div className="flex flex-1">
          {/* Colonne de gauche : Aperçu */}
          <div className={`w-1/2 pr-4 ${darkMode ? "border-gray-700" : "border-gray-200"} border-r`}>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Aperçu actuel</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nom</label>
                <p className={`mt-1 p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  {equipementToUpdate.nom}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                <p className={`mt-1 p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  {equipementToUpdate.description}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Numéro de série</label>
                <p className={`mt-1 p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  {equipementToUpdate.numSerie}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date d'achat</label>
                <p className={`mt-1 p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  {equipementToUpdate.dateAchat ? new Date(equipementToUpdate.dateAchat).toLocaleDateString() : "Non spécifiée"}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>État</label>
                <p className={`mt-1 p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  {equipementToUpdate.etat}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Département</label>
                <p className={`mt-1 p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  {getDepartementName(equipementToUpdate.departement) || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>

          {/* Colonne de droite : Formulaire de modification */}
          <div className="w-1/2 pl-4">
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Modifier l'équipement</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nom *</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-blue-500 text-white" 
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Entrez le nom de l'équipement"
                  value={updatedEquipement.nom}
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, nom: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-blue-500 text-white" 
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Décrivez l'équipement"
                  value={updatedEquipement.description}
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, description: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Numéro de série *</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-blue-500 text-white" 
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Entrez le numéro de série"
                  value={updatedEquipement.numSerie}
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, numSerie: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date d'achat</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    className={`w-full p-3 border-2 rounded-lg pl-10 focus:outline-none ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-blue-500 text-white" 
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Sélectionnez la date d'achat"
                    value={updatedEquipement.dateAchat}
                    onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, dateAchat: e.target.value })}
                  />
                  <CalendarDaysIcon className={`absolute left-3 top-3 w-5 h-5 ${
                    darkMode ? "text-gray-400" : "text-gray-400"
                  }`} />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>État *</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-blue-500 text-white" 
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  value={updatedEquipement.etat}
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, etat: e.target.value })}
                  required
                >
                  <option value="">Sélectionner l'état</option>
                  <option value="fonctionnel">Fonctionnel</option>
                  <option value="en maintenance">En maintenance</option>
                  <option value="défectueux">Défectueux</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Département *</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-blue-500 text-white" 
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  value={updatedEquipement.departement}
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, departement: e.target.value })}
                  required
                >
                  <option value="">Sélectionner le département</option>
                  {Array.isArray(departements) && departements.map((departement) => (
                    <option 
                      key={departement._id} 
                      value={departement._id} // On utilise l'ID comme valeur
                    >
                      {departement.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            className={`px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300 ${
              darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            onClick={() => setIsModalOpen(false)}
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5" />
            Annuler
          </button>
          <button
            className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
            style={{ backgroundColor: selectedColor }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Mise à jour..." : <><PencilIcon className="h-5 w-5" />Mettre à jour</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateEquipementModal;