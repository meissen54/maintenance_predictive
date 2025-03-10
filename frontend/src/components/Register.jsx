import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-80 mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center">Inscription</h2>
      <form className="mt-4">
        <input type="email" placeholder="Email" className="w-full p-2 border rounded mt-2" />
        <input type="password" placeholder="Mot de passe" className="w-full p-2 border rounded mt-2" />
        <input type="text" placeholder="Nom" className="w-full p-2 border rounded mt-2" />
        <input type="text" placeholder="Prenom" className="w-full p-2 border rounded mt-2" />
        <button className="w-full mt-4 bg-blue-500 text-white p-2 rounded">S'inscrire</button>
      </form>
      <p className="text-center mt-4">
        Pas de compte ? <Link to="/login" className="text-blue-500">Se connecter</Link>
      </p>
    </div>
  );
};

export default Register;