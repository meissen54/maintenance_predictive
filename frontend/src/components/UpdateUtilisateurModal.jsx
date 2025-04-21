import React, { useState, useEffect } from "react";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UpdateUtilisateurModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  utilisateurToUpdate, 
  onUtilisateurUpdated, 
  selectedColor,
  darkMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departements, setDepartements] = useState([]);
  const [updatedUtilisateur, setUpdatedUtilisateur] = useState({
    nom: "",
    prenom: "",
    tel: "",
    DateNaissance: "",
    type_utilisateur: "Technicien",
    email: "",
    motDePasse: "",
    departement: ""
  });

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

    const fetchDepartements = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/apiUtilisateur/departements-non-utilises",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDepartements(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des départements:", error);
        setError("Erreur lors du chargement des départements disponibles");
      }
    };

    if (isModalOpen) {
      fetchDepartements();
    }
  }, [isModalOpen]);

  const validatePassword = (password) => {
    if (!password) return { valid: true, message: "" };
    
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const passwordValidation = validatePassword(updatedUtilisateur.motDePasse);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      const utilisateurData = {
        nom: updatedUtilisateur.nom || utilisateurToUpdate.nom,
        prenom: updatedUtilisateur.prenom || utilisateurToUpdate.prenom,
        tel: updatedUtilisateur.tel || utilisateurToUpdate.tel,
        DateNaissance: updatedUtilisateur.DateNaissance || utilisateurToUpdate.DateNaissance,
        type_utilisateur: "Technicien",
        email: updatedUtilisateur.email || utilisateurToUpdate.email,
        departement: updatedUtilisateur.departement || utilisateurToUpdate.departement?._id
      };

      if (updatedUtilisateur.motDePasse) {
        utilisateurData.motDePasse = updatedUtilisateur.motDePasse;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.put(
        `http://localhost:4000/apiUtilisateur/updateUtilisateur/${utilisateurToUpdate._id}`,
        utilisateurData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setIsModalOpen(false);
      onUtilisateurUpdated(response.data);
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

  if (!isModalOpen) return null;

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
      <div className={`rounded-lg shadow-xl w-4/5 flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Aperçu actuel</h3>
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} ml-16`}>Modifier l'utilisateur</h3>
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
                  <p>{utilisateurToUpdate.nom}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau nom</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  placeholder="Entrez le nouveau nom"
                  value={updatedUtilisateur.nom}
                  onChange={(e) => setUpdatedUtilisateur({ ...updatedUtilisateur, nom: e.target.value })}
                />
              </div>
            </div>

            {/* Ligne Prénom */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Prénom actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{utilisateurToUpdate.prenom}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau prénom</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  placeholder="Entrez le nouveau prénom"
                  value={updatedUtilisateur.prenom}
                  onChange={(e) => setUpdatedUtilisateur({ ...updatedUtilisateur, prenom: e.target.value })}
                />
              </div>
            </div>

            {/* Ligne Email */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{utilisateurToUpdate.email}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvel email</label>
                <input
                  type="email"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  placeholder="Entrez le nouvel email"
                  value={updatedUtilisateur.email}
                  onChange={(e) => setUpdatedUtilisateur({ ...updatedUtilisateur, email: e.target.value })}
                />
              </div>
            </div>

            {/* Ligne Téléphone */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Téléphone actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{utilisateurToUpdate.tel || "N/A"}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau téléphone</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  placeholder="Entrez le nouveau téléphone"
                  value={updatedUtilisateur.tel}
                  onChange={(e) => setUpdatedUtilisateur({ ...updatedUtilisateur, tel: e.target.value })}
                />
              </div>
            </div>

            {/* Ligne Date de naissance */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date de naissance actuelle</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{utilisateurToUpdate.DateNaissance ? new Date(utilisateurToUpdate.DateNaissance).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvelle date de naissance</label>
                <input
                  type="date"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  placeholder="Sélectionnez une date"
                  value={updatedUtilisateur.DateNaissance}
                  onChange={(e) => setUpdatedUtilisateur({ ...updatedUtilisateur, DateNaissance: e.target.value })}
                />
              </div>
            </div>

            {/* Ligne Type utilisateur */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Type actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{utilisateurToUpdate.type_utilisateur}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau type</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 bg-gray-700 text-gray-300" : "border-gray-300 bg-gray-100 text-gray-600"
                  }`}
                  value="Technicien"
                  readOnly
                />
              </div>
            </div>

            {/* Ligne Département */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Département actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{utilisateurToUpdate.departement?.nom || "Non affecté"}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau département</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  value={updatedUtilisateur.departement}
                  onChange={(e) => setUpdatedUtilisateur({ ...updatedUtilisateur, departement: e.target.value })}
                >
                  <option value="">Sélectionnez un département</option>
                  {departements.map((departement) => (
                    <option key={departement._id} value={departement._id}>
                      {departement.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ligne Mot de passe */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Mot de passe</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>********</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau mot de passe</label>
                <input
                  type="password"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  placeholder="Laissez vide pour ne pas modifier"
                  value={updatedUtilisateur.motDePasse}
                  onChange={(e) => setUpdatedUtilisateur({ ...updatedUtilisateur, motDePasse: e.target.value })}
                />
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

export default UpdateUtilisateurModal;