import React from 'react';
import { X, Download, User, Mail, Phone, Key, Calendar, Briefcase } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const UtilisateurReportModal = ({ 
  isOpen, 
  onClose, 
  utilisateur,
  selectedColor,
  darkMode 
}) => {
  const reportRef = React.useRef();

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = async () => {
    try {
      if (!reportRef.current) return;
      
      // Hide elements not needed in print
      const printElements = document.querySelectorAll('.no-print');
      printElements.forEach(el => el.style.display = 'none');
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
        windowHeight: reportRef.current.scrollHeight,
        backgroundColor: '#ffffff' // Force white background for print
      });

      // Restore elements
      printElements.forEach(el => el.style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`profil_${utilisateur.nom}_${utilisateur.prenom}.pdf`);
      
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  if (!isOpen || !utilisateur) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
      <div className={`rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border ${
        darkMode ? "dark:bg-gray-800 print:bg-white" : "bg-white"
      }`}>
        {/* Header */}
        <div className={`p-4 border-b rounded-t-lg sticky top-0 z-10 flex justify-between items-center shadow-sm no-print ${
          darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}>
              Rapport Utilisateur
            </h2>
            <p className={`text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}>{utilisateur.nom} {utilisateur.prenom}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition duration-300 no-print"
              style={{ backgroundColor: selectedColor }}
            >
              <Download size={16} />
              Exporter en PDF
            </button>
            <button
              onClick={onClose}
              className={`p-1 rounded-full transition-colors no-print ${
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
          className={`overflow-y-auto flex-grow p-6 print:p-4 ${
            darkMode ? "dark:bg-gray-800 print:bg-white" : "bg-white"
          }`}
        >
          {/* Company Header for print */}
          <div className="hidden print:flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Entreprise XYZ</h1>
              <p className="text-gray-600">Fiche Professionnelle</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Date: {new Date().toLocaleDateString('fr-FR')}</p>
              <p className="text-gray-600">Réf: {utilisateur._id?.slice(-8)}</p>
            </div>
          </div>

          {/* Profile Header */}
          <div className={`flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 p-6 rounded-lg print:border-b print:rounded-none ${
            darkMode ? "bg-gray-700 print:bg-white" : "bg-gray-50 print:bg-white"
          }`}>
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden print:border">
              {utilisateur.photo ? (
                <img 
                  src={utilisateur.photo} 
                  alt={`${utilisateur.nom} ${utilisateur.prenom}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-bold mb-1 ${
                darkMode ? "text-white print:text-gray-900" : "text-gray-900"
              }`}>
                {utilisateur.nom} {utilisateur.prenom}
              </h1>
              <p className={`text-lg mb-2 ${
                darkMode ? "text-gray-300 print:text-gray-600" : "text-gray-600"
              }`}>
                {utilisateur.type_utilisateur}
              </p>
              <div className="flex flex-wrap gap-2">
  {/* Badges pour les départements */}
  {utilisateur.departement?.length > 0 ? (
    utilisateur.departement.map((dept, index) => (
      <span
        key={`dept-${index}`}
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          darkMode ? "bg-gray-600 text-gray-200 print:bg-gray-200 print:text-gray-700" 
                  : "bg-gray-200 text-gray-700"
        }`}
      >
        {dept.nom}
      </span>
    ))
  ) : (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
      darkMode ? "bg-gray-600 text-gray-200 print:bg-gray-200 print:text-gray-700" 
              : "bg-gray-200 text-gray-700"
    }`}>
      Non affecté
    </span>
  )}
  
  {/* Badge "Membre depuis" */}
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
    darkMode ? "bg-gray-600 text-gray-200 print:bg-gray-200 print:text-gray-700" 
            : "bg-gray-200 text-gray-700"
  }`}>
    Membre depuis {formatDate(utilisateur.createdAt)}
  </span>
</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
            {/* Left Column */}
            <div>
              {/* Section Identification */}
              <div className={`mb-6 p-5 rounded-lg border print:shadow-none ${
                darkMode ? "border-gray-600 print:border-gray-300" : "border-gray-200"
              }`}>
                <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
                  darkMode ? "text-white border-gray-600 print:text-gray-800 print:border-gray-300" : "text-gray-800 border-gray-200"
                }`}>
                  <User size={18} className="text-green-600" />
                  Informations Personnelles
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      darkMode ? "bg-gray-600 text-green-400 print:bg-green-100 print:text-green-600" : "bg-green-100 text-green-600"
                    }`}>
                      <User size={16} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? "text-gray-400 print:text-gray-500" : "text-gray-500"
                      }`}>Nom complet</p>
                      <p className={`font-medium ${
                        darkMode ? "text-white print:text-gray-800" : "text-gray-800"
                      }`}>{utilisateur.nom} {utilisateur.prenom}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      darkMode ? "bg-gray-600 text-green-400 print:bg-green-100 print:text-green-600" : "bg-green-100 text-green-600"
                    }`}>
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? "text-gray-400 print:text-gray-500" : "text-gray-500"
                      }`}>Email</p>
                      <p className={`font-medium ${
                        darkMode ? "text-white print:text-gray-800" : "text-gray-800"
                      }`}>{utilisateur.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      darkMode ? "bg-gray-600 text-green-400 print:bg-green-100 print:text-green-600" : "bg-green-100 text-green-600"
                    }`}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? "text-gray-400 print:text-gray-500" : "text-gray-500"
                      }`}>Téléphone</p>
                      <p className={`font-medium ${
                        darkMode ? "text-white print:text-gray-800" : "text-gray-800"
                      }`}>{utilisateur.tel || "Non spécifié"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      darkMode ? "bg-gray-600 text-green-400 print:bg-green-100 print:text-green-600" : "bg-green-100 text-green-600"
                    }`}>
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? "text-gray-400 print:text-gray-500" : "text-gray-500"
                      }`}>Date de naissance</p>
                      <p className={`font-medium ${
                        darkMode ? "text-white print:text-gray-800" : "text-gray-800"
                      }`}>{formatDate(utilisateur.DateNaissance)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Section Professionnelle */}
              <div className={`mb-6 p-5 rounded-lg border print:shadow-none ${
                darkMode ? "border-gray-600 print:border-gray-300" : "border-gray-200"
              }`}>
                <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
                  darkMode ? "text-white border-gray-600 print:text-gray-800 print:border-gray-300" : "text-gray-800 border-gray-200"
                }`}>
                  <Briefcase size={18} className="text-green-600" />
                  Informations Professionnelles
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      darkMode ? "bg-gray-600 text-green-400 print:bg-green-100 print:text-green-600" : "bg-green-100 text-green-600"
                    }`}>
                      <Key size={16} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? "text-gray-400 print:text-gray-500" : "text-gray-500"
                      }`}>Rôle</p>
                      <p className={`font-medium ${
                        darkMode ? "text-white print:text-gray-800" : "text-gray-800"
                      }`}>{utilisateur.type_utilisateur}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      darkMode ? "bg-gray-600 text-green-400 print:bg-green-100 print:text-green-600" : "bg-green-100 text-green-600"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? "text-gray-400 print:text-gray-500" : "text-gray-500"
                      }`}>Département</p>
                      <p className={`font-medium ${darkMode ? "text-white print:text-gray-800" : "text-gray-800"}`}>
                    {utilisateur.departement?.length > 0 
                        ? utilisateur.departement.map(dept => dept.nom).join(', ') 
                        : "Non affecté"}
                    </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      darkMode ? "bg-gray-600 text-green-400 print:bg-green-100 print:text-green-600" : "bg-green-100 text-green-600"
                    }`}>
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? "text-gray-400 print:text-gray-500" : "text-gray-500"
                      }`}>Date de création</p>
                      <p className={`font-medium ${
                        darkMode ? "text-white print:text-gray-800" : "text-gray-800"
                      }`}>{formatDate(utilisateur.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer for print */}
          <div className="hidden print:block mt-8 pt-4 border-t text-xs text-gray-500 text-center">
            <p>Document généré le {new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p className="mt-1">Confidentiel - Usage professionnel uniquement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilisateurReportModal;