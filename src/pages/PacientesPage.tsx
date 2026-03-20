import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePacientes, useCriarPaciente, useEditarPaciente, useExcluirPaciente } from '@/hooks/usePacientes';
import AppHeader from '@/components/AppHeader';
import PacienteFormDialog from '@/components/PacienteFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, User, Phone, Calendar, ChevronRight } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Paciente = {
  id: string;
  nome: string;
  contato?: string;
  data_nascimento?: string | null;
};

type OrdemListagem = 'alfabetica' | 'alfabetica_inversa';

export default function PacientesPage() {
  const [busca, setBusca] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Paciente | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [ordemListagem, setOrdemListagem] = useState<OrdemListagem>('alfabetica');

  const { data: pacientes, isLoading } = usePacientes(busca);
  const criar = useCriarPaciente();
  const editar = useEditarPaciente();
  const excluir = useExcluirPaciente();

  const handleSubmit = (data: { nome: string; contato?: string; data_nascimento?: string }) => {
    if (editando) {
      editar.mutate({ id: editando.id, ...data }, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditando(null);
        }
      });
    } else {
      criar.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  // 🔥 ORDENAÇÃO AQUI
  const pacientesOrdenados = useMemo(() => {
    const lista = [...(pacientes ?? [])];

    if (ordemListagem === 'alfabetica') {
      return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }

    return lista.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR'));
  }, [pacientes, ordemListagem]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pacientes</h2>
            <p className="text-sm text-muted-foreground">
              {pacientes ? `${pacientes.length} paciente(s) cadastrados` : 'Carregando...'}
            </p>
          </div>
          <Button onClick={() => { setEditando(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Paciente
          </Button>
        </div>

        {/* Busca + Ordenação */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 🔥 SELECT DE ORDENAÇÃO */}
          <Select value={ordemListagem} onValueChange={value => setOrdemListagem(value as OrdemListagem)}>
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alfabetica">A → Z</SelectItem>
              <SelectItem value="alfabetica_inversa">Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : pacientesOrdenados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <User className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">Nenhum paciente encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {pacientesOrdenados.map(p => (
              <Card key={p.id} className="group hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1">
                    <Link to={`/paciente/${p.id}`} className="font-semibold hover:text-primary">
                      {p.nome}
                    </Link>

                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                      {p.contato && <span><Phone className="inline h-3 w-3" /> {p.contato}</span>}
                      <span><Calendar className="inline h-3 w-3" /> {formatDate(p.data_nascimento)}</span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditando(p); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button size="icon" variant="ghost" onClick={() => setExcluindo(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Link to={`/paciente/${p.id}`}>
                      <Button size="icon" variant="ghost">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {dialogOpen && (
          <PacienteFormDialog
            open={dialogOpen}
            onClose={() => { setDialogOpen(false); setEditando(null); }}
            onSubmit={handleSubmit}
            paciente={editando}
            isLoading={criar.isPending || editar.isPending}
          />
        )}

        {/* Delete */}
        <AlertDialog open={!!excluindo} onOpenChange={() => setExcluindo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (excluindo) excluir.mutate(excluindo);
                setExcluindo(null);
              }}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>

          </AlertDialogContent>
        </AlertDialog>

      </main>
    </div>
  );
}