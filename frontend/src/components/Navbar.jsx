// Navbar.jsx
const Navbar = ({ labelText }) => {
  return (
    <div className="flex justify-between items-center bg-white shadow-md p-4">
      <div className="flex items-center space-x-3">
        {/* Icône de menu plus claire */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-green-500 cursor-pointer"  // Changer ici text-gray-700 en text-green-500
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>

        {/* Label à côté des trois traits */}
        <span className="text-2xl font-semibold text-gray-800">{labelText}</span>
      </div>

      <div className="flex items-center space-x-5">
        {/* Notification Bell */}
        <div className="relative group">
          <div className="bg-white rounded-full p-3 shadow-sm transition-transform transform group-hover:scale-110">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-green-500 cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.16 6 8.388 6 11v3.158a2.033 2.033 0 01-1.595 2.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center">
            10
          </div>
        </div>

        {/* Moon */}
        <div className="bg-white rounded-full p-3 shadow-sm transition-transform transform group-hover:scale-110">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-green-500 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
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
