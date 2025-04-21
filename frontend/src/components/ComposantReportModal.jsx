import React from 'react';
import { X, Download, HardDrive, Hash, Type, Factory, CircleDot, CalendarCheck, CalendarX } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const ComposantReportModal = ({ 
  isOpen, 
  onClose, 
  composant,
  selectedColor,
  darkMode 
}) => {
  const reportRef = React.useRef();

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const handleDownloadPDF = async () => {
    try {
      if (!reportRef.current) return;
      
      // Capture the modal content as an image
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        windowHeight: reportRef.current.scrollHeight,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport_composant_${composant.nom || composant._id}.pdf`);
      
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  if (!isOpen || !composant) return null;

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
              Rapport Technique
            </h2>
            <p className={`text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}>{composant.nom || 'Composant'}</p>
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
          {/* Section Identification */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              <HardDrive size={18} className="text-green-500" />
              Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  <Hash size={16} />
                </div>
                <div>
                  <p className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>Numéro de série</p>
                  <p className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>{composant.numSerieComposant || "Non spécifié"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  <Type size={16} />
                </div>
                <div>
                  <p className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>Type</p>
                  <p className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>{composant.type || "Non spécifié"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  <Factory size={16} />
                </div>
                <div>
                  <p className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>Fabricant</p>
                  <p className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>{composant.fabricant || "Non spécifié"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  <CircleDot size={16} />
                </div>
                <div>
                  <p className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>État</p>
                  <p className="font-medium" style={{ 
                    color: composant.etat === "fonctionnel" ? "#10B981" : 
                          composant.etat === "en maintenance" ? "#F59E0B" : 
                          composant.etat === "défectueux" ? "#EF4444" : 
                          darkMode ? "#9CA3AF" : "#6B7280"
                  }}>
                    {composant.etat || "Non spécifié"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Dates */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              <CalendarCheck size={18} className="text-green-500" />
              Dates importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  <CalendarCheck size={16} />
                </div>
                <div>
                  <p className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>Date installation</p>
                  <p className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>{formatDate(composant.dateInstallation)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  <CalendarX size={16} />
                </div>
                <div>
                  <p className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>Date expiration</p>
                  <p className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>{formatDate(composant.delaiExpi)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Description */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              Description
            </h3>
            <div className={`p-4 rounded-md ${
              darkMode ? "dark:bg-gray-700" : "bg-gray-50"
            }`}>
              <p className={`whitespace-pre-line ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {composant.description || "Aucune description disponible"}
              </p>
            </div>
          </div>

          {/* Section Localisation */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
              </svg>
              Localisation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-md ${
                darkMode ? "dark:bg-gray-700" : "bg-gray-50"
              }`}>
                <p className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>Équipement</p>
                <p className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}>
                  {composant.equipement?.nom || "Non affecté"}
                </p>
              </div>
              <div className={`p-4 rounded-md ${
                darkMode ? "dark:bg-gray-700" : "bg-gray-50"
              }`}>
                <p className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>Département</p>
                <p className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}>
                  {composant.departement?.nom || composant.equipement?.departement?.nom || "Non affecté"}
                </p>
              </div>
            </div>
          </div>

          {/* Section Capteurs */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              Capteurs ({composant.capteurs?.length || 0})
            </h3>
            {composant.capteurs?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={darkMode ? "dark:bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>Type</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>N° Série</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>Date installation</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    darkMode ? "divide-gray-600" : "divide-gray-200"
                  }`}>
                    {composant.capteurs.map((capteur, index) => (
                      <tr key={index} className={darkMode ? "dark:bg-gray-800" : "bg-white"}>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>{capteur.type || "N/A"}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}>{capteur.numSerie || "N/A"}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}>{formatDate(capteur.dateInstallation)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`text-center py-8 rounded-md ${
                darkMode ? "dark:bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-500"
              }`}>
                Aucun capteur associé à ce composant
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposantReportModal;