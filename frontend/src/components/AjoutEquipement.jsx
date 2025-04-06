import React, { useState } from "react";
import axios from "axios";

const AddEquipementModal = ({ isOpen, closeModal, refreshEquipements }) => {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [numSerie, setNumSerie] = useState("");
  const [dateAchat, setDateAchat] = useState("");
  const [etat, setEtat] = useState("fonctionnel");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:4000/apiEquipement/addEquipement",
        {
          nom,
          description,
          numSerie,
          dateAchat,
          etat,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Équipement ajouté avec succès");
      refreshEquipements(); // Actualiser la liste des équipements après l'ajout
      closeModal(); // Fermer le modal après l'ajout
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'équipement:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h3 className="text-xl font-semibold mb-4">Ajouter un équipement</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-2 mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Numéro de série</label>
            <input
              type="text"
              value={numSerie}
              onChange={(e) => setNumSerie(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-2 mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Date d'achat</label>
            <input
              type="date"
              value={dateAchat}
              onChange={(e) => setDateAchat(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-2 mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">État</label>
            <select
              value={etat}
              onChange={(e) => setEtat(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-2 mt-1"
            >
              <option value="fonctionnel">Fonctionnel</option>
              <option value="en maintenance">En maintenance</option>
              <option value="défectueux">Défectueux</option>
            </select>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-color text-white rounded-lg"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipementModal;
