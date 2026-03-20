import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePaciente } from '@/hooks/usePacientes';
// Importamos o tipo Medicamento correto do seu hook
import { useMedicamentos, useCriarMedicamento, useEditarMedicamento, useExcluirMedicamento, useAdicionarRetirada, type Medicamento } from '@/hooks/useMedicamentos';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AppHeader from '@/components/AppHeader';
import MedicamentoFormDialog from '@/components/MedicamentoFormDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Pill, CalendarPlus, User, Phone, Calendar, AlertTriangle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
} from '@/components/ui/alert-dialog';

// --- FUNÇÕES AUXILIARES ---
function estaVencido(dataValidade: string | null | undefined): boolean {
  if (!dataValidade) return false;
  return new Date(dataValidade + 'T23:59:59') < new Date();
}

function consultaSocialVencida(dataProxima: string | null | undefined): boolean {
  if (!dataProxima) return true; 
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(dataProxima + 'T00:00:00') <= hoje;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}

type OrdemListagem = 'alfabetica' | 'alfabetica_inversa';

export default function PacienteDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const pacienteId = Number(id);
  const queryClient = useQueryClient();

  // Hooks de dados
  const { data: paciente, isLoading: loadingPaciente } = usePaciente(id!);
  const { data: medicamentos, isLoading: loadingMeds } = useMedicamentos(id!);
  
  // Estados de interface
  const [ordemListagem, setOrdemListagem] = useState<OrdemListagem>('alfabetica');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Medicamento | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  // Hooks de mutação
  const criar = useCriarMedicamento();
  const editar = useEditarMedicamento();
  const excluir = useExcluirMedicamento();
  const retirada = useAdicionarRetirada();

  const registrarConsultaSocial = useMutation({
    mutationFn: async () => {
      const response = await fetch(`http://localhost:3000/pacientes/${id}/registrar-consulta-social`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Erro ao conectar com o servidor');
      return response.json();
    },
    onSuccess: (dataAtualizada) => {
      queryClient.setQueryData(['paciente', id], dataAtualizada);
      queryClient.invalidateQueries({ queryKey: ['paciente', id] });
      alert("✅ Consulta registada!");
    }
  });

  const medicamentosOrdenados = useMemo(() => {
    const lista = [...(medicamentos ?? [])];
    if (ordemListagem === 'alfabetica') {
      return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }
    return lista.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR'));
  }, [medicamentos, ordemListagem]);

  // Handler atualizado para incluir a DOSE no envio
  const handleSubmit = (data: { nome: string; dose: string; data_inicio: string; data_validade?: string; vezes_tomado?: number }) => {
    if (editando) {
      editar.mutate({ id: editando.id, paciente_id: pacienteId, ...data }, { 
        onSuccess: () => { setDialogOpen(false); setEditando(null); } 
      });
    } else {
      criar.mutate({ paciente_id: pacienteId, ...data }, { 
        onSuccess: () => setDialogOpen(false) 
      });
    }
  };

  const handleRetirada = (med: Medicamento) => {
    const hoje = new Date().toISOString().split('T')[0];
    retirada.mutate({
      id: med.id,
      paciente_id: pacienteId,
      novaData: hoje,
      datasAtuais: med.datas_retirada ?? [],
      vezesAtual: med.vezes_tomado ?? 0,
    });
  };

  if (loadingPaciente) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!paciente) return <div className="text-center py-12"><p>Paciente não encontrado.</p></div>;

  const avisoSocial = consultaSocialVencida(paciente.proxima_consulta_social);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para pacientes
        </Link>

        {/* INFO PACIENTE */}
        <Card className={`mb-6 ${avisoSocial ? 'border-destructive/50 ring-1 ring-destructive/20' : ''}`}>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{paciente.nome}</h2>
              <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground mt-1">
                <span><Calendar className="inline h-3.5 w-3.5 mr-1" />{formatDate(paciente.data_nascimento)}</span>
                <span className={avisoSocial ? 'text-destructive font-bold' : ''}>
                  <CalendarPlus className="inline h-3.5 w-3.5 mr-1" /> Próxima Consulta: {formatDate(paciente.proxima_consulta_social)}
                </span>
              </div>
            </div>
            <Button onClick={() => registrarConsultaSocial.mutate()} variant={avisoSocial ? "destructive" : "outline"}>
              Registar Consulta Social
            </Button>
          </CardContent>
        </Card>

        {/* LISTAGEM MEDICAMENTOS */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Medicamentos ({medicamentos?.length ?? 0})</h3>
          <Button onClick={() => { setEditando(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        {loadingMeds ? (
          <div className="text-center py-12">Carregando medicamentos...</div>
        ) : (
          <div className="grid gap-3">
            {medicamentosOrdenados?.map(med => {
              const vencido = estaVencido(med.data_validade);
              return (
                <Card key={med.id} className={vencido ? 'border-destructive/30' : ''}>
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className={`h-5 w-5 ${vencido ? 'text-destructive' : 'text-primary'}`} />
                        <CardTitle className="text-base">
                          {med.nome} 
                          {/* EXIBIÇÃO DA DOSE AQUI */}
                          <span className="ml-2 text-sm font-normal text-muted-foreground italic">
                            ({med.dose || 'Dose não informada'})
                          </span>
                        </CardTitle>
                      </div>
                      <Badge variant={vencido ? "destructive" : "secondary"}>
                        {vencido ? "Vencido" : "Válido"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                      <div><span className="text-xs text-muted-foreground">Início</span><p>{formatDate(med.data_inicio)}</p></div>
                      <div><span className="text-xs text-muted-foreground">Validade</span><p>{formatDate(med.data_validade)}</p></div>
                      <div><span className="text-xs text-muted-foreground">Vezes</span><p>{med.vezes_tomado}</p></div>
                      <div><span className="text-xs text-muted-foreground">Retiradas</span><p>{med.datas_retirada?.length ?? 0}</p></div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleRetirada(med)}>Retirada</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditando(med); setDialogOpen(true); }}>Editar</Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setExcluindo(med.id)}>Excluir</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

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
            <AlertDialogHeader><AlertDialogTitle>Excluir?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (excluindo) excluir.mutate({ id: excluindo, paciente_id: pacienteId }); setExcluindo(null); }}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}