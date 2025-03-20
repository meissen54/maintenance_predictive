// EquipementListPage.jsx
import EquipementList from "../components/EquipementList";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const EquipementListPage = () => {
  const labelText = "Liste d'équipements"; // Le texte que tu veux afficher

  return (
    <div className="flex h-screen bg-[#f3f8f5]">
      {/* Sidebar avec largeur définie */}
      <Sidebar className="sticky top-0" style={{ width: "22rem" }} />

      {/* Contenu principal */}
      <div className="flex flex-col w-full">
        {/* Navbar avec position sticky */}
        <Navbar className="sticky top-0 w-full z-10" labelText={labelText} />

        {/* Contenu de la page avec fond et prise d'espace totale */}
        <div className="p-6 flex-grow h-full overflow-y-auto bg-[#f3f8f5]">
          <EquipementList />
        </div>
      </div>
    </div>
  );
};

export default EquipementListPage; 