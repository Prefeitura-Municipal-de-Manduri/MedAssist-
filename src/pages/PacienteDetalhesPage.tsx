import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePaciente } from '@/hooks/usePacientes';
import { useMedicamentos, useCriarMedicamento, useEditarMedicamento, useExcluirMedicamento, useAdicionarRetirada } from '@/hooks/useMedicamentos';
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

type Medicamento = {
  id: number;
  paciente_id: number;
  nome: string;
  data_inicio: string;
  data_validade?: string | null;
  vezes_tomado: number;
  datas_retirada?: string[];
};

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
  const pacienteId = Number(id);

  const { data: paciente, isLoading: loadingPaciente } = usePaciente(id!);
  const { data: medicamentos, isLoading: loadingMeds } = useMedicamentos(id!);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Medicamento | null>(null);
  const [excluindo, setExcluindo] = useState<number | null>(null);

  const criar = useCriarMedicamento();
  const editar = useEditarMedicamento();
  const excluir = useExcluirMedicamento();
  const retirada = useAdicionarRetirada();

  const handleSubmit = (data: any) => {
    if (editando) {
      editar.mutate({ id: editando.id, paciente_id: pacienteId, ...data }, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditando(null);
        }
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
      vezesAtual: med.vezes_tomado,
    });
  };

  if (loadingPaciente) return <div>Carregando...</div>;
  if (!paciente) return <div>Paciente não encontrado</div>;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold">{paciente.nome}</h2>
          </CardContent>
        </Card>

        {/* 🔥 SEÇÃO MEDICAMENTOS */}
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Medicamentos</h3>

          <Button onClick={() => {
            setEditando(null);
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        {loadingMeds ? (
          <p>Carregando medicamentos...</p>
        ) : (
          medicamentos?.map(med => (
            <Card key={med.id} className="mb-2">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{med.nome}</p>
                  <p>{formatDate(med.data_inicio)}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRetirada(med)}>
                    Registrar Retirada
                  </Button>
                 
                  <Button size="sm" onClick={() => {
                    setEditando(med);
                    setDialogOpen(true);
                  }}>
                    Editar
                  </Button>

                  <Button size="sm" onClick={() => setExcluindo(med.id)}>
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* MODAL */}
        {dialogOpen && (
          <MedicamentoFormDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSubmit={handleSubmit}
          />
        )}

        {/* DELETE */}
        <AlertDialog open={!!excluindo} onOpenChange={() => setExcluindo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir?</AlertDialogTitle>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (excluindo) excluir.mutate({ id: excluindo, paciente_id: pacienteId });
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