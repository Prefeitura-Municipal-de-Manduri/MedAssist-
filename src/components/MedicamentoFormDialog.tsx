import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Medicamento = {
  id?: number;
  nome: string;
  data_inicio: string;
  data_validade?: string;
  vezes_tomado?: number;
  dose?: string;
};

interface MedicamentoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    nome: string; 
    data_inicio: string; 
    data_validade?: string; 
    vezes_tomado?: number;
    dose?: string;
  }) => void;
  medicamento?: Medicamento | null;
  isLoading?: boolean;
}

export default function MedicamentoFormDialog({
  open,
  onClose,
  onSubmit,
  medicamento,
  isLoading
}: MedicamentoFormDialogProps) {

  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [vezesTomado, setVezesTomado] = useState(0);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (medicamento) {
      setNome(medicamento.nome ?? '');
      setDose(medicamento.dose ?? '');
      setDataInicio(medicamento.data_inicio ?? '');
      setDataValidade(medicamento.data_validade ?? '');
      setVezesTomado(medicamento.vezes_tomado ?? 0);
    } else {
      setNome('');
      setDose('');
      setDataInicio('');
      setDataValidade('');
      setVezesTomado(0);
    }
  }, [medicamento, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErro('O nome do medicamento é obrigatório.');
      return;
    }

    if (!dataInicio) {
      setErro('A data de início é obrigatória.');
      return;
    }

    setErro('');

    onSubmit({
      nome: nome.trim(),
      data_inicio: dataInicio,
      data_validade: dataValidade || undefined,
      vezes_tomado: vezesTomado ?? 0,
      dose: dose?.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {medicamento ? 'Editar Medicamento' : 'Novo Medicamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nome */}
          <div>
            <Label htmlFor="med-nome">Nome do Medicamento *</Label>
            <Input
              id="med-nome"
              placeholder="Ex: Losartana 50mg"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          {/* 💊 Dose */}
          <div>
            <Label htmlFor="med-dose">Dose</Label>
            <Input
              id="med-dose"
              placeholder="Ex: 30 comprimidos ou 1 frasco 120ml"
              value={dose}
              onChange={e => setDose(e.target.value)}
            />
          </div>

          {/* Data início */}
          <div>
            <Label htmlFor="med-inicio">Data de Início *</Label>
            <Input
              id="med-inicio"
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
            />
          </div>

          {/* Data validade */}
          <div>
            <Label htmlFor="med-validade">Data de Validade</Label>
            <Input
              id="med-validade"
              type="date"
              value={dataValidade}
              onChange={e => setDataValidade(e.target.value)}
            />
          </div>

          {/* Vezes tomado */}
          {medicamento && (
            <div>
              <Label htmlFor="med-vezes">Vezes Tomado</Label>
              <Input
                id="med-vezes"
                type="number"
                min={0}
                value={vezesTomado}
                onChange={e => setVezesTomado(Number(e.target.value))}
              />
            </div>
          )}

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}