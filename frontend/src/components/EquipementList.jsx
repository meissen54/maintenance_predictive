import React, { useState, useEffect } from "react";
import { Search, Plus, Trash, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Utilisation de useNavigate au lieu de useHistory
import axios from "axios"; // Vous pouvez utiliser axios pour effectuer des requêtes HTTP

const EquipementList = () => {
  const [equipements, setEquipements] = useState([]); // État pour stocker les données des équipements
  const navigate = useNavigate(); // Remplacer useHistory par useNavigate

  // Récupérer les données de l'API lors du montage du composant
  useEffect(() => {
    const fetchEquipements = async () => {
      try {
        const response = await axios.get("http://localhost:4000/apiEquipement/getEquipement"); // URL de votre API
        setEquipements(response.data); // Stocker les données récupérées dans l'état
      } catch (error) {
        console.error("Erreur lors de la récupération des équipements:", error);
      }
    };

    fetchEquipements(); // Appeler la fonction pour récupérer les données
  }, []); // Tableau de dépendances vide pour n'exécuter cet effet qu'une seule fois

  // Réorganiser les équipements par département
  const equipementsParDepartement = equipements.reduce((acc, equipement) => {
    acc[equipement.departement.nom] = acc[equipement.departement.nom] || [];
    acc[equipement.departement.nom].push(equipement);
    return acc;
  }, {});

  // Fonction pour obtenir la classe CSS en fonction de l'état de l'équipement
  const getEtatClass = (etat) => {
    switch (etat) {
      case "fonctionnel":
        return "text-green-600"; // Vert foncé
      case "en maintenance":
        return "text-orange-400"; // Orange foncé
      case "défectueux":
        return "text-red-600"; // Rouge foncé
      default:
        return "text-gray-600"; // Gris foncé
    }
  };

  // Fonction pour formater la date (sans l'heure)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR"); // Format de la date en français (ex: 01/03/2025)
  };

  // Fonction pour rediriger vers la page de consultation d'un équipement
  const handleConsultation = (numSerie) => {
    navigate(`/consulter-equipement/${numSerie}`); // Utilisation de navigate pour la redirection
  };

  return (
    <div className="w-full h-screen p-8 bg-[#f3f8f5]">
      <div className="mb-6 flex justify-between items-center">
        <button className="bg-green-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-green-600 hover:shadow-xl transition duration-300">
          <Plus size={20} />
          Ajouter
        </button>

        {/* Barre de recherche améliorée */}
        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un équipement"
            className="w-full border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-3 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 placeholder-gray-500 transition duration-300 ease-in-out"
          />
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(equipementsParDepartement).map(([departement, equipements]) => (
          <div key={departement} className="bg-white shadow-xl rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">{departement}</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-left">
                  <tr className="text-gray-600">
                    <th className="p-4 font-semibold text-sm w-1/6">Nom</th>
                    <th className="p-4 font-semibold text-sm w-1/4">Description</th>
                    <th className="p-4 font-semibold text-sm w-1/6">N° Série</th>
                    <th className="p-4 font-semibold text-sm w-1/6">Date Achat</th>
                    <th className="p-4 font-semibold text-sm w-1/6">État</th>
                    <th className="p-4 font-semibold text-sm w-1/4">Composants</th>
                    <th className="p-4 font-semibold text-sm w-1/6">Date Ajout</th>
                    <th className="p-4 font-semibold text-sm w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipements.map((equipement, index) => (
                    <tr
                      key={equipement._id} // Utilisez un identifiant unique si disponible
                      className={`border-t ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                    >
                      <td className="p-4 border-b text-gray-700">{equipement.nom}</td>
                      <td className="p-4 border-b text-gray-600">{equipement.description}</td>
                      <td className="p-4 border-b text-gray-700">{equipement.numSerie}</td>
                      <td className="p-4 border-b text-gray-700">{formatDate(equipement.dateAchat)}</td>
                      <td className="p-4 border-b">
                        <span className={`flex items-center gap-2 ${getEtatClass(equipement.etat)} whitespace-nowrap`}>
                          <span className="text-lg">•</span> {equipement.etat}
                        </span>
                      </td>
                      <td className="p-4 border-b">
                        {/* Affichage du nom du composant */}
                        {equipement.composants && equipement.composants.nom ? (
                          <span className="text-gray-600">{equipement.composants.nom}</span>
                        ) : (
                          <span>Aucun composant</span>
                        )}
                      </td>
                      <td className="p-4 border-b text-gray-700">
                        {formatDate(equipement.dateAjout)}
                      </td>
                      <td className="p-4 border-b text-center">
                        <div className="flex justify-center items-center gap-4">
                          <button 
                            className="text-green-500 hover:text-green-600 transition duration-200" 
                            onClick={() => handleConsultation(equipement.numSerie)}
                          >
                            <Eye size={20} />
                          </button>

                          <button className="text-blue-500 hover:text-blue-700 transition duration-200">
                            <Edit size={20} />
                          </button>
                          <button className="text-red-500 hover:text-red-700 transition duration-200">
                            <Trash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipementList;
