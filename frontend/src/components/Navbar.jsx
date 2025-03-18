import { Bell, Moon } from "lucide-react";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center bg-white shadow-md p-4">
      <div className="flex items-center">
        {/* Traits à la place du cercle */}
        <div className="flex flex-col justify-center mr-3">
          <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-600"></div>
        </div>
        <h1 className="text-xl font-semibold text-black">Patient</h1>
      </div>

      <div className="flex items-center space-x-5">
        {/* Notification Bell */}
        <div className="relative group">
          <div className="bg-white rounded-full p-3 shadow-sm transition-transform transform group-hover:scale-110">
            <Bell className="text-green-500 cursor-pointer w-6 h-6" />
          </div>
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center">
            10
          </div>
        </div>

        {/* Moon */}
        <div className="bg-white rounded-full p-3 shadow-sm transition-transform transform group-hover:scale-110">
          <Moon className="text-green-500 cursor-pointer w-6 h-6" />
        </div>

        {/* Nom de l'utilisateur */}
        <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-3 shadow-sm">
          <span className="font-medium text-gray-700">Roberto</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;