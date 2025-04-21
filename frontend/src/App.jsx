import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EquipementListPage from './pages/EquipementListPage';
import ComposantListPage from './pages/ComposantListPage';
import UtilisateurListPage from './pages/UtilisateurListPage';
import DepartListPage from './pages/DepartListPage';
import CapteurListPage from './pages/CapteurListPage';
import DemandeListPage from './components/DemandeListPage';
import AlerteListPage from './components/AlerteListPage';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Vérifie le localStorage et le préférence système
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [selectedColor, setSelectedColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor');
    if (!savedColor) return '#22C55E';
    
    try {
      return savedColor.startsWith('{') 
        ? JSON.parse(savedColor) 
        : savedColor;
    } catch {
      return '#22C55E';
    }
  });

  // Applique le dark mode immédiatement
  useEffect(() => {
    // Ajoute ou retire la classe 'dark' sur l'élément html
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Sauvegarde dans le localStorage
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    
    // Force l'application des styles Tailwind
    const root = document.documentElement;
    root.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  // Synchronisation entre onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        const isDark = e.newValue === 'dark';
        setDarkMode(isDark);
      }
      if (e.key === 'selectedColor') {
        try {
          setSelectedColor(
            e.newValue.startsWith('{') 
              ? JSON.parse(e.newValue) 
              : e.newValue
          );
        } catch {
          setSelectedColor('#22C55E');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sauvegarde de la couleur sélectionnée
  useEffect(() => {
    localStorage.setItem(
      'selectedColor',
      typeof selectedColor === 'string' 
        ? selectedColor 
        : JSON.stringify(selectedColor)
    );
  }, [selectedColor]);

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
          <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
          <Route path="/register" element={<RegisterPage darkMode={darkMode} />} />
          <Route
            path="/dashboard"
            element={
              <EquipementListPage
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
            }
          />
          <Route
            path="/dashboard1"
            element={
              <ComposantListPage
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              
            }
          />
          <Route
            path="/utilisateurs"
            element={
              <UtilisateurListPage
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              
            }
          />
           <Route
            path="/depart"
            element={
              <DepartListPage
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              
            }
          />
        
        <Route
            path="/capteurs"
            element={
              <CapteurListPage
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              
            }
          />
           <Route
            path="/demandes"
            element={
              <DemandeListPage
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              
            }
          />
          <Route
            path="/alertes"
            element={
              <AlerteListPage
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              
            }
          />
       </Routes>
      </Router>
    </div>
  );
};

export default App;