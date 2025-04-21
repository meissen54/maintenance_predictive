import React, { useState, useEffect } from "react";
import { CalendarDaysIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UpdateCapteurModal = ({ 
  isModalOpen, 
  setIsModalOpen, 
  capteurToUpdate, 
  onCapteurUpdated, 
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

  const [updatedCapteur, setUpdatedCapteur] = useState({
    description: "",
    numSerie: "",
    dateInstallation: "",
    type: "",
    composant: "",
    equipement: ""
  });

  const [composants, setComposants] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [filteredComposants, setFilteredComposants] = useState([]);
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
        
        // Filtrer les composants en fonction de l'équipement sélectionné initialement
        if (capteurToUpdate?.composant?.equipement) {
          const filtered = composantResponse.data.filter(comp => 
            String(comp.equipement?._id || comp.equipement) === String(capteurToUpdate.composant.equipement._id || capteurToUpdate.composant.equipement)
          );
          setFilteredComposants(filtered);
        } else {
          setFilteredComposants(composantResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données");
      }
    };

    if (isModalOpen && capteurToUpdate) {
      fetchData();
      setUpdatedCapteur({
        description: capteurToUpdate.description || "",
        numSerie: capteurToUpdate.numSerie || "",
        dateInstallation: formatDateForInput(capteurToUpdate.dateInstallation),
        type: capteurToUpdate.type || "",
        composant: getId(capteurToUpdate.composant),
        equipement: getId(capteurToUpdate.composant?.equipement)
      });
      setError(null);
    }
  }, [isModalOpen, capteurToUpdate]);

  const handleComposantChange = (e) => {
    const selectedComposantId = e.target.value;
    const selectedComposant = composants.find(comp => comp._id === selectedComposantId);
    
    setUpdatedCapteur(prev => ({
      ...prev,
      composant: selectedComposantId,
      equipement: selectedComposant?.equipement?._id || selectedComposant?.equipement || ""
    }));
  };

  const handleEquipementChange = (e) => {
    const selectedEquipementId = e.target.value;
    
    // Filtrer les composants pour cet équipement
    const filtered = selectedEquipementId 
      ? composants.filter(comp => 
          String(comp.equipement?._id || comp.equipement) === String(selectedEquipementId)
        )
      : composants;
    
    setFilteredComposants(filtered);
    
    setUpdatedCapteur(prev => ({
      ...prev,
      equipement: selectedEquipementId,
      composant: "" // Réinitialiser le composant sélectionné quand on change d'équipement
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!updatedCapteur.numSerie || !updatedCapteur.type || 
          !updatedCapteur.composant || !updatedCapteur.dateInstallation) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      const capteurData = {
        description: updatedCapteur.description,
        numSerie: updatedCapteur.numSerie,
        dateInstallation: new Date(updatedCapteur.dateInstallation).toISOString(),
        type: updatedCapteur.type,
        composant: updatedCapteur.composant
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.put(
        `http://localhost:4000/apiCapteur/updateCapteur/${capteurToUpdate._id}`,
        capteurData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setIsModalOpen(false);
      onCapteurUpdated(response.data);
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

  if (!isModalOpen || !capteurToUpdate) return null;

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-gray-900 bg-opacity-75" : "bg-gray-600 bg-opacity-50"} flex justify-center items-center z-50`}>
      <div className={`rounded-lg shadow-xl w-4/5 flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Aperçu actuel</h3>
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} ml-16`}>Modifier le capteur</h3>
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
            {/* Type */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Type actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p className="capitalize">{capteurToUpdate.type}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau type *</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                  
                  onChange={(e) => setUpdatedCapteur({ ...updatedCapteur, type: e.target.value })}
                >
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="température">Température</option>
                  <option value="poids">Poids</option>
                  <option value="humidité">Humidité</option>
                  <option value="vibration">Vibration</option>
                  <option value="gaz">Gaz</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description actuelle</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{capteurToUpdate.description || "Non spécifiée"}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvelle description</label>
                <textarea
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                 
                  onChange={(e) => setUpdatedCapteur({ ...updatedCapteur, description: e.target.value })}
                  placeholder="Entrez la nouvelle description du capteur..."
                />
              </div>
            </div>

            {/* Numéro de série */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Numéro de série actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{capteurToUpdate.numSerie}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau numéro de série *</label>
                <input
                  type="text"
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                
                  onChange={(e) => setUpdatedCapteur({ ...updatedCapteur, numSerie: e.target.value })}
                  placeholder="Ex: CAP-12345678"
                />
              </div>
            </div>

            {/* Date installation */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date installation actuelle</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{capteurToUpdate.dateInstallation ? new Date(capteurToUpdate.dateInstallation).toLocaleDateString() : "Non spécifiée"}</p>
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
                
                    onChange={(e) => setUpdatedCapteur({ ...updatedCapteur, dateInstallation: e.target.value })}
                    placeholder="Sélectionnez une date"
                  />
                  <CalendarDaysIcon className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                </div>
              </div>
            </div>

            {/* Équipement */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Équipement actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{getName(capteurToUpdate.composant?.equipement)}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouvel équipement</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                
                  onChange={handleEquipementChange}
                >
                  <option value="">Sélectionnez équipement</option>
                  {equipements.map((equipement) => (
                    <option key={equipement._id} value={equipement._id}>
                      {equipement.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Composant */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Composant actuel</label>
                <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>{getName(capteurToUpdate.composant)}</p>
                </div>
              </div>
              <div className="w-1/2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Nouveau composant *</label>
                <select
                  className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                    darkMode ? "border-gray-600 focus:border-blue-500 bg-gray-700 text-white" : "border-gray-300 focus:border-green-500"
                  }`}
                 
                  onChange={handleComposantChange}
                >
                  <option value="">Sélectionnez composant</option>
                  {filteredComposants.map((composant) => (
                    <option key={composant._id} value={composant._id}>
                      {composant.nom}
                    </option>
                  ))}
                </select>
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

export default UpdateCapteurModal;