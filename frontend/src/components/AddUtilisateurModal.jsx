import React, { useState, useEffect } from "react";
import { PlusIcon, XMarkIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AddUtilisateurModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  onUtilisateurAdded, 
  selectedColor,
  darkMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newUtilisateur, setNewUtilisateur] = useState({
    nom: "",
    prenom: "",
    tel: "",
    DateNaissance: "",
    type_utilisateur: "Technicien",
    email: "",
    motDePasse: "",
    departements: []
  });

  const [fieldErrors, setFieldErrors] = useState({
    nom: "",
    prenom: "",
    tel: "",
    DateNaissance: "",
    email: "",
    motDePasse: "",
    departements: ""
  });

  const [availableDepartements, setAvailableDepartements] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchAvailableDepartements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:4000/apiUtilisateur/departements-non-utilises", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableDepartements(response.data);
      } catch (err) {
        console.error("Error fetching available departments:", err);
        setError("Erreur lors du chargement des départements disponibles");
      }
    };

    if (isModalOpen) {
      fetchAvailableDepartements();
      setNewUtilisateur({
        nom: "",
        prenom: "",
        tel: "",
        DateNaissance: "",
        type_utilisateur: "Technicien",
        email: "",
        motDePasse: "",
        departements: []
      });
      setFieldErrors({
        nom: "",
        prenom: "",
        tel: "",
        DateNaissance: "",
        email: "",
        motDePasse: "",
        departements: ""
      });
      setError(null);
      setShowPassword(false);
      setIsDeptDropdownOpen(false);
    }
  }, [isModalOpen]);

  const validateFields = () => {
    let isValid = true;
    const newErrors = {
      nom: "",
      prenom: "",
      tel: "",
      DateNaissance: "",
      email: "",
      motDePasse: "",
      departements: ""
    };

    // Validation pour chaque champ
    if (!newUtilisateur.nom.trim()) {
      newErrors.nom = "Ce champ est obligatoire";
      isValid = false;
    }

    if (!newUtilisateur.prenom.trim()) {
      newErrors.prenom = "Ce champ est obligatoire";
      isValid = false;
    }

    if (!newUtilisateur.tel.trim()) {
      newErrors.tel = "Ce champ est obligatoire";
      isValid = false;
    }

    if (!newUtilisateur.DateNaissance) {
      newErrors.DateNaissance = "Ce champ est obligatoire";
      isValid = false;
    }

    if (!newUtilisateur.email.trim()) {
      newErrors.email = "Ce champ est obligatoire";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(newUtilisateur.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }

    if (!newUtilisateur.motDePasse.trim()) {
      newErrors.motDePasse = "Ce champ est obligatoire";
      isValid = false;
    }

    if (newUtilisateur.departements.length === 0) {
      newErrors.departements = "Au moins un département doit être sélectionné";
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { valid: false, message: "Le mot de passe doit contenir au moins 8 caractères" };
    }
    if (!hasUpperCase) {
      return { valid: false, message: "Le mot de passe doit contenir au moins une majuscule" };
    }
    if (!hasLowerCase) {
      return { valid: false, message: "Le mot de passe doit contenir au moins une minuscule" };
    }
    if (!hasNumber) {
      return { valid: false, message: "Le mot de passe doit contenir au moins un chiffre" };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: "Le mot de passe doit contenir au moins un caractère spécial" };
    }
    return { valid: true, message: "" };
  };

  const handleInputChange = (field, value) => {
    setNewUtilisateur(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleDepartementChange = (deptId) => {
    setNewUtilisateur(prev => {
      const isSelected = prev.departements.includes(deptId);
      return {
        ...prev,
        departements: isSelected 
          ? prev.departements.filter(id => id !== deptId) 
          : [...prev.departements, deptId]
      };
    });

    if (fieldErrors.departements) {
      setFieldErrors(prev => ({ ...prev, departements: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const passwordValidation = validatePassword(newUtilisateur.motDePasse);
    if (!passwordValidation.valid) {
      setFieldErrors(prev => ({ ...prev, motDePasse: passwordValidation.message }));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:4000/apiUtilisateur/register", 
        {
          ...newUtilisateur,
          departement: newUtilisateur.departements
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      
      setIsModalOpen(false);
      onUtilisateurAdded(response.data);
    } catch (err) {
      console.error("Error adding utilisateur:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Erreur lors de l'ajout de l'utilisateur"
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
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Ajouter un utilisateur</h3>
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
            {/* Ligne 1: Nom et Prénom */}
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
                placeholder="Ex: Dupont"
                value={newUtilisateur.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
              />
              {fieldErrors.nom && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.nom}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Prénom *
              </label>
              <input
                type="text"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.prenom ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: Jean"
                value={newUtilisateur.prenom}
                onChange={(e) => handleInputChange('prenom', e.target.value)}
              />
              {fieldErrors.prenom && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.prenom}</p>
              )}
            </div>

            {/* Ligne 2: Email */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Email *
              </label>
              <input
                type="email"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.email ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: jean.dupont@example.com"
                value={newUtilisateur.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Ligne 3: Mot de passe */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                    fieldErrors.motDePasse ? 'border-red-500' : 
                    darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                    'border-gray-300 focus:border-green-500'
                  }`}
                  placeholder="Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial"
                  value={newUtilisateur.motDePasse}
                  onChange={(e) => handleInputChange('motDePasse', e.target.value)}
                />
                <button
                  type="button"
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldErrors.motDePasse && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.motDePasse}</p>
              )}
            </div>

            {/* Ligne 4: Téléphone et Date de naissance */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Téléphone *
              </label>
              <input
                type="text"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.tel ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                placeholder="Ex: 0612345678"
                value={newUtilisateur.tel}
                onChange={(e) => handleInputChange('tel', e.target.value)}
              />
              {fieldErrors.tel && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.tel}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Date de naissance *
              </label>
              <input
                type="date"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                  fieldErrors.DateNaissance ? 'border-red-500' : 
                  darkMode ? 'border-gray-600 focus:border-blue-500 bg-gray-700 text-white' : 
                  'border-gray-300 focus:border-green-500'
                }`}
                value={newUtilisateur.DateNaissance}
                onChange={(e) => handleInputChange('DateNaissance', e.target.value)}
              />
              {fieldErrors.DateNaissance && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.DateNaissance}</p>
              )}
            </div>

            
                {/* Ligne 5: Type d'utilisateur (Technicien) */}
            <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Type d'utilisateur
            </label>
            <input
                type="text"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none ${
                darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 
                'border-gray-300 bg-gray-100 text-gray-600'
                }`}
                value="Technicien"
                readOnly
            />
            </div>

            {/* Ligne 6: Départements */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Départements *
              </label>
              <div className="relative">
                <button
                  type="button"
                  className={`w-full p-2 border-2 rounded-lg text-left flex justify-between items-center ${
                    fieldErrors.departements ? 'border-red-500' : 
                    darkMode ? 'border-gray-600 bg-gray-700' : 
                    'border-gray-300'
                  }`}
                  onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                >
                  <span>
                    {newUtilisateur.departements.length > 0 
                      ? `${newUtilisateur.departements.length} département(s) sélectionné(s)`
                      : "Sélectionner des départements"}
                  </span>
                  <ChevronDownIcon className={`h-5 w-5 transition-transform ${isDeptDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {isDeptDropdownOpen && (
                  <div className={`absolute z-10 mt-1 w-full max-h-60 overflow-auto border rounded-lg shadow-lg ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}>
                    {availableDepartements.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {availableDepartements.map((departement) => (
                          <div key={departement._id} className="flex items-center p-2 hover:bg-opacity-10 hover:bg-white rounded">
                            <input
                              type="checkbox"
                              id={`dept-${departement._id}`}
                              checked={newUtilisateur.departements.includes(departement._id)}
                              onChange={() => handleDepartementChange(departement._id)}
                              className={`mr-2 ${
                                darkMode ? 'accent-blue-500' : 'accent-green-500'
                              }`}
                            />
                            <label htmlFor={`dept-${departement._id}`} className="text-sm flex-1">
                              {departement.nom}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`p-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Aucun département disponible
                      </p>
                    )}
                  </div>
                )}
              </div>
              {fieldErrors.departements && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.departements}</p>
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

export default AddUtilisateurModal;