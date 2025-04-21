import React, { useState, useEffect } from 'react';
import { X, Download, HardDrive, Thermometer, Gauge, Droplets, Vibrate } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const CapteurReportModal = ({ 
  isOpen, 
  onClose, 
  capteur,
  selectedColor,
  darkMode 
}) => {
  const reportRef = React.useRef();
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yAxisDomain, setYAxisDomain] = useState([0, 100]);

  useEffect(() => {
    if (isOpen && capteur?._id) {
      fetchSensorData();
    }
  }, [isOpen, capteur]);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:4000/apiCapteur/getDataByCapteur/${capteur._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSensorData(response.data || []);
      
      // Calculer le domaine Y dynamiquement
      if (response.data && response.data.length > 0) {
        const values = response.data.map(item => {
          switch(capteur.type?.toLowerCase()) {
            case 'température': return item.temperature;
            case 'vibration': return item.vibration;
            case 'humidité': return item.humidite;
            case 'gaz': return item.gaz;
            case 'poids': return item.poids;
            default: return item.value;
          }
        }).filter(val => val !== undefined);
        
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const padding = (maxVal - minVal) * 0.2; // 20% de padding
        
        setYAxisDomain([minVal - padding, maxVal + padding]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setError("Erreur de chargement des données");
      setSensorData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("fr-FR", {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Date invalide";
    }
  };

  const getTypeIcon = (type) => {
    if (!type) return <HardDrive size={16} />;
    
    switch(type.toLowerCase()) {
      case 'température': 
        return <Thermometer size={16} />;
      case 'pression': 
        return <Gauge size={16} />;
      case 'humidité': 
        return <Droplets size={16} />;
      case 'vibration': 
        return <Vibrate size={16} />;
      default: 
        return <HardDrive size={16} />;
    }
  };

  const getValueForType = (item, type) => {
    switch(type?.toLowerCase()) {
      case 'température':
        return item.temperature;
      case 'vibration':
        return item.vibration;
      case 'humidité':
        return item.humidite;
      case 'gaz':
        return item.gaz;
      case 'poids':
        return item.poids;
      default:
        return item.value;
    }
  };

  const getUnitForType = (type) => {
    switch(type?.toLowerCase()) {
      case 'température':
        return '°C';
      case 'vibration':
        return 'mm/s';
      case 'gaz':
        return 'ppm';
      case 'humidité':
        return '%';
      case 'poids':
        return 'kg';
      case 'pression':
        return 'bar';
      default:
        return '';
    }
  };

  const getChartColor = (type) => {
    // Modification ici pour utiliser du vert (#4CAF50) comme couleur principale
    return '#4CAF50'; // Vert vif pour la courbe
  };

  const renderChart = () => {
    if (error) {
      return (
        <div className={`text-center py-8 rounded-md ${
          darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
        }`}>
          {error}
        </div>
      );
    }

    if (loading) {
      return (
        <div className={`text-center py-8 rounded-md ${
          darkMode ? "dark:bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-500"
        }`}>
          Chargement des données...
        </div>
      );
    }

    if (sensorData.length === 0) {
      return (
        <div className={`text-center py-8 rounded-md ${
          darkMode ? "dark:bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-500"
        }`}>
          Aucune donnée disponible pour ce capteur
        </div>
      );
    }

    const chartData = sensorData.map(item => ({
      date: formatDate(item.timestamp),
      value: getValueForType(item, capteur.type),
      unit: getUnitForType(capteur.type)
    }));

    const chartColor = getChartColor(capteur.type);
    const isLineChart = ['température', 'vibration', 'gaz'].includes(capteur.type?.toLowerCase());
    const isBarChart = ['pression', 'poids'].includes(capteur.type?.toLowerCase());
    const isAreaChart = ['humidité'].includes(capteur.type?.toLowerCase());

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 40, bottom: 20 },
      className: "chart-container"
    };

    const axisStyle = {
      stroke: darkMode ? "#9CA3AF" : "#6B7280",
      tick: { fontSize: 11 },
      tickMargin: 10
    };

    const tooltipStyle = {
      contentStyle: {
        backgroundColor: darkMode ? "#374151" : "#F3F4F6",
        borderColor: darkMode ? "#4B5563" : "#E5E7EB",
        color: darkMode ? "#F3F4F6" : "#111827",
        borderRadius: '6px',
        boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.1)'
      },
      formatter: (value) => [`${value} ${getUnitForType(capteur.type)}`, capteur.type],
      labelFormatter: (label) => `Heure: ${label}`,
      itemStyle: {
        padding: '4px 0',
        fontSize: '14px'
      }
    };

    const cartesianGridStyle = {
      strokeDasharray: "3 3",
      stroke: darkMode ? "#4B5563" : "#E5E7EB",
      vertical: false
    };

    const lineProps = {
      type: "monotone",
      dataKey: "value",
      name: `${capteur.type} (${getUnitForType(capteur.type)})`,
      stroke: chartColor, // Utilisation de la couleur verte
      strokeWidth: 3,
      dot: { 
        r: 5,
        stroke: chartColor,
        strokeWidth: 2,
        fill: darkMode ? '#1F2937' : '#FFFFFF'
      },
      activeDot: { 
        r: 8,
        stroke: chartColor,
        strokeWidth: 2,
        fill: darkMode ? '#1F2937' : '#FFFFFF'
      },
      isAnimationActive: true,
      animationDuration: 1000,
      animationEasing: "ease-out"
    };

    const barProps = {
      dataKey: "value",
      name: `${capteur.type} (${getUnitForType(capteur.type)})`,
      fill: chartColor, // Utilisation de la couleur verte
      radius: [4, 4, 0, 0],
      isAnimationActive: true,
      animationDuration: 1000,
      animationEasing: "ease-out"
    };

    const areaProps = {
      type: "monotone",
      dataKey: "value",
      name: `${capteur.type} (${getUnitForType(capteur.type)})`,
      stroke: chartColor, // Utilisation de la couleur verte
      fill: chartColor,
      fillOpacity: 0.2,
      strokeWidth: 3,
      isAnimationActive: true,
      animationDuration: 1000,
      animationEasing: "ease-out"
    };

    const ChartComponent = isLineChart ? LineChart : 
                         isBarChart ? BarChart : 
                         isAreaChart ? AreaChart : LineChart;

    return (
      <ResponsiveContainer width="100%" height={450}>
        <ChartComponent {...commonProps}>
          <CartesianGrid {...cartesianGridStyle} />
          <XAxis 
            dataKey="date" 
            {...axisStyle}
            label={{
              value: 'Heure de mesure',
              position: 'insideBottomRight',
              offset: -10,
              fill: darkMode ? "#D1D5DB" : "#4B5563",
              fontSize: 12
            }}
          />
          <YAxis 
            {...axisStyle}
            domain={yAxisDomain}
            label={{ 
              value: `${capteur.type} (${getUnitForType(capteur.type)})`, 
              angle: -90, 
              position: 'insideLeft',
              fill: darkMode ? "#D1D5DB" : "#4B5563",
              fontSize: 12
            }}
            tickCount={8}
          />
          <Tooltip {...tooltipStyle} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
          
          {isLineChart && <Line {...lineProps} />}
          {isBarChart && <Bar {...barProps} />}
          {isAreaChart && <Area {...areaProps} />}
          
          <ReferenceLine 
            y={yAxisDomain[0]} 
            stroke={darkMode ? "#4B5563" : "#E5E7EB"} 
            strokeDasharray="3 3" 
            ifOverflow="extendDomain"
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  // [Le reste du code reste inchangé...]
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
      pdf.save(`rapport_capteur_${capteur.numSerie || capteur._id}.pdf`);
      
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      setError("Erreur lors de la génération du PDF");
    }
  };

  if (!isOpen || !capteur) return null;

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
              Rapport Capteur
            </h2>
            <p className={`text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}>
              {capteur.numSerie || 'Capteur'}
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
          {/* Section Informations générales */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              <HardDrive size={18} className="text-blue-500" />
              Informations générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>Détails du capteur</h4>
                
                <div className={`space-y-3 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <div className="flex items-start">
                    <span className="w-32 font-medium">Numéro de série:</span>
                    <span>{capteur.numSerie || "N/A"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 font-medium">Type:</span>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(capteur.type)}
                      <span>{capteur.type || "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 font-medium">Date installation:</span>
                    <span>{formatDate(capteur.dateInstallation)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className={`text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>Emplacement</h4>
                
                <div className={`space-y-3 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <div className="flex items-start">
                    <span className="w-32 font-medium">Composant:</span>
                    <span>{capteur.composant?.nom || "N/A"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 font-medium">Équipement:</span>
                    <span>{capteur.composant?.equipement?.nom || "N/A"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 font-medium">Département:</span>
                    <span>
                      {capteur.composant?.departement?.nom || 
                       capteur.composant?.equipement?.departement?.nom || 
                       "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Description */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              <HardDrive size={18} className="text-blue-500" />
              Description
            </h3>
            
            <div className={`p-4 rounded-md ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <p className={`whitespace-pre-line ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}>
                {capteur.description || "Aucune description disponible"}
              </p>
            </div>
          </div>

          {/* Section Données */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2 ${
              darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
            }`}>
              <HardDrive size={18} className="text-blue-500" />
              Données du capteur
            </h3>
            
            <div className={`rounded-md ${
              darkMode ? "dark:bg-gray-700" : "bg-gray-50"
            }`}>
              {renderChart()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapteurReportModal;