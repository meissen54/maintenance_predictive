import { Bell, MessageCircle, Gift, Moon, User } from "lucide-react";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center bg-white shadow-md p-4">
      <h1 className="text-lg font-bold">Patient List</h1>

      <div className="flex items-center space-x-4">
        <Bell className="text-gray-500 cursor-pointer" />
        <MessageCircle className="text-gray-500 cursor-pointer" />
        <Gift className="text-gray-500 cursor-pointer" />
        <Moon className="text-gray-500 cursor-pointer" />
        
        {/* Profil */}
        <div className="flex items-center space-x-2">
          <User className="text-gray-500" />
          <span className="font-medium text-green-500">Roberto</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
