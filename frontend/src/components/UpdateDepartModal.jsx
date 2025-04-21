import React, { useState, useEffect } from "react";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UpdateDepartModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  departToUpdate, 
  onDepartUpdated, 
  selectedColor,
  darkMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedDepart, setUpdatedDepart] = useState({
    nom: "",
    code: ""
  });

  useEffect(() => {
    if (isModalOpen && departToUpdate) {
      setUpdatedDepart({
        nom: departToUpdate.nom || "",
        code: departToUpdate.code || ""
      });
    }
  }, [isModalOpen, departToUpdate]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.put(
        `http://localhost:4000/apiDepart/updateDepart/${departToUpdate._id}`,
        {
          nom: updatedDepart.nom,
          code: updatedDepart.code
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setIsModalOpen(false);
      onDepartUpdated(response.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      
      let errorMessage = "Une erreur s'est produite lors de la mise à jour du département.";
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

  if (!isModalOpen || !departToUpdate) return null;

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50 p-4`}>
      {/* Modal plus grande - width: max-w-2xl (42rem) et height: max-h-[80vh] */}
      <div className={`rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Aperçu actuel</h3>
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} ml-16`}>Modifier le département</h3>
          </div>
        </div>

        {/* Contenu scrollable avec plus d'espace */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className={`border px-4 py-3 rounded relative mb-6 ${
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
          
          <div className="space-y-8"> {/* Plus d'espace entre les éléments */}
            {/* Ligne Nom - avec plus de marge */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nom actuel</label>
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p className="text-lg">{departToUpdate.nom}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau nom</label>
                <input
                  type="text"
                  className={`w-full p-4 text-lg border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  placeholder="Entrez le nouveau nom"
                  value={updatedDepart.nom}
                  onChange={(e) => setUpdatedDepart({ ...updatedDepart, nom: e.target.value })}
                />
              </div>
            </div>

            {/* Ligne Code - avec plus de marge */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Code actuel</label>
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p className="text-lg">{departToUpdate.code}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau code</label>
                <input
                  type="text"
                  className={`w-full p-4 text-lg border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  placeholder="Entrez le nouveau code"
                  value={updatedDepart.code}
                  onChange={(e) => setUpdatedDepart({ ...updatedDepart, code: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Boutons plus grands et bien espacés en bas */}
        <div className={`p-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex justify-end space-x-6">
            <button
              className={`px-6 py-3 rounded-full flex items-center gap-2 text-lg ${
                darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              <XMarkIcon className="h-6 w-6" />
              Annuler
            </button>
            <button
              className={`px-6 py-3 rounded-full flex items-center gap-2 text-lg text-white`}
              style={{ backgroundColor: selectedColor }}
              onClick={handleSubmit}
              disabled={loading}
            >
              <PencilIcon className="h-6 w-6" />
              {loading ? "En cours..." : "Mettre à jour"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateDepartModal;