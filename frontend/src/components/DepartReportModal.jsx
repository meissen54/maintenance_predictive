import React from 'react';
import { X, Download, Users, HardDrive, Cpu, MemoryStick, Server } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const DepartReportModal = ({ 
  isOpen, 
  onClose, 
  departement,
  selectedColor,
  darkMode 
}) => {
  const reportRef = React.useRef();

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getComposantIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'processeur': return <Cpu size={16} />;
      case 'disque dur': return <HardDrive size={16} />;
      case 'mémoire': return <MemoryStick size={16} />;
      case 'serveur': return <Server size={16} />;
      default: return <HardDrive size={16} />;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!reportRef.current) return;
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        windowHeight: reportRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport_departement_${departement.nom || departement._id}.pdf`);
      
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  // Récupérer tous les composants de tous les équipements
  const getAllComposants = () => {
    if (!departement.equipements) return [];
    
    return departement.equipements.reduce((acc, equipement) => {
      if (equipement.composants && equipement.composants.length > 0) {
        return [...acc, ...equipement.composants.map(comp => ({
          ...comp,
          equipementParent: equipement.nom
        }))];
      }
      return acc;
    }, []);
  };

  const allComposants = getAllComposants();

  if (!isOpen || !departement) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col ${
        darkMode ? "dark:bg-gray-800" : "bg-white"
      }`}>
        {/* Header */}
        <div className={`p-4 border-b rounded-t-lg sticky top-0 z-10 flex justify-between items-center shadow-sm ${
          darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}>
              Rapport Département
            </h2>
            <p className={`text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}>
              {departement.nom || 'Département'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300"
              style={{ backgroundColor: selectedColor }}
            >
              <Download size={16} />
              Exporter en PDF
            </button>
            <button
              onClick={onClose}
              className={`p-1 rounded-full transition-colors ${
                darkMode ? "text-gray-300 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={reportRef}
          className={`overflow-y-auto flex-grow p-6 ${
            darkMode ? "dark:bg-gray-800" : "bg-white"
          }`}
        >
          {/* Section Utilisateurs */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              <Users size={18} className="text-blue-500" />
              Utilisateurs associés ({departement.utilisateurs?.length || 0})
            </h3>
            {departement.utilisateurs?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={darkMode ? "dark:bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>Nom</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>Email</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    darkMode ? "divide-gray-600" : "divide-gray-200"
                  }`}>
                    {departement.utilisateurs.map((utilisateur, index) => (
                      <tr key={index} className={darkMode ? "dark:bg-gray-800" : "bg-white"}>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>{utilisateur.nom} {utilisateur.prenom}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}>{utilisateur.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`text-center py-8 rounded-md ${
                darkMode ? "dark:bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-500"
              }`}>
                Aucun utilisateur associé à ce département
              </div>
            )}
          </div>

          {/* Section Composants */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              <HardDrive size={18} className="text-blue-500" />
              Composants des équipements ({allComposants.length})
            </h3>
            {allComposants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={darkMode ? "dark:bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>Équipement</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>Composant</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>Type</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>État</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    darkMode ? "divide-gray-600" : "divide-gray-200"
                  }`}>
                    {allComposants.map((composant, index) => (
                      <tr key={index} className={darkMode ? "dark:bg-gray-800" : "bg-white"}>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>{composant.equipementParent}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>
                          <div className="flex items-center gap-2">
                            {getComposantIcon(composant.type)}
                            {composant.nom || "N/A"}
                          </div>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}>{composant.type || "N/A"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            composant.etat === 'fonctionnel' 
                              ? darkMode 
                                ? 'bg-green-900 text-green-100' 
                                : 'bg-green-100 text-green-800'
                              : composant.etat === 'en maintenance'
                              ? darkMode
                                ? 'bg-yellow-900 text-yellow-100'
                                : 'bg-yellow-100 text-yellow-800'
                              : darkMode
                              ? 'bg-red-900 text-red-100'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {composant.etat || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`text-center py-8 rounded-md ${
                darkMode ? "dark:bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-500"
              }`}>
                Aucun composant trouvé dans les équipements de ce département
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartReportModal;