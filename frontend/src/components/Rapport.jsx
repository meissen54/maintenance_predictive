import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, ReferenceLine } from "recharts";
import axios from "axios";
import { ChevronLeft, ChevronRight, Thermometer, Droplets, Vibrate, Gauge, HardDrive } from "lucide-react";

// Couleurs par type de capteur
const SENSOR_COLORS = {
  température: '#FF8042',
  humidité: '#0088FE',
  vibration: '#00C49F',
  pression: '#8884D8',
  default: '#A4DE6C'
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A4DE6C', '#D0ED57'];

const Rapport = ({ selectedColor, darkMode }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertPieData, setAlertPieData] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(8);

  // Fonction pour récupérer les données depuis l'API
  const fetchData = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    setCurrentPage(0); // Reset à la première page quand on change les dates
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError("Vous n'êtes pas authentifié. Veuillez vous connecter.");
      setLoading(false);
      return;
    }
    
    try {
      const formattedStartDate = new Date(startDate.setHours(0, 0, 0, 0)).toISOString();
      const formattedEndDate = new Date(endDate.setHours(23, 59, 59, 999)).toISOString();

      const response = await axios.get("http://localhost:4000/apiRepo/getRepo", {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setData(response.data.repo);
      
      // Traitement des alertes par type de panne
      if (response.data.repo.alertes?.length > 0) {
        const alertTypes = response.data.repo.alertes.reduce((acc, alert) => {
          const type = alert.panne || 'Non spécifié';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        const alertData = Object.entries(alertTypes).map(([name, value]) => ({
          name,
          value
        }));
        
        setAlertPieData(alertData);
      } else {
        setAlertPieData([]);
      }

      // Traitement des données des capteurs
      if (response.data.repo.data?.length > 0 && response.data.repo.capteurs?.length > 0) {
        // Créer un map des types de capteurs par ID
        const sensorTypes = {};
        response.data.repo.capteurs.forEach(capteur => {
          // Déterminer le type de capteur en fonction de ses champs
          let type = 'default';
          if (capteur.type?.toLowerCase().includes('température') || capteur.type?.toLowerCase().includes('temperature')) {
            type = 'température';
          } else if (capteur.type?.toLowerCase().includes('humidité') || capteur.type?.toLowerCase().includes('humidite')) {
            type = 'humidité';
          } else if (capteur.type?.toLowerCase().includes('vibration')) {
            type = 'vibration';
          } else if (capteur.type?.toLowerCase().includes('pression')) {
            type = 'pression';
          }
          sensorTypes[capteur._id] = type;
        });

        // Group data by sensor and prepare for chart
        const sensorDataMap = response.data.repo.data.reduce((acc, dataPoint) => {
          if (!acc[dataPoint.capteur]) {
            acc[dataPoint.capteur] = {
              type: sensorTypes[dataPoint.capteur] || 'default',
              data: []
            };
          }
          acc[dataPoint.capteur].data.push({
            date: new Date(dataPoint.timestamp).toLocaleDateString(),
            value: dataPoint.valeur,
            unit: dataPoint.unité || ''
          });
          return acc;
        }, {});

        // Convert to array format for chart
        const sensorChartData = Object.entries(sensorDataMap).map(([sensorId, sensorInfo]) => ({
          sensorId,
          type: sensorInfo.type,
          data: sensorInfo.data
        }));

        setSensorData(sensorChartData);
      } else {
        setSensorData([]);
      }

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError("Erreur lors de la récupération des données: " + (err.response?.data?.message || err.message));
      }
      console.error("Erreur API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  // Fonction pour obtenir la couleur en fonction du type de capteur
  const getSensorColor = (type) => {
    return SENSOR_COLORS[type] || SENSOR_COLORS.default;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Pagination functions
  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = currentPage * itemsPerPage;
  const currentItems = (items) => items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = (items) => Math.ceil(items.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fonction pour obtenir l'icône du type de capteur
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

  // Fonction pour obtenir l'unité en fonction du type de capteur
  const getUnitForType = (type) => {
    switch(type?.toLowerCase()) {
      case 'température':
        return '°C';
      case 'vibration':
        return 'mm/s';
      case 'humidité':
        return '%';
      case 'pression':
        return 'bar';
      default:
        return '';
    }
  };

  // Fonction pour rendre le graphique d'évolution des capteurs
  const renderSensorChart = (sensor) => {
    const chartColor = getSensorColor(sensor.type);
    const unit = getUnitForType(sensor.type);

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
      formatter: (value) => [`${value} ${unit}`, sensor.type],
      labelFormatter: (label) => `Date: ${label}`,
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
      name: `${sensor.type} (${unit})`,
      stroke: chartColor,
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

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sensor.data}
            margin={{
              top: 20,
              right: 30,
              left: 40,
              bottom: 20,
            }}
          >
            <CartesianGrid {...cartesianGridStyle} />
            <XAxis 
              dataKey="date" 
              {...axisStyle}
              label={{
                value: 'Date de mesure',
                position: 'insideBottomRight',
                offset: -10,
                fill: darkMode ? "#D1D5DB" : "#4B5563",
                fontSize: 12
              }}
            />
            <YAxis 
              {...axisStyle}
              label={{ 
                value: `${sensor.type} (${unit})`, 
                angle: -90, 
                position: 'insideLeft',
                fill: darkMode ? "#D1D5DB" : "#4B5563",
                fontSize: 12
              }}
            />
            <Tooltip {...tooltipStyle} />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            <Line {...lineProps} />
            <ReferenceLine 
              y={0} 
              stroke={darkMode ? "#4B5563" : "#E5E7EB"} 
              strokeDasharray="3 3" 
              ifOverflow="extendDomain"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className={`w-full p-8 ${darkMode ? "dark:bg-gray-900 bg-gray-900" : "bg-[#f3f8f5]"}`}>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div>
          <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date de début</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className={`border px-3 py-2 rounded-md ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"}`}
            placeholderText="Sélectionnez la date"
            dateFormat="yyyy-MM-dd"
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        <div>
          <label className={`block mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date de fin</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className={`border px-3 py-2 rounded-md ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"}`}
            placeholderText="Sélectionnez la date"
            dateFormat="yyyy-MM-dd"
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </div>

        <button
          onClick={fetchData}
          disabled={!startDate || !endDate || loading}
          className={`mt-6 md:mt-0 px-4 py-2 rounded-md text-white font-medium ${(!startDate || !endDate || loading) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          style={(!startDate || !endDate || loading) ? {} : { backgroundColor: selectedColor }}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement...
            </span>
          ) : 'Générer le rapport'}
        </button>
      </div>

      {loading && (
        <div className={`text-center py-4 flex justify-center items-center ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <span>Chargement en cours...</span>
        </div>
      )}
      
      {error && (
        <div className={`text-center py-4 px-4 rounded-lg ${darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"}`}>
          <span className="font-medium">Erreur: </span>{error}
        </div>
      )}

      {/* Section des graphiques */}
      {!loading && !error && (data || (startDate && endDate)) && (
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Graphique des pannes */}
          {alertPieData.length > 0 && (
            <div className={`p-4 rounded-lg shadow ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <h3 className={`text-lg font-medium mb-4 text-center ${darkMode ? "text-white" : "text-gray-800"}`}>
                Répartition des alertes
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={alertPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {alertPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} alertes`, 'Quantité']}
                      contentStyle={{
                        backgroundColor: darkMode ? '#1F2937' : 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        padding: '0.5rem',
                        color: darkMode ? 'white' : 'black'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Graphique d'évolution des capteurs */}
          {sensorData.length > 0 && (
            <div className={`p-4 rounded-lg shadow ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <h3 className={`text-lg font-medium mb-4 text-center ${darkMode ? "text-white" : "text-gray-800"}`}>
                Évolution des valeurs des capteurs
              </h3>
              <div className="space-y-8">
                {sensorData.map((sensor, index) => (
                  <div key={sensor.sensorId} className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                    <div className="flex items-center gap-2 mb-4">
                      {getTypeIcon(sensor.type)}
                      <h4 className={`text-md font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Capteur {sensor.sensorId} - Type: {sensor.type}
                      </h4>
                    </div>
                    {renderSensorChart(sensor)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section des tableaux de données */}
      {data && (
        <div className="space-y-8">
          {/* Tableau des composants */}
          {data.composants?.length > 0 && (
            <div className={`shadow-xl rounded-2xl overflow-hidden ${darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className={`text-left ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"}`}>
                    <tr className="h-16">
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Nom</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Date d'ajout</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems(data.composants).length > 0 ? (
                      currentItems(data.composants).map((item, index) => (
                        <tr 
                          key={index} 
                          className={`border-t ${darkMode ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" : index % 2 === 1 ? "bg-gray-50" : "bg-white"} h-16`}
                        >
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.nom}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {formatDate(item.dateAjout)}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.type}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Aucun composant trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {data.composants.length > itemsPerPage && (
                  <div className={`flex items-center justify-between p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, data.composants.length)} sur {data.composants.length} composants
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page précédente"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {Array.from({ length: totalPages(data.composants) }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number - 1)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                            number === currentPage + 1
                              ? 'text-white shadow-inner'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                          } transition-colors`}
                          style={number === currentPage + 1 ? { backgroundColor: selectedColor } : {}}
                          aria-label={`Page ${number}`}
                          aria-current={number === currentPage + 1 ? "page" : undefined}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages(data.composants) - 1}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === totalPages(data.composants) - 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page suivante"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tableau des équipements */}
          {data.equipements?.length > 0 && (
            <div className={`shadow-xl rounded-2xl overflow-hidden ${darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className={`text-left ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"}`}>
                    <tr className="h-16">
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Nom</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Date d'ajout</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Localisation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems(data.equipements).length > 0 ? (
                      currentItems(data.equipements).map((item, index) => (
                        <tr 
                          key={index} 
                          className={`border-t ${darkMode ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" : index % 2 === 1 ? "bg-gray-50" : "bg-white"} h-16`}
                        >
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.nom}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {formatDate(item.dateAjout)}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.localisation}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Aucun équipement trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {data.equipements.length > itemsPerPage && (
                  <div className={`flex items-center justify-between p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, data.equipements.length)} sur {data.equipements.length} équipements
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page précédente"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {Array.from({ length: totalPages(data.equipements) }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number - 1)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                            number === currentPage + 1
                              ? 'text-white shadow-inner'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                          } transition-colors`}
                          style={number === currentPage + 1 ? { backgroundColor: selectedColor } : {}}
                          aria-label={`Page ${number}`}
                          aria-current={number === currentPage + 1 ? "page" : undefined}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages(data.equipements) - 1}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === totalPages(data.equipements) - 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page suivante"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tableau des capteurs */}
          {data.capteurs?.length > 0 && (
            <div className={`shadow-xl rounded-2xl overflow-hidden ${darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className={`text-left ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"}`}>
                    <tr className="h-16">
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Type</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Description</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Numéro de série</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Date d'installation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems(data.capteurs).length > 0 ? (
                      currentItems(data.capteurs).map((item, index) => (
                        <tr 
                          key={index} 
                          className={`border-t ${darkMode ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" : index % 2 === 1 ? "bg-gray-50" : "bg-white"} h-16`}
                        >
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.type}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.description}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.numSerie}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {formatDate(item.dateInstallation)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Aucun capteur trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {data.capteurs.length > itemsPerPage && (
                  <div className={`flex items-center justify-between p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, data.capteurs.length)} sur {data.capteurs.length} capteurs
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page précédente"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {Array.from({ length: totalPages(data.capteurs) }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number - 1)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                            number === currentPage + 1
                              ? 'text-white shadow-inner'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                          } transition-colors`}
                          style={number === currentPage + 1 ? { backgroundColor: selectedColor } : {}}
                          aria-label={`Page ${number}`}
                          aria-current={number === currentPage + 1 ? "page" : undefined}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages(data.capteurs) - 1}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === totalPages(data.capteurs) - 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page suivante"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tableau des alertes */}
          {data.alertes?.length > 0 && (
            <div className={`shadow-xl rounded-2xl overflow-hidden ${darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className={`text-left ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"}`}>
                    <tr className="h-16">
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Panne</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Message</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Date</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems(data.alertes).length > 0 ? (
                      currentItems(data.alertes).map((item, index) => (
                        <tr 
                          key={index} 
                          className={`border-t ${darkMode ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" : index % 2 === 1 ? "bg-gray-50" : "bg-white"} h-16`}
                        >
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.panne || 'Non spécifié'}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.message}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {formatDate(item.dateAjout)}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} whitespace-nowrap`}>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${item.statut === 'consultée' ? 
                                (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : 
                                (darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')}`}>
                              {item.statut}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Aucune alerte trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {data.alertes.length > itemsPerPage && (
                  <div className={`flex items-center justify-between p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, data.alertes.length)} sur {data.alertes.length} alertes
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page précédente"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {Array.from({ length: totalPages(data.alertes) }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number - 1)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                            number === currentPage + 1
                              ? 'text-white shadow-inner'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                          } transition-colors`}
                          style={number === currentPage + 1 ? { backgroundColor: selectedColor } : {}}
                          aria-label={`Page ${number}`}
                          aria-current={number === currentPage + 1 ? "page" : undefined}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages(data.alertes) - 1}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === totalPages(data.alertes) - 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page suivante"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tableau des utilisateurs */}
          {data.utilisateurs?.length > 0 && (
            <div className={`shadow-xl rounded-2xl overflow-hidden ${darkMode ? "dark:bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className={`text-left ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300" : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"}`}>
                    <tr className="h-16">
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Nom</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Email</th>
                      <th className="p-4 font-semibold text-sm whitespace-nowrap">Date de création</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems(data.utilisateurs).length > 0 ? (
                      currentItems(data.utilisateurs).map((item, index) => (
                        <tr 
                          key={index} 
                          className={`border-t ${darkMode ? index % 2 === 1 ? "bg-gray-900" : "bg-gray-800" : index % 2 === 1 ? "bg-gray-50" : "bg-white"} h-16`}
                        >
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.nom}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {item.email}
                          </td>
                          <td className={`p-4 border-b ${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
                            {formatDate(item.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {data.utilisateurs.length > itemsPerPage && (
                  <div className={`flex items-center justify-between p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, data.utilisateurs.length)} sur {data.utilisateurs.length} utilisateurs
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page précédente"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {Array.from({ length: totalPages(data.utilisateurs) }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number - 1)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium ${
                            number === currentPage + 1
                              ? 'text-white shadow-inner'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                          } transition-colors`}
                          style={number === currentPage + 1 ? { backgroundColor: selectedColor } : {}}
                          aria-label={`Page ${number}`}
                          aria-current={number === currentPage + 1 ? "page" : undefined}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages(data.utilisateurs) - 1}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          currentPage === totalPages(data.utilisateurs) - 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                        aria-label="Page suivante"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {data && alertPieData.length === 0 && sensorData.length === 0 && (
        <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-2 text-lg">Aucun résultat pour cet intervalle.</p>
        </div>
      )}
    </div>
  );
};

export default Rapport;