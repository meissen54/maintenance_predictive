import React, { useState, useEffect } from "react";
import { Search, Plus, Trash, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Importer jwt-decode

const EquipementList = () => {
  const [equipements, setEquipements] = useState([]);
  const [filteredEquipements, setFilteredEquipements] = useState([]); // Liste filtrée pour la recherche
  const [query, setQuery] = useState(""); // Variable pour stocker le terme de recherche
  const [role, setRole] = useState(""); // Variable pour stocker le rôle
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipements = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token non trouvé");
          return;
        }

        const decodedToken = jwtDecode(token); // Décoder le token
        const role = decodedToken.role; // Extraire le rôle
        setRole(role); // Mettre à jour le rôle

        const apiURL =
          role === "Administrateur"
            ? "http://localhost:4000/apiEquipement/getEquipement"
            : "http://localhost:4000/apiEquipement/getEquipementBydepart";

        const response = await axios.get(apiURL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEquipements(response.data);
        setFilteredEquipements(response.data); // Mettre à jour les équipements filtrés par défaut
      } catch (error) {
        console.error("Erreur lors de la récupération des équipements:", error);
      }
    };

    fetchEquipements();
  }, []);

  useEffect(() => {
    // Filtrer les équipements en fonction de la recherche
    const filtered = equipements.filter(equipement =>
      equipement.nom.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEquipements(filtered);
  }, [query, equipements]); // Refiltrer à chaque fois que 'query' ou 'equipements' changent

  const equipementsParDepartement = filteredEquipements.reduce((acc, equipement) => {
    acc[equipement.departement.nom] = acc[equipement.departement.nom] || [];
    acc[equipement.departement.nom].push(equipement);
    return acc;
  }, {});

  const getEtatClass = (etat) => {
    switch (etat) {
      case "fonctionnel":
        return "text-green-600";
      case "en maintenance":
        return "text-orange-400";
      case "défectueux":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const handleConsultation = (numSerie) => {
    navigate(`/consulter-equipement/${numSerie}`);
  };

  return (
    <div className="w-full h-screen p-8 bg-[#f3f8f5]">
      <div className="mb-6 flex justify-between items-center">
        {/* Afficher le bouton "Ajouter" uniquement si le rôle est "Administrateur" */}
        {role === "Administrateur" && (
          <button className="bg-green-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-green-600 hover:shadow-xl transition duration-300">
            <Plus size={20} />
            Ajouter
          </button>
        )}

        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un équipement"
            className="w-full border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-3 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 placeholder-gray-500 transition duration-300 ease-in-out"
            value={query} // Lier la valeur de l'input à la variable query
            onChange={(e) => setQuery(e.target.value)} // Mettre à jour la query à chaque modification
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
                    <th className="p-4 font-semibold text-sm w-1/4">Capteurs</th>
                    <th className="p-4 font-semibold text-sm w-1/6">Date Ajout</th>
                    <th className="p-4 font-semibold text-sm w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipements.map((equipement, index) => (
                    <tr key={equipement._id} className={`border-t ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
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
                        {equipement.composants?.length > 0 ? (
                          equipement.composants.map((composant, idx) => (
                            <span key={idx} className="text-gray-600">
                              •{composant.nom}<br />
                            </span>
                          ))
                        ) : (
                          <span>Aucun composant</span>
                        )}
                      </td>
                      <td className="p-4 border-b">
                        {equipement.composants
                          .flatMap(composant => composant.capteurs)
                          .map((capteur, idx) => (
                            <span key={idx} className="text-gray-600">
                              •{capteur.type}<br />
                            </span>
                          ))
                        }
                        {equipement.composants.every(composant => composant.capteurs.length === 0) && (
                          <span>Aucun capteur</span>
                        )}
                      </td>
                      <td className="p-4 border-b text-gray-700">{formatDate(equipement.dateAjout)}</td>
                      <td className="p-4 border-b text-center">
                        <div className="flex justify-center items-center gap-4">
                          <button
                            className="text-green-500 hover:text-green-600 transition duration-200"
                            onClick={() => handleConsultation(equipement.numSerie)}
                          >
                            <Eye size={20} />
                          </button>

                          {/* Afficher les icônes de modification et suppression uniquement si le rôle est "Administrateur" */}
                          {role === "Administrateur" && (
                            <>
                              <button className="text-blue-500 hover:text-blue-700 transition duration-200">
                                <Edit size={20} />
                              </button>
                              <button className="text-red-500 hover:text-red-700 transition duration-200">
                                <Trash size={20} />
                              </button>
                            </>
                          )}
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
