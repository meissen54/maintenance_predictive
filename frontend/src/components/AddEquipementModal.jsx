import React, { useState, useEffect } from "react";
import { CalendarDaysIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../index.css";

const AddEquipementModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  onEquipementAdded, 
  selectedColor,
  darkMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newEquipement, setNewEquipement] = useState({
    nom: "",
    description: "",
    numSerie: "",
    dateAchat: "",
    etat: "",
    departement: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    nom: false,
    description: false,
    numSerie: false,
    dateAchat: false,
    etat: false,
    departement: false,
  });

  const [departements, setDepartements] = useState([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);
    }

    const fetchDepartements = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vous devez être connecté pour accéder à cette ressource.");
          return;
        }

        let apiURL;
        if (role === "Administrateur") {
          apiURL = "http://localhost:4000/apiDepart/getDepart";
        }

        const response = await axios.get(apiURL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDepartements(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des départements :", error);
        if (error.response && error.response.status === 401) {
          setError("Vous n'êtes pas autorisé à accéder à cette ressource.");
        } else {
          setError("Impossible de charger les départements.");
        }
      }
    };

    fetchDepartements();
  }, [role]);

  const validateFields = () => {
    const errors = {
      nom: !newEquipement.nom,
      description: !newEquipement.description,
      numSerie: !newEquipement.numSerie,
      dateAchat: !newEquipement.dateAchat,
      etat: !newEquipement.etat,
      departement: !newEquipement.departement,
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

    const equipementData = {
      nom: newEquipement.nom,
      description: newEquipement.description,
      numSerie: newEquipement.numSerie,
      dateAchat: newEquipement.dateAchat,
      etat: newEquipement.etat,
      departement: newEquipement.departement,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:4000/apiEquipement/addEquipement", equipementData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsModalOpen(false);
      onEquipementAdded(response.data);
      setNewEquipement({
        nom: "",
        description: "",
        numSerie: "",
        dateAchat: "",
        etat: "",
        departement: "",
      });
      setFieldErrors({
        nom: false,
        description: false,
        numSerie: false,
        dateAchat: false,
        etat: false,
        departement: false,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'équipement :", error);
      setError("Une erreur s'est produite lors de l'ajout de l'équipement.");
    }

    setLoading(false);
  };

  if (!isModalOpen) return null;

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
      <div className={`p-6 rounded-lg shadow-xl w-1/3 min-w-[400px] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Ajouter un équipement</h3>
          <button
            onClick={() => {
              setIsModalOpen(false);
              setFieldErrors({
                nom: false,
                description: false,
                numSerie: false,
                dateAchat: false,
                etat: false,
                departement: false,
              });
            }}
            className={darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}
          >
            <XMarkIcon className="h-6 w-6" />
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
              <XMarkIcon className={`h-5 w-5 ${darkMode ? "text-red-300" : "text-red-500"}`} />
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Nom {fieldErrors.nom && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
            </label>
            <input
              type="text"
              className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                fieldErrors.nom ? 'border-red-500' : 
                darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Nom de l'équipement"
              value={newEquipement.nom}
              onChange={(e) => {
                setNewEquipement({ ...newEquipement, nom: e.target.value });
                setFieldErrors({ ...fieldErrors, nom: false });
              }}
              style={fieldErrors.nom ? {} : { borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Description {fieldErrors.description && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
            </label>
            <input
              type="text"
              className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                fieldErrors.description ? 'border-red-500' : 
                darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Description de l'équipement"
              value={newEquipement.description}
              onChange={(e) => {
                setNewEquipement({ ...newEquipement, description: e.target.value });
                setFieldErrors({ ...fieldErrors, description: false });
              }}
              style={fieldErrors.description ? {} : { borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Numéro de série {fieldErrors.numSerie && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
            </label>
            <input
              type="text"
              className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                fieldErrors.numSerie ? 'border-red-500' : 
                darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Numéro de série"
              value={newEquipement.numSerie}
              onChange={(e) => {
                setNewEquipement({ ...newEquipement, numSerie: e.target.value });
                setFieldErrors({ ...fieldErrors, numSerie: false });
              }}
              style={fieldErrors.numSerie ? {} : { borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Date d'achat {fieldErrors.dateAchat && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
            </label>
            <div className="relative">
              <input
                type="date"
                className={`w-full p-2 border-2 rounded-lg pl-10 focus:outline-none ${
                  fieldErrors.dateAchat ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-blue-500'
                }`}
                value={newEquipement.dateAchat}
                onChange={(e) => {
                  setNewEquipement({ ...newEquipement, dateAchat: e.target.value });
                  setFieldErrors({ ...fieldErrors, dateAchat: false });
                }}
                style={fieldErrors.dateAchat ? {} : { borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
              />
              <CalendarDaysIcon className={`absolute left-3 top-2.5 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              État {fieldErrors.etat && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
            </label>
            <select
              className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                fieldErrors.etat ? 'border-red-500' : 
                darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                'border-gray-300 focus:border-blue-500'
              }`}
              value={newEquipement.etat}
              onChange={(e) => {
                setNewEquipement({ ...newEquipement, etat: e.target.value });
                setFieldErrors({ ...fieldErrors, etat: false });
              }}
              style={fieldErrors.etat ? {} : { borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
            >
              <option value="">Sélectionner l'état</option>
              <option value="fonctionnel">Fonctionnel</option>
              <option value="en maintenance">En maintenance</option>
              <option value="défectueux">Défectueux</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Département {fieldErrors.departement && <span className="text-red-500 text-xs">(Ce champ est requis)</span>}
            </label>
            <select
              className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                fieldErrors.departement ? 'border-red-500' : 
                darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                'border-gray-300 focus:border-blue-500'
              }`}
              value={newEquipement.departement}
              onChange={(e) => {
                setNewEquipement({ ...newEquipement, departement: e.target.value });
                setFieldErrors({ ...fieldErrors, departement: false });
              }}
              style={fieldErrors.departement ? {} : { borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
            >
              <option value="">Sélectionner le département</option>
              {departements.map((departement) => (
                <option key={departement._id || departement.id || departement.nom} value={departement.nom}>
                  {departement.nom}
                </option>
              ))}
            </select>
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
              "Ajout..."
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
            onClick={() => {
              setIsModalOpen(false);
              setFieldErrors({
                nom: false,
                description: false,
                numSerie: false,
                dateAchat: false,
                etat: false,
                departement: false,
              });
            }}
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5" />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEquipementModal;