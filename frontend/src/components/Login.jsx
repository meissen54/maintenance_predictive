import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-80 mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center">Connexion</h2>
      <form className="mt-4">
        <input type="email" placeholder="Email" className="w-full p-2 border rounded mt-2" />
        <input type="password" placeholder="Mot de passe" className="w-full p-2 border rounded mt-2" />
        <button className="w-full mt-4 bg-blue-500 text-white p-2 rounded">Se connecter</button>
      </form>
      <p className="text-center mt-4">
        Pas de compte ? <Link to="/register" className="text-blue-500">S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;