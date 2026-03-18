import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePaciente } from '@/hooks/usePacientes';
import { useMedicamentos, useCriarMedicamento, useEditarMedicamento, useExcluirMedicamento, useAdicionarRetirada } from '@/hooks/useMedicamentos';
import type { Tables } from '@/integrations/supabase/types';
import AppHeader from '@/components/AppHeader';
import MedicamentoFormDialog from '@/components/MedicamentoFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Pill, CalendarPlus, User, Phone, Calendar, AlertTriangle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Medicamento = Tables<'medicamentos'>;

function estaVencido(dataValidade: string | null): boolean {
  if (!dataValidade) return false;
  return new Date(dataValidade + 'T23:59:59') < new Date();
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}

export default function PacienteDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const { data: paciente, isLoading: loadingPaciente } = usePaciente(id!);
  const { data: medicamentos, isLoading: loadingMeds } = useMedicamentos(id!);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Medicamento | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  const criar = useCriarMedicamento();
  const editar = useEditarMedicamento();
  const excluir = useExcluirMedicamento();
  const retirada = useAdicionarRetirada();

  const handleSubmit = (data: { nome: string; data_inicio: string; data_validade?: string; vezes_tomado?: number }) => {
    if (editando) {
      editar.mutate({ id: editando.id, paciente_id: id!, ...data }, { onSuccess: () => { setDialogOpen(false); setEditando(null); } });
    } else {
      criar.mutate({ paciente_id: id!, ...data }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleRetirada = (med: Medicamento) => {
    const hoje = new Date().toISOString().split('T')[0];
    retirada.mutate({
      id: med.id,
      paciente_id: id!,
      novaData: hoje,
      datasAtuais: med.datas_retirada ?? [],
      vezesAtual: med.vezes_tomado,
    });
  };

  if (loadingPaciente) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">Paciente não encontrado.</p>
          <Link to="/"><Button variant="outline" className="mt-4">Voltar</Button></Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        {/* Voltar */}
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar para pacientes
        </Link>

        {/* Info do paciente */}
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{paciente.nome}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                {paciente.contato && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{paciente.contato}</span>}
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(paciente.data_nascimento)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">ID: {paciente.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Medicamentos */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Medicamentos</h3>
            <p className="text-sm text-muted-foreground">
              {medicamentos ? `${medicamentos.length} medicamento(s)` : 'Carregando...'}
            </p>
          </div>
          <Button onClick={() => { setEditando(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        {loadingMeds ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : medicamentos?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Pill className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">Nenhum medicamento cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {medicamentos?.map(med => {
              const vencido = estaVencido(med.data_validade);
              return (
                <Card key={med.id} className={`transition-shadow hover:shadow-md ${vencido ? 'border-destructive/30' : ''}`}>
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className={`h-5 w-5 ${vencido ? 'text-destructive' : 'text-primary'}`} />
                        <CardTitle className="text-base">{med.nome}</CardTitle>
                      </div>
                      {vencido ? (
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" /> Vencido
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Válido</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Início</span>
                        <p className="font-medium">{formatDate(med.data_inicio)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Validade</span>
                        <p className={`font-medium ${vencido ? 'text-destructive' : ''}`}>{formatDate(med.data_validade)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Vezes tomado</span>
                        <p className="font-medium">{med.vezes_tomado}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Retiradas</span>
                        <p className="font-medium">{med.datas_retirada?.length ?? 0}</p>
                      </div>
                    </div>

                    {/* Datas de retirada */}
                    {med.datas_retirada && med.datas_retirada.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-muted-foreground">Datas de retirada:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {med.datas_retirada.map((d, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{formatDate(d)}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetirada(med)}
                        disabled={retirada.isPending}
                        className="gap-1 text-xs"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" /> Registrar Retirada
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditando(med); setDialogOpen(true); }}
                        className="gap-1 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExcluindo(med.id)}
                        className="gap-1 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialogs */}
        {dialogOpen && (
          <MedicamentoFormDialog
            open={dialogOpen}
            onClose={() => { setDialogOpen(false); setEditando(null); }}
            onSubmit={handleSubmit}
            medicamento={editando}
            isLoading={criar.isPending || editar.isPending}
          />
        )}

        <AlertDialog open={!!excluindo} onOpenChange={() => setExcluindo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir medicamento?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => { if (excluindo) excluir.mutate({ id: excluindo, paciente_id: id! }); setExcluindo(null); }}
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
