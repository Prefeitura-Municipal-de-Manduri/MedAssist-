import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Tables } from '@/integrations/supabase/types';

type Medicamento = Tables<'medicamentos'>;

interface MedicamentoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { nome: string; data_inicio: string; data_validade?: string; vezes_tomado?: number }) => void;
  medicamento?: Medicamento | null;
  isLoading?: boolean;
}

export default function MedicamentoFormDialog({ open, onClose, onSubmit, medicamento, isLoading }: MedicamentoFormDialogProps) {
  const [nome, setNome] = useState(medicamento?.nome ?? '');
  const [dataInicio, setDataInicio] = useState(medicamento?.data_inicio ?? '');
  const [dataValidade, setDataValidade] = useState(medicamento?.data_validade ?? '');
  const [vezesTomado, setVezesTomado] = useState(medicamento?.vezes_tomado ?? 0);
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { setErro('O nome do medicamento é obrigatório.'); return; }
    if (!dataInicio) { setErro('A data de início é obrigatória.'); return; }
    setErro('');
    onSubmit({
      nome: nome.trim(),
      data_inicio: dataInicio,
      data_validade: dataValidade || undefined,
      vezes_tomado: vezesTomado,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{medicamento ? 'Editar Medicamento' : 'Novo Medicamento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="med-nome">Nome do Medicamento *</Label>
            <Input id="med-nome" placeholder="Ex: Losartana 50mg" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="med-inicio">Data de Início *</Label>
            <Input id="med-inicio" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="med-validade">Data de Validade</Label>
            <Input id="med-validade" type="date" value={dataValidade} onChange={e => setDataValidade(e.target.value)} />
          </div>
          {medicamento && (
            <div>
              <Label htmlFor="med-vezes">Vezes Tomado</Label>
              <Input id="med-vezes" type="number" min={0} value={vezesTomado} onChange={e => setVezesTomado(Number(e.target.value))} />
            </div>
          )}
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
