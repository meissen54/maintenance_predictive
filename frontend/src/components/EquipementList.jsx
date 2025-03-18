const equipements = [
    {
      nom: "Échographe",
      description: "Appareil d'imagerie médicale",
      numeroSerie: "SN-123456",
      dateAchat: "15/05/2022",
      etat: "Fonctionnel",
      departement: "Radiologie",
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
      composants: ["Valve de contrôle", "Filtre à air", "Capteur de pression"],
      dateAjout: "15/08/2021",
    },
    {
      nom: "Scanner CT",
      description: "Tomodensitométrie",
      numeroSerie: "SN-345678",
      dateAchat: "20/11/2020",
      etat: "Fonctionnel",
      departement: "Imagerie",
      composants: ["Tube à rayons X", "Détecteur", "Système de refroidissement"],
      dateAjout: "25/11/2020",
    },
  ];
  
  const EquipementList = () => {
    return (
      <div className="p-6 bg-gray-100 flex-1">
        <div className="mb-4 flex justify-between">
          <h2 className="text-xl font-bold">Liste des Équipements</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg">+ Ajouter un équipement</button>
        </div>
  
        <div className="bg-white shadow-lg rounded-lg p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">Nom de l'équipement</th>
                <th className="p-2">Description</th>
                <th className="p-2">Numéro de série</th>
                <th className="p-2">Date d'achat</th>
                <th className="p-2">État</th>
                <th className="p-2">Département</th>
                <th className="p-2">Composants</th>
                <th className="p-2">Date d'ajout</th>
              </tr>
            </thead>
            <tbody>
              {equipements.map((equipement, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{equipement.nom}</td>
                  <td className="p-2">{equipement.description}</td>
                  <td className="p-2">{equipement.numeroSerie}</td>
                  <td className="p-2">{equipement.dateAchat}</td>
                  <td className="p-2">{equipement.etat}</td>
                  <td className="p-2">{equipement.departement}</td>
                  <td className="p-2">
                    <ul className="list-disc pl-4">
                      {equipement.composants.map((composant, idx) => (
                        <li key={idx}>{composant}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2">{equipement.dateAjout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default EquipementList;