import React, { useState, useEffect } from "react";
import { CalendarDaysIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../index.css";

const UpdateEquipementModal = ({ isModalOpen, setIsModalOpen, equipementToUpdate, onEquipementUpdated, selectedColor }) => {
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-2/3 flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3" 
              onClick={() => setError(null)}
            >
              <XMarkIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        )}
        
        <div className="flex flex-1">
          {/* Colonne de gauche : Aperçu */}
          <div className="w-1/2 pr-4 border-r border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Aperçu actuel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg">{equipementToUpdate.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg">{equipementToUpdate.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro de série</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg">{equipementToUpdate.numSerie}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'achat</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg">
                  {equipementToUpdate.dateAchat ? new Date(equipementToUpdate.dateAchat).toLocaleDateString() : "Non spécifiée"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">État</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg">{equipementToUpdate.etat}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Département</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg">
                  {getDepartementName(equipementToUpdate.departement) || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>

          {/* Colonne de droite : Formulaire de modification */}
          <div className="w-1/2 pl-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Modifier l'équipement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom *</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Entrez le nom de l'équipement"
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, nom: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Décrivez l'équipement"
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro de série *</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Entrez le numéro de série"
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, numSerie: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'achat</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg pl-10 focus:border-green-500 focus:outline-none"
                    placeholder="Sélectionnez la date d'achat"
                    onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, dateAchat: e.target.value })}
                  />
                  <CalendarDaysIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">État *</label>
                <select
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, etat: e.target.value })}
                  required
                >
                  <option value="fonctionnel">Fonctionnel</option>
                  <option value="en maintenance">En maintenance</option>
                  <option value="défectueux">Défectueux</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Département *</label>
                <select
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  onChange={(e) => setUpdatedEquipement({ ...updatedEquipement, departement: e.target.value })}
                  required
                >
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
            className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
            style={{ backgroundColor: "#9ca3af" }}
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