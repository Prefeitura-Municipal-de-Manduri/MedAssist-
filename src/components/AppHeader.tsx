import { Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AppHeader() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-foreground">MedAssist</h1>
            <p className="text-xs text-muted-foreground">Gestão de Pacientes e Medicamentos</p>
          </div>
        </Link>
        <nav className="flex gap-1">
          <Link
            to="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Pacientes
          </Link>
        </nav>
      </div>
    </header>
  );
}
