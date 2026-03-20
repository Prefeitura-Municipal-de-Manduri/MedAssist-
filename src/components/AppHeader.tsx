import { Link, useLocation } from 'react-router-dom';
import logo from '../imgs/logo.png';

export default function AppHeader() {
  const location = useLocation();

  return (
    <header className="w-full border-b bg-white">

      {/* LOGO */}
      <div className="w-full flex justify-center items-center py-6">
        <img
          src={logo}
          alt="MedAssist Logo"
          className="h-28 object-contain"
        />
      </div>

      {/* MENU + AÇÕES */}
      <div className="flex justify-between items-center px-6 pb-4">

        {/* MENU */}
        <div className="flex gap-4">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg transition ${
              location.pathname === '/'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Início
          </Link>

          <Link
            to="/pacientes"
            className={`px-4 py-2 rounded-lg transition ${
              location.pathname === '/pacientes'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pacientes
          </Link>
        </div>

        {/* BOTÃO ADICIONAR */}
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
          + Novo Paciente
        </button>

      </div>

    </header>
  );
}