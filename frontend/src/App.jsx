import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EquipementListPage from "./pages/EquipementListPage";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/test" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<EquipementListPage />} />
      </Routes>
    </Router>
  );
};

export default App;