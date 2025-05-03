import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AlertsModal = ({ unreadAlertsCount, localColor, darkMode, onClose }) => {
  const [alerts, setAlerts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const pollingIntervalRef = useRef(null);
  const currentAlertsRef = useRef([]);
  const navigate = useNavigate();

  const updateAlertStatus = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/apiAlerte/updateStatut/${alertId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour localement l'état de l'alerte
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId ? { ...alert, statut: "consultée" } : alert
        )
      );
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAlertClick = async (alert) => {
    // Mettre à jour le statut de l'alerte
    await updateAlertStatus(alert._id);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/apiAlerte/getAlertPage/${alert._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let targetPage = 1;
      if (response.ok) {
        const data = await response.json();
        targetPage = data.page || 1;
      }
  
      navigate(`/alertes?page=${targetPage}`, {
        state: { 
          highlightAlertId: alert._id,
          shouldScrollToAlert: true,
          fromNotification: true,
          preserveData: true
        },
        replace: true
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      navigate('/alertes', {
        state: { 
          highlightAlertId: alert._id,
          shouldScrollToAlert: true,
          fromNotification: true,
          preserveData: true
        },
        replace: true
      });
      onClose();
    }
  };

  const fetchAlerts = useCallback(async (page = 1, silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const token = localStorage.getItem('token');
      let apiUrl = `http://localhost:4000/apiAlerte/getUnreadAlerts?page=${page}&limit=4`;
      
      if (userRole === 'Technicien') {
        apiUrl = `http://localhost:4000/apiAlerte/getUnreadAlertsByUser?page=${page}&limit=4`;
      }

      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        let newAlerts = [];
        let newTotalPages = 1;
        
        if (userRole === 'Technicien') {
          newAlerts = data.unreadAlerts || [];
          newTotalPages = Math.ceil(data.totalUnread / 4);
        } else {
          newAlerts = data.alerts || [];
          newTotalPages = Math.ceil(data.totalAlerts / 4);
        }
        
        const hasChanged = JSON.stringify(newAlerts) !== JSON.stringify(currentAlertsRef.current);
        
        if (hasChanged || !silent) {
          setAlerts(newAlerts);
          setTotalPages(newTotalPages);
          currentAlertsRef.current = newAlerts;
        }
        
        if (!silent) setCurrentPage(page);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || '');
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (userRole !== '') {
      fetchAlerts(currentPage);
    }
  }, [userRole, fetchAlerts, currentPage]);

  useEffect(() => {
    if (userRole !== '') {
      pollingIntervalRef.current = setInterval(() => {
        fetchAlerts(currentPage, true);
      }, 2000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [userRole, currentPage, fetchAlerts]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchAlerts(newPage, false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchAlerts(newPage, false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`alerts-modal-container fixed right-8 top-16 mt-2 w-96 rounded-xl shadow-xl z-50 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border`}>
      <div className={`flex items-center justify-between p-4 rounded-t-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
            <Bell size={20} style={{ color: localColor }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {unreadAlertsCount} {unreadAlertsCount > 1 ? 'alertes non lues' : 'alerte non lue'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
        >
          &times;
        </button>
      </div>
      
      <div className="p-4">
        <div className="max-h-[300px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: localColor }}></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des alertes...</p>
              </div>
            ) : alerts.length > 0 ? (
              alerts.map((alert) => (
                <div 
                  key={alert._id} 
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${darkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                      <AlertTriangle size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-white">
                          {alert.composant?.nom || 'Composant inconnu'}
                        </span>
                        <span className="font-bold text-red-500 dark:text-red-400">
                          Panne: {alert.panne || 'Non spécifié'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        <p>
                          <span className="font-medium">Équipement:</span> {alert.equipement?.nom || 'Non spécifié'}
                        </p>
                        {alert.message && (
                          <p className="mt-1 italic">"{alert.message}"</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(alert.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Bell size={32} className="text-gray-400" />
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Aucune notification non lue
                </p>
              </div>
            )}
          </div>
        </div>

        {alerts.length > 0 && (
          <div className={`flex justify-between items-center mt-4 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm disabled:opacity-50 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              style={{ color: localColor }}
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm disabled:opacity-50 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              style={{ color: localColor }}
            >
              Suivant <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsModal;