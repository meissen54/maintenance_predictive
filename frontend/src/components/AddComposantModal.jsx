import React, { useState, useEffect } from "react";
import { CalendarDaysIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AddComposantModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  onComposantAdded, 
  selectedColor,
  darkMode = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComposant, setNewComposant] = useState({
    nom: "",
    description: "",
    numSerieComposant: "",
    dateInstallation: "",
    etat: "fonctionnel",
    type: "matériel",
    departement: "",
    equipement: "",
    fabricant: "",
    delaiExpi: "",
    capteurs: []
  });

  const [fieldErrors, setFieldErrors] = useState({
    nom: false,
    description: false,
    numSerieComposant: false,
    dateInstallation: false,
    etat: false,
    type: false,
    departement: false,
    equipement: false,
    fabricant: false,
    delaiExpi: false
  });

  const [departements, setDepartements] = useState([]);
  const [equipements, setEquipements] = useState([]);
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
        const [departResponse, equipResponse] = await Promise.all([
          axios.get("http://localhost:4000/apiDepart/getDepart", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:4000/apiEquipement/getEquipement", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setDepartements(departResponse.data);
        const formattedEquipements = equipResponse.data.map(equip => ({
          ...equip,
          departement: equip.departement?._id || equip.departement
        }));
        setEquipements(formattedEquipements);
        setFilteredEquipements(formattedEquipements);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données");
      }
    };

    if (isModalOpen) {
      fetchData();
      setNewComposant({
        nom: "",
        description: "",
        numSerieComposant: "",
        dateInstallation: "",
        etat: "fonctionnel",
        type: "matériel",
        departement: "",
        equipement: "",
        fabricant: "",
        delaiExpi: "",
        capteurs: []
      });
      setFieldErrors({
        nom: false,
        description: false,
        numSerieComposant: false,
        dateInstallation: false,
        etat: false,
        type: false,
        departement: false,
        equipement: false,
        fabricant: false,
        delaiExpi: false
      });
      setError(null);
    }
  }, [isModalOpen, role]);

  useEffect(() => {
    if (newComposant.departement) {
      const filtered = equipements.filter(equipement => 
        String(equipement.departement) === String(newComposant.departement)
      );
      setFilteredEquipements(filtered);
    } else {
      setFilteredEquipements(equipements);
    }
  }, [newComposant.departement, equipements]);

  const validateFields = () => {
    const errors = {
      nom: !newComposant.nom.trim(),
      description: !newComposant.description.trim(),
      numSerieComposant: !newComposant.numSerieComposant.trim(),
      dateInstallation: !newComposant.dateInstallation,
      etat: !newComposant.etat,
      type: !newComposant.type,
      departement: !newComposant.departement,
      equipement: !newComposant.equipement,
      fabricant: !newComposant.fabricant.trim(),
      delaiExpi: !newComposant.delaiExpi
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
      const payload = {
        nom: newComposant.nom.trim(),
        description: newComposant.description.trim(),
        numSerieComposant: newComposant.numSerieComposant.trim(),
        dateInstallation: newComposant.dateInstallation,
        etat: newComposant.etat,
        type: newComposant.type === "médicament" ? "médicamment" : newComposant.type,
        departement: newComposant.departement,
        equipement: newComposant.equipement,
        capteurs: newComposant.capteurs,
        fabricant: newComposant.fabricant.trim(),
        delaiExpi: newComposant.delaiExpi
      };

      const response = await axios.post(
        "http://localhost:4000/apiComposant/addComposant", 
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      
      setIsModalOpen(false);
      onComposantAdded(response.data);
    } catch (err) {
      console.error("Error adding composant:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Erreur lors de l'ajout du composant"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEquipementChange = (e) => {
    const selectedEquipementId = e.target.value;
    const selectedEquipement = equipements.find(equip => equip._id === selectedEquipementId);
    
    setNewComposant(prev => ({
      ...prev,
      equipement: selectedEquipementId,
      departement: selectedEquipement?.departement || ""
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
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Ajouter un composant</h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Nom {fieldErrors.nom && <span className="text-red-500 text-xs">(*)</span>}
              </label>
              <input
                type="text"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.nom ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: Ventilateur de refroidissement"
                value={newComposant.nom}
                onChange={(e) => {
                  setNewComposant({ ...newComposant, nom: e.target.value });
                  setFieldErrors({ ...fieldErrors, nom: false });
                }}
              />
            </div>

            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Description {fieldErrors.description && <span className="text-red-500 text-xs">(*)</span>}
              </label>
              <textarea
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.description ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: Ventilateur pour système d'imagerie"
                value={newComposant.description}
                onChange={(e) => {
                  setNewComposant({ ...newComposant, description: e.target.value });
                  setFieldErrors({ ...fieldErrors, description: false });
                }}
                rows={3}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Numéro de série {fieldErrors.numSerieComposant && <span className="text-red-500 text-xs">(*)</span>}
              </label>
              <input
                type="text"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.numSerieComposant ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: VENT-2023-001"
                value={newComposant.numSerieComposant}
                onChange={(e) => {
                  setNewComposant({ ...newComposant, numSerieComposant: e.target.value });
                  setFieldErrors({ ...fieldErrors, numSerieComposant: false });
                }}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Fabricant {fieldErrors.fabricant && <span className="text-red-500 text-xs">(*)</span>}
              </label>
              <input
                type="text"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.fabricant ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: Siemens Medical"
                value={newComposant.fabricant}
                onChange={(e) => {
                  setNewComposant({ ...newComposant, fabricant: e.target.value });
                  setFieldErrors({ ...fieldErrors, fabricant: false });
                }}
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
                  value={newComposant.dateInstallation}
                  onChange={(e) => {
                    setNewComposant({ ...newComposant, dateInstallation: e.target.value });
                    setFieldErrors({ ...fieldErrors, dateInstallation: false });
                  }}
                />
                <CalendarDaysIcon className={`absolute left-3 top-2.5 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Date expiration {fieldErrors.delaiExpi && <span className="text-red-500 text-xs">(*)</span>}
              </label>
              <div className="relative">
                <input
                  type="date"
                  className={`w-full p-2 border-2 rounded-lg pl-10 focus:outline-none ${
                    fieldErrors.delaiExpi ? 'border-red-500' : 
                    darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                    'border-gray-300 focus:border-green-500'
                  }`}
                  value={newComposant.delaiExpi}
                  onChange={(e) => {
                    setNewComposant({ ...newComposant, delaiExpi: e.target.value });
                    setFieldErrors({ ...fieldErrors, delaiExpi: false });
                  }}
                />
                <CalendarDaysIcon className={`absolute left-3 top-2.5 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                État {fieldErrors.etat && <span className="text-red-500 text-xs">(*)</span>}
              </label>
              <select
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.etat ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                value={newComposant.etat}
                onChange={(e) => {
                  setNewComposant({ ...newComposant, etat: e.target.value });
                  setFieldErrors({ ...fieldErrors, etat: false });
                }}
              >
                <option value="fonctionnel">Fonctionnel</option>
                <option value="en maintenance">En maintenance</option>
                <option value="défectueux">Défectueux</option>
              </select>
            </div>

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
                value={newComposant.type}
                onChange={(e) => {
                  setNewComposant({ ...newComposant, type: e.target.value });
                  setFieldErrors({ ...fieldErrors, type: false });
                }}
              >
                <option value="matériel">Matériel</option>
                <option value="médicament">Médicament</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Département {fieldErrors.departement && <span className="text-red-500 text-xs">(*)</span>}
              </label>
              <select
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.departement ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                value={newComposant.departement}
                onChange={(e) => {
                  setNewComposant({ 
                    ...newComposant, 
                    departement: e.target.value,
                    equipement: ""
                  });
                  setFieldErrors({ ...fieldErrors, departement: false });
                }}
              >
                <option value="">Sélectionner un département</option>
                {departements.map((departement) => (
                  <option key={departement._id} value={departement._id}>
                    {departement.nom}
                  </option>
                ))}
              </select>
            </div>

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
                value={newComposant.equipement}
                onChange={handleEquipementChange}
              >
                <option value="">Sélectionner un équipement</option>
                {filteredEquipements.map((equipement) => {
                  const departementNom = departements.find(d => d._id === equipement.departement)?.nom || "Inconnu";
                  return (
                    <option key={equipement._id} value={equipement._id}>
                      {equipement.nom} - {departementNom}
                    </option>
                  );
                })}
              </select>
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

export default AddComposantModal;