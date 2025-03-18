import { Link } from "react-router-dom";
import { Home, Users, Calendar, BarChart, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-white shadow-lg p-4">
      <div className="text-center font-bold text-xl mb-6">🏥 ERES</div>

      <ul className="space-y-2">
        <li>
          <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100">
            <Home size={20} /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/patients" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100">
            <Users size={20} /> Patients
          </Link>
        </li>
        <li>
          <Link to="/appointments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100">
            <Calendar size={20} /> Appointments
          </Link>
        </li>
        <li>
          <Link to="/stats" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100">
            <BarChart size={20} /> Stats
          </Link>
        </li>
        <li>
          <Link to="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100">
            <Settings size={20} /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
