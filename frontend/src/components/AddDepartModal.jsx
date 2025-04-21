import React, { useState, useEffect } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AddDepartModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  onDepartAdded, 
  selectedColor,
  darkMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newDepart, setNewDepart] = useState({
    nom: "",
    code: "" // Ajout du champ code pour correspondre à l'API
  });

  const [fieldErrors, setFieldErrors] = useState({
    nom: "",
    code: ""
  });

  useEffect(() => {
    if (isModalOpen) {
      setNewDepart({
        nom: "",
        code: ""
      });
      setFieldErrors({
        nom: "",
        code: ""
      });
      setError(null);
    }
  }, [isModalOpen]);

  const validateFields = () => {
    let isValid = true;
    const newErrors = {
      nom: "",
      code: ""
    };

    if (!newDepart.nom.trim()) {
      newErrors.nom = "Ce champ est obligatoire";
      isValid = false;
    }

    if (!newDepart.code.trim()) {
      newErrors.code = "Ce champ est obligatoire";
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    setNewDepart(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:4000/apiDepart/addDepart", 
        newDepart,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      
      setIsModalOpen(false);
      onDepartAdded(response.data);
    } catch (err) {
      console.error("Error adding departement:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Erreur lors de l'ajout du département"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50 p-4`}>
      <div className={`rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
        {/* Header */}
        <div className={`p-4 border-b rounded-t-lg sticky top-0 z-10 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Ajouter un département</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className={`p-1 rounded-full hover:bg-gray-100 ${darkMode ? "text-gray-300 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-700"}`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-4 md:p-6">
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

          <div className="grid grid-cols-1 gap-4">
            {/* Nom du département */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Nom *
              </label>
              <input
                type="text"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.nom ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: Maintenance"
                value={newDepart.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
              />
              {fieldErrors.nom && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.nom}</p>
              )}
            </div>

            {/* Code du département */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Code *
              </label>
              <input
                type="text"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.code ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: DEP-001"
                value={newDepart.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
              />
              {fieldErrors.code && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.code}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t rounded-b-lg sticky bottom-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex justify-center space-x-4">
            <button
              className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
              style={{ backgroundColor: selectedColor }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                "En cours..."
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  Ajouter
                </>
              )}
            </button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepartModal;