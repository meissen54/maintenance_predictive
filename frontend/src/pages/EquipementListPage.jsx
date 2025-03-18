import EquipementList from "../components/EquipementList";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const EquipementListPage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex flex-col w-full">
        {/* Navbar */}
        <Navbar />

        {/* Contenu de la page */}
        <div className="p-6 flex-1">
          <EquipementList />
        </div>
      </div>
    </div>
  );
};

export default EquipementListPage;
