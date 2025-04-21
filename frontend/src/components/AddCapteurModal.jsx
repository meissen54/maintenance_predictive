import React, { useState, useEffect } from "react";
import { CalendarDaysIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AddCapteurModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  onCapteurAdded, 
  selectedColor,
  darkMode = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newCapteur, setNewCapteur] = useState({
    description: "",
    numSerie: "",
    dateInstallation: "",
    type: "",
    composant: "",
    equipement: ""
  });

  const [fieldErrors, setFieldErrors] = useState({
    numSerie: false,
    dateInstallation: false,
    type: false,
    composant: false,
    equipement: false
  });

  const [composants, setComposants] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [filteredComposants, setFilteredComposants] = useState([]);
  const [filteredEquipements, setFilteredEquipements] = useState([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);
    }

    const fetchData = async () => {
      try {
        const [composantResponse, equipementResponse] = await Promise.all([
          axios.get("http://localhost:4000/apiComposant/getComposant", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:4000/apiEquipement/getEquipement", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setComposants(composantResponse.data);
        setEquipements(equipementResponse.data);
        setFilteredComposants(composantResponse.data);
        setFilteredEquipements(equipementResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données");
      }
    };

    if (isModalOpen) {
      fetchData();
      setNewCapteur({
        description: "",
        numSerie: "",
        dateInstallation: "",
        type: "",
        composant: "",
        equipement: ""
      });
      setFieldErrors({
        numSerie: false,
        dateInstallation: false,
        type: false,
        composant: false,
        equipement: false
      });
      setError(null);
    }
  }, [isModalOpen, role]);

  useEffect(() => {
    if (newCapteur.equipement) {
      const filtered = composants.filter(comp => 
        String(comp.equipement?._id || comp.equipement) === String(newCapteur.equipement)
      );
      setFilteredComposants(filtered);
    } else {
      setFilteredComposants(composants);
    }
  }, [newCapteur.equipement, composants]);

  useEffect(() => {
    if (newCapteur.composant) {
      const selectedComposant = composants.find(c => c._id === newCapteur.composant);
      if (selectedComposant?.equipement) {
        const filtered = equipements.filter(equip => 
          String(equip._id) === String(selectedComposant.equipement._id || selectedComposant.equipement)
        );
        setFilteredEquipements(filtered);
      } else {
        setFilteredEquipements(equipements);
      }
    } else {
      setFilteredEquipements(equipements);
    }
  }, [newCapteur.composant, equipements, composants]);

  const validateFields = () => {
    const errors = {
      numSerie: !newCapteur.numSerie.trim(),
      dateInstallation: !newCapteur.dateInstallation,
      type: !newCapteur.type,
      composant: !newCapteur.composant,
      equipement: !newCapteur.equipement
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      // Formatage des données selon le schéma Mongoose
      const payload = {
        description: newCapteur.description.trim(),
        numSerie: newCapteur.numSerie.trim(),
        dateInstallation: new Date(newCapteur.dateInstallation).toISOString(),
        type: newCapteur.type.toLowerCase(), // Conversion en minuscules pour matcher l'enum
        composant: newCapteur.composant
      };

      console.log("Payload envoyé:", payload);

      const response = await axios.post(
        "http://localhost:4000/apiCapteur/addCapteur", 
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );
      
      setIsModalOpen(false);
      onCapteurAdded(response.data);
    } catch (err) {
      console.error("Erreur complète:", {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });

      let errorMessage = "Erreur lors de l'ajout du capteur";
      
      if (err.response?.data) {
        // Gestion des erreurs spécifiques du backend
        if (err.response.data.includes("duplicate key error")) {
          errorMessage = "Ce numéro de série existe déjà";
        } else if (err.response.data.includes("validation failed")) {
          errorMessage = "Données invalides (vérifiez le type)";
        } else {
          errorMessage = err.response.data.message || err.response.data;
        }
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Timeout - Le serveur ne répond pas";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleComposantChange = (e) => {
    const selectedComposantId = e.target.value;
    const selectedComposant = composants.find(comp => comp._id === selectedComposantId);
    
    setNewCapteur(prev => ({
      ...prev,
      composant: selectedComposantId,
      equipement: selectedComposant?.equipement?._id || selectedComposant?.equipement || ""
    }));
    
    setFieldErrors(prev => ({ ...prev, composant: false }));
  };

  const handleEquipementChange = (e) => {
    const selectedEquipementId = e.target.value;
    
    setNewCapteur(prev => ({
      ...prev,
      equipement: selectedEquipementId,
      composant: ""
    }));
    
    setFieldErrors(prev => ({ ...prev, equipement: false }));
  };

  if (!isModalOpen) return null;

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50 p-4`}>
      <div className={`rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
        {/* Header */}
        <div className={`p-4 border-b rounded-t-lg sticky top-0 z-10 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Ajouter un capteur</h3>
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

          <div className="space-y-4">
            {/* Type - Full width */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Type {fieldErrors.type && <span className="text-red-500 text-xs">(*)</span>}
              </label>
              <select
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.type ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                value={newCapteur.type}
                onChange={(e) => {
                  setNewCapteur({ ...newCapteur, type: e.target.value });
                  setFieldErrors({ ...fieldErrors, type: false });
                }}
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="température">Température</option>
                <option value="poids">Poids</option>
                <option value="humidité">Humidité</option>
                <option value="vibration">Vibration</option>
                <option value="gaz">Gaz</option>
              </select>
            </div>

            {/* Description - Full width */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Description
              </label>
              <textarea
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: Capteur pour mesurer la température ambiante"
                value={newCapteur.description}
                onChange={(e) => setNewCapteur({ ...newCapteur, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Numéro de série et Date installation - Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Numéro de série {fieldErrors.numSerie && <span className="text-red-500 text-xs">(*)</span>}
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                    fieldErrors.numSerie ? 'border-red-500' : 
                    darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                    'border-gray-300 focus:border-green-500'
                  }`}
                  placeholder="Ex: CAPT-2023-001"
                  value={newCapteur.numSerie}
                  onChange={(e) => {
                    setNewCapteur({ ...newCapteur, numSerie: e.target.value });
                    setFieldErrors({ ...fieldErrors, numSerie: false });
                  }}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Date installation {fieldErrors.dateInstallation && <span className="text-red-500 text-xs">(*)</span>}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className={`w-full p-2 border-2 rounded-lg pl-10 focus:outline-none ${
                      fieldErrors.dateInstallation ? 'border-red-500' : 
                      darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                      'border-gray-300 focus:border-green-500'
                    }`}
                    value={newCapteur.dateInstallation}
                    onChange={(e) => {
                      setNewCapteur({ ...newCapteur, dateInstallation: e.target.value });
                      setFieldErrors({ ...fieldErrors, dateInstallation: false });
                    }}
                    required
                  />
                  <CalendarDaysIcon className={`absolute left-3 top-2.5 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                </div>
              </div>
            </div>

            {/* Equipement et Composant - Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Équipement {fieldErrors.equipement && <span className="text-red-500 text-xs">(*)</span>}
                </label>
                <select
                  className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                    fieldErrors.equipement ? 'border-red-500' : 
                    darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                    'border-gray-300 focus:border-green-500'
                  }`}
                  value={newCapteur.equipement}
                  onChange={handleEquipementChange}
                  required
                >
                  <option value="">Sélectionner un équipement</option>
                  {filteredEquipements.map((equipement) => (
                    <option key={equipement._id} value={equipement._id}>
                      {equipement.nom} - {equipement.departement?.nom || "Non affecté"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Composant {fieldErrors.composant && <span className="text-red-500 text-xs">(*)</span>}
                </label>
                <select
                  className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                    fieldErrors.composant ? 'border-red-500' : 
                    darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                    'border-gray-300 focus:border-green-500'
                  }`}
                  value={newCapteur.composant}
                  onChange={handleComposantChange}
                  required
                >
                  <option value="">Sélectionner un composant</option>
                  {filteredComposants.map((composant) => (
                    <option key={composant._id} value={composant._id}>
                      {composant.nom} - {composant.equipement?.nom || "Non affecté"}
                    </option>
                  ))}
                </select>
              </div>
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

export default AddCapteurModal;