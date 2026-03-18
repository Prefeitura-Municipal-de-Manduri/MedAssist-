import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Tables } from '@/integrations/supabase/types';

type Paciente = Tables<'pacientes'>;

interface PacienteFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { nome: string; contato?: string; data_nascimento?: string }) => void;
  paciente?: Paciente | null;
  isLoading?: boolean;
}

export default function PacienteFormDialog({ open, onClose, onSubmit, paciente, isLoading }: PacienteFormDialogProps) {
  const [nome, setNome] = useState(paciente?.nome ?? '');
  const [contato, setContato] = useState(paciente?.contato ?? '');
  const [dataNascimento, setDataNascimento] = useState(paciente?.data_nascimento ?? '');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { setErro('O nome é obrigatório.'); return; }
    setErro('');
    onSubmit({
      nome: nome.trim(),
      contato: contato.trim() || undefined,
      data_nascimento: dataNascimento || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{paciente ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="contato">Contato</Label>
            <Input id="contato" placeholder="(00) 00000-0000" value={contato} onChange={e => setContato(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input id="data_nascimento" type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
          </div>
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
