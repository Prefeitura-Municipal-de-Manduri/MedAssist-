import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePacientes, useCriarPaciente, useEditarPaciente, useExcluirPaciente } from '@/hooks/usePacientes';
import type { Tables } from '@/integrations/supabase/types';
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

type Paciente = Tables<'pacientes'>;
type OrdemListagem = 'alfabetica' | 'alfabetica_inversa' | 'ultima_alteracao';

const LABEL_ORDENACAO: Record<OrdemListagem, string> = {
  alfabetica: 'Alfabética (A-Z)',
  alfabetica_inversa: 'Alfabética (Z-A)',
  ultima_alteracao: 'Última alteração',
};

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
      editar.mutate({ id: editando.id, ...data }, { onSuccess: () => { setDialogOpen(false); setEditando(null); } });
    } else {
      criar.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const pacientesOrdenados = useMemo(() => {
    const lista = [...(pacientes ?? [])];

    if (ordemListagem === 'alfabetica') {
      return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }

    if (ordemListagem === 'alfabetica_inversa') {
      return lista.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR'));
    }

    return lista.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [pacientes, ordemListagem]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        {/* Cabeçalho */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pacientes</h2>
            <p className="text-sm text-muted-foreground">
              {pacientes ? `${pacientes.length} paciente(s) cadastrado(s)` : 'Carregando...'}
            </p>
          </div>
          <Button onClick={() => { setEditando(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Paciente
          </Button>
        </div>

        {/* Busca */}
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
          <Select value={ordemListagem} onValueChange={value => setOrdemListagem(value as OrdemListagem)}>
            <SelectTrigger className="sm:w-[240px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alfabetica">{LABEL_ORDENACAO.alfabetica}</SelectItem>
              <SelectItem value="alfabetica_inversa">{LABEL_ORDENACAO.alfabetica_inversa}</SelectItem>
              <SelectItem value="ultima_alteracao">{LABEL_ORDENACAO.ultima_alteracao}</SelectItem>
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
              <p className="text-sm text-muted-foreground">Cadastre o primeiro paciente clicando no botão acima.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {pacientesOrdenados.map(p => (
              <Card key={p.id} className="group transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/paciente/${p.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                      {p.nome}
                    </Link>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      {p.contato && (
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.contato}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(p.data_nascimento)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { setEditando(p); setDialogOpen(true); }}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setExcluindo(p.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link to={`/paciente/${p.id}`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialogs */}
        {dialogOpen && (
          <PacienteFormDialog
            open={dialogOpen}
            onClose={() => { setDialogOpen(false); setEditando(null); }}
            onSubmit={handleSubmit}
            paciente={editando}
            isLoading={criar.isPending || editar.isPending}
          />
        )}

        <AlertDialog open={!!excluindo} onOpenChange={() => setExcluindo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todos os medicamentos deste paciente também serão excluídos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => { if (excluindo) excluir.mutate(excluindo); setExcluindo(null); }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
