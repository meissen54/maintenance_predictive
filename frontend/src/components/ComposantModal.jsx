import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ComposantsModal = ({ isOpen, onClose, composantIds, selectedColor }) => {
  const [composants, setComposants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedComposant, setSelectedComposant] = useState(null);

  // Réinitialiser les états quand le modal est fermé
  useEffect(() => {
    if (!isOpen) {
      setComposants([]);
      setSelectedComposant(null);
      setError(null);
    }
  }, [isOpen]);

  // Charger les composants quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      if (composantIds && composantIds.length > 0) {
        fetchComposants();
      } else {
        setComposants([]); // Aucun composant pour cet équipement
      }
    }
  }, [isOpen, composantIds]);

  const fetchComposants = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non trouvé");
      }

      const composantPromises = composantIds.map(id => 
        fetch(`http://localhost:4000/apiComposant/getComposantByID/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => {
          if (!res.ok) throw new Error(`Erreur avec le composant ${id}`);
          return res.json();
        })
      );

      const composantsData = await Promise.all(composantPromises);
      setComposants(composantsData);
    } catch (err) {
      setError(err.message);
      setComposants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComposantDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non trouvé");
      }

      const response = await fetch(`http://localhost:4000/apiComposant/getComposantByID/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails du composant");
      }

      const data = await response.json();
      setSelectedComposant(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id) => {
    fetchComposantDetails(id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 font-sans">
      <div className="bg-white p-6 rounded-lg shadow-xl w-4/5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedComposant ? "Détails du Composant" : "Liste des Composants"}
          </h2>
          <button
            onClick={() => {
              setSelectedComposant(null);
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3" 
              onClick={() => setError(null)}
            >
              <XMarkIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        )}

        {selectedComposant ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">{selectedComposant.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">N° Série</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">{selectedComposant.numSerieComposant}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">{selectedComposant.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Installation</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">
                  {new Date(selectedComposant.dateInstallation).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">État</label>
                <span className={`mt-1 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedComposant.etat === 'fonctionnel' 
                    ? 'bg-green-100 text-green-800'
                    : selectedComposant.etat === 'en maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedComposant.etat}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">{selectedComposant.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fabricant</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">{selectedComposant.fabricant}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Délai Expiration</label>
                <p className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-900">
                  {new Date(selectedComposant.delaiExpi).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setSelectedComposant(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out"
              >
                Retour à la liste
              </button>
            </div>
          </div>
        ) : (
          <>
            {composants.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {composantIds && composantIds.length === 0
                    ? "Cet équipement ne contient aucun composant"
                    : "Aucun composant trouvé"}
                </p>
              </div>
            )}
            
            {composants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-green-500">Nom</th>
                    <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-green-500">Description</th>
                    <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-green-500">N° Série</th>
                    <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-green-500">Date Installation</th>
                    <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-green-500">État</th>
                    <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-green-500">Type</th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {composants.map((composant, index) => (
                      <tr 
                        key={composant._id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(composant._id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {composant.nom}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{composant.description}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{composant.numSerieComposant}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(composant.dateInstallation).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            composant.etat === 'fonctionnel' 
                              ? 'bg-green-100 text-green-800'
                              : composant.etat === 'en maintenance'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {composant.etat}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{composant.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="mt-8 flex justify-end border-t pt-4">
          <button
            className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
            style={{ backgroundColor: selectedColor }}
            onClick={() => {
              setSelectedComposant(null);
              onClose();
            }}
          >
            <XMarkIcon className="h-5 w-5 mr-2" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposantsModal;