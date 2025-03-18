import React from "react";
import { Search, Plus, Trash, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Utilisation de useNavigate au lieu de useHistory

const equipements = [
  {
    nom: "Échographe",
    description: "Appareil d'imagerie médicale",
    numeroSerie: "SN-123456",
    dateAchat: "15/05/2022",
    etat: "Défectueux",
    departement: "Radiologie",
    quantite: 3,
    composants: ["Sonde ultrasonore", "Écran tactile", "Batterie rechargeable"],
    dateAjout: "20/05/2022",
  },
  {
    nom: "Respirateur artificiel",
    description: "Assistance respiratoire",
    numeroSerie: "SN-789012",
    dateAchat: "10/08/2021",
    etat: "En maintenance",
    departement: "Réanimation",
    quantite: 2,
    composants: ["Valve de contrôle", "Filtre à air", "Capteur de pression"],
    dateAjout: "15/08/2021",
  },
  {
    nom: "IRM",
    description: "Appareil d'imagerie par résonance magnétique",
    numeroSerie: "SN-654321",
    dateAchat: "12/02/2020",
    etat: "Fonctionnel",
    departement: "Imagerie",
    quantite: 1,
    composants: ["Bobines de gradient", "Aimant supraconducteur", "Console de commande"],
    dateAjout: "15/02/2020",
  },
  {
    nom: "Scanner CT",
    description: "Tomodensitomètre pour imagerie en coupe",
    numeroSerie: "SN-987654",
    dateAchat: "05/11/2019",
    etat: "En maintenance",
    departement: "Imagerie",
    quantite: 2,
    composants: ["Tube à rayons X", "Détecteur de rayons X", "Console de traitement"],
    dateAjout: "10/11/2019",
  }
];

const equipementsParDepartement = equipements.reduce((acc, equipement) => {
  acc[equipement.departement] = acc[equipement.departement] || [];
  acc[equipement.departement].push(equipement);
  return acc;
}, {});

const getEtatClass = (etat) => {
  switch (etat) {
    case "Fonctionnel":
      return "text-green-600"; // Vert foncé
    case "En maintenance":
      return "text-orange-600"; // Orange foncé
    case "Défectueux":
      return "text-red-600"; // Rouge foncé
    default:
      return "text-gray-600"; // Gris foncé
  }
};

const EquipementList = () => {
  const navigate = useNavigate(); // Remplacer useHistory par useNavigate

  // Fonction pour rediriger vers la page de consultation d'un équipement
  const handleConsultation = (numeroSerie) => {
    // Remplacez "/consulter-equipement" par la route que vous avez définie pour consulter l'équipement
    navigate(`/consulter-equipement/${numeroSerie}`); // Utilisation de navigate pour la redirection
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <button className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-green-600 hover:shadow-xl transition duration-300">
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
                    <th className="p-4 font-semibold text-sm w-1/12">Quantité</th>
                    <th className="p-4 font-semibold text-sm w-1/4">Composants</th>
                    <th className="p-4 font-semibold text-sm w-1/6">Date Ajout</th>
                    <th className="p-4 font-semibold text-sm w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipements.map((equipement, index) => (
                    <tr
                      key={index}
                      className={`border-t ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                    >
                      <td className="p-4 border-b text-gray-700">{equipement.nom}</td>
                      <td className="p-4 border-b text-gray-600">{equipement.description}</td>
                      <td className="p-4 border-b text-gray-700">{equipement.numeroSerie}</td>
                      <td className="p-4 border-b text-gray-700">{equipement.dateAchat}</td>
                      <td className="p-4 border-b">
                        <span className={`flex items-center gap-2 ${getEtatClass(equipement.etat)} whitespace-nowrap`}>
                          <span className="text-lg">•</span> {equipement.etat}
                        </span>
                      </td>
                      <td className="p-4 border-b text-center text-gray-700">{equipement.quantite}</td>
                      <td className="p-4 border-b">
                        <ul className="list-disc pl-5">
                          {equipement.composants.map((composant, idx) => (
                            <li key={idx} className="text-gray-600">{composant}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4 border-b text-gray-700">{equipement.dateAjout}</td>
                      <td className="p-4 border-b text-center">
                        <div className="flex justify-center items-center gap-4">
                        <button 
                          className="text-green-500 hover:text-green-600 transition duration-200" 
                          onClick={() => handleConsultation(equipement.numeroSerie)}
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
