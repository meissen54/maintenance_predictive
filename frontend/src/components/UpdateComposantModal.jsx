import React, { useState, useEffect } from "react";
import { CalendarDaysIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UpdateComposantModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  composantToUpdate, 
  onComposantUpdated, 
  selectedColor,
  darkMode = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  const getId = (item) => {
    if (!item) return "";
    if (typeof item === 'object') return item._id || "";
    return item;
  };

  const getName = (item) => {
    if (!item) return "Non spécifié";
    if (typeof item === 'object') return item.nom || "Non spécifié";
    return item;
  };

  const [updatedComposant, setUpdatedComposant] = useState({
    nom: composantToUpdate.nom || "",
    description: composantToUpdate.description || "",
    numSerieComposant: composantToUpdate.numSerieComposant || "",
    dateInstallation: formatDateForInput(composantToUpdate.dateInstallation),
    etat: composantToUpdate.etat || "",
    type: composantToUpdate.type || "",
    departement: getId(composantToUpdate.departement) || "",
    equipement: getId(composantToUpdate.equipement) || "",
    fabricant: composantToUpdate.fabricant || "",
    delaiExpi: formatDateForInput(composantToUpdate.delaiExpi),
  });

  const [departements, setDepartements] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [role, setRole] = useState("");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vous devez être connecté pour accéder à cette ressource.");
          return;
        }

        const departResponse = await axios.get("http://localhost:4000/apiDepart/getDepart", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartements(Array.isArray(departResponse.data) ? departResponse.data : []);

        const equipResponse = await axios.get("http://localhost:4000/apiEquipement/getEquipement", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEquipements(Array.isArray(equipResponse.data) ? equipResponse.data : []);

      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError(error.message || "Impossible de charger les données.");
      }
    };

    if (role) {
      fetchData();
    }
  }, [role]);

  if (!isModalOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!updatedComposant.nom || !updatedComposant.numSerieComposant || 
          !updatedComposant.etat || !updatedComposant.type || 
          !updatedComposant.departement || !updatedComposant.equipement ||
          !updatedComposant.fabricant || !updatedComposant.delaiExpi) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      const composantData = {
        nom: updatedComposant.nom,
        description: updatedComposant.description,
        numSerieComposant: updatedComposant.numSerieComposant,
        dateInstallation: updatedComposant.dateInstallation ? new Date(updatedComposant.dateInstallation).toISOString() : null,
        etat: updatedComposant.etat,
        type: updatedComposant.type,
        departement: updatedComposant.departement,
        equipement: updatedComposant.equipement,
        fabricant: updatedComposant.fabricant,
        delaiExpi: updatedComposant.delaiExpi ? new Date(updatedComposant.delaiExpi).toISOString() : null,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.put(
        `http://localhost:4000/apiComposant/updateComposant/${composantToUpdate._id}`,
        composantData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setIsModalOpen(false);
      onComposantUpdated(response.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      
      let errorMessage = "Une erreur s'est produite lors de la mise à jour.";
      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage = "Erreur serveur - Veuillez contacter l'administrateur";
        }
      } else if (error.request) {
        errorMessage = "Pas de réponse du serveur - Vérifiez votre connexion";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
      <div className={`rounded-lg shadow-xl w-4/5 flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Aperçu actuel</h3>
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} ml-16`}>Modifier le composant</h3>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
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
          
          <div className="space-y-6">
            {/* Ligne Nom */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nom actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{composantToUpdate.nom}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau nom *</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedComposant.nom}
                  onChange={(e) => setUpdatedComposant({ ...updatedComposant, nom: e.target.value })}
                  placeholder="Entrez le nouveau nom"
                  required
                />
              </div>
            </div>

            {/* Ligne Description */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description actuelle</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{composantToUpdate.description || "Non spécifiée"}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvelle description</label>
                <textarea
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedComposant.description}
                  onChange={(e) => setUpdatedComposant({ ...updatedComposant, description: e.target.value })}
                  placeholder="Entrez la nouvelle description"
                />
              </div>
            </div>

            {/* Ligne Numéro de série */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Numéro de série actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{composantToUpdate.numSerieComposant}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau numéro de série *</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedComposant.numSerieComposant}
                  onChange={(e) => setUpdatedComposant({ ...updatedComposant, numSerieComposant: e.target.value })}
                  placeholder="Entrez le nouveau numéro de série"
                  required
                />
              </div>
            </div>

            {/* Ligne Date installation */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date installation actuelle</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{composantToUpdate.dateInstallation ? new Date(composantToUpdate.dateInstallation).toLocaleDateString() : "Non spécifiée"}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvelle date installation *</label>
                <div className="relative">
                  <input
                    type="date"
                    className={`w-full p-3 border-2 rounded-lg pl-10 focus:outline-none ${
                      darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                    }`}
                    value={updatedComposant.dateInstallation}
                    onChange={(e) => setUpdatedComposant({ ...updatedComposant, dateInstallation: e.target.value })}
                    required
                  />
                  <CalendarDaysIcon className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                </div>
              </div>
            </div>

            {/* Ligne État */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>État actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p className="capitalize">{composantToUpdate.etat}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvel état *</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedComposant.etat}
                  onChange={(e) => setUpdatedComposant({ ...updatedComposant, etat: e.target.value })}
                  required
                >
                  <option value="" disabled>Sélectionnez un état</option>
                  <option value="fonctionnel">Fonctionnel</option>
                  <option value="en maintenance">En maintenance</option>
                  <option value="défectueux">Défectueux</option>
                </select>
              </div>
            </div>

            {/* Ligne Type */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Type actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p className="capitalize">{composantToUpdate.type}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau type *</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedComposant.type}
                  onChange={(e) => setUpdatedComposant({ ...updatedComposant, type: e.target.value })}
                  required
                >
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="matériel">Matériel</option>
                  <option value="médicament">Médicament</option>
                </select>
              </div>
            </div>

            {/* Ligne Département */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Département actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{getName(composantToUpdate.departement)}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau département *</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedComposant.departement}
                  onChange={(e) => setUpdatedComposant({ ...updatedComposant, departement: e.target.value })}
                  required
                >
                  <option value="" disabled>Sélectionnez un département</option>
                  {departements.map((departement) => (
                    <option key={departement._id} value={departement._id}>
                      {departement.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ligne Équipement */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Équipement actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{getName(composantToUpdate.equipement)}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvel équipement *</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedComposant.equipement}
                  onChange={(e) => setUpdatedComposant({ ...updatedComposant, equipement: e.target.value })}
                  required
                >
                  <option value="" disabled>Sélectionnez un équipement</option>
                  {equipements.map((equipement) => (
                    <option key={equipement._id} value={equipement._id}>
                      {equipement.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ligne Fabricant */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Fabricant actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{composantToUpdate.fabricant}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau fabricant *</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedComposant.fabricant}
                  onChange={(e) => setUpdatedComposant({ ...updatedComposant, fabricant: e.target.value })}
                  placeholder="Entrez le nouveau fabricant"
                  required
                />
              </div>
            </div>

            {/* Ligne Date expiration */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date expiration actuelle</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{composantToUpdate.delaiExpi ? new Date(composantToUpdate.delaiExpi).toLocaleDateString() : "Non spécifiée"}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvelle date expiration *</label>
                <div className="relative">
                  <input
                    type="date"
                    className={`w-full p-3 border-2 rounded-lg pl-10 focus:outline-none ${
                      darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                    }`}
                    value={updatedComposant.delaiExpi}
                    onChange={(e) => setUpdatedComposant({ ...updatedComposant, delaiExpi: e.target.value })}
                    required
                  />
                  <CalendarDaysIcon className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 z-10 p-4 border-t ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} flex justify-end space-x-4`}>
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

export default UpdateComposantModal;