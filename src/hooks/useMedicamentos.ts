import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Medicamento = Tables<'medicamentos'>;

export function useMedicamentos(pacienteId: string) {
  return useQuery<Medicamento[]>({
    queryKey: ['medicamentos', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('nome');
      if (error) throw error;
      return data;
    },
    enabled: !!pacienteId,
  });
}

export function useCriarMedicamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: TablesInsert<'medicamentos'>) => {
      const { data, error } = await supabase.from('medicamentos').insert({
        ...form,
        datas_retirada: form.datas_retirada ?? [form.data_inicio],
        vezes_tomado: form.vezes_tomado ?? 0,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['medicamentos', v.paciente_id] }); toast.success('Medicamento adicionado!'); },
    onError: () => toast.error('Erro ao adicionar medicamento.'),
  });
}

export function useEditarMedicamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paciente_id, ...form }: TablesUpdate<'medicamentos'> & { id: string; paciente_id: string }) => {
      const { error } = await supabase.from('medicamentos').update(form).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['medicamentos', v.paciente_id] }); toast.success('Medicamento atualizado!'); },
    onError: () => toast.error('Erro ao atualizar medicamento.'),
  });
}

export function useExcluirMedicamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paciente_id }: { id: string; paciente_id: string }) => {
      const { error } = await supabase.from('medicamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['medicamentos', v.paciente_id] }); toast.success('Medicamento excluído!'); },
    onError: () => toast.error('Erro ao excluir medicamento.'),
  });
}

export function useAdicionarRetirada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paciente_id, novaData, datasAtuais, vezesAtual }: { id: string; paciente_id: string; novaData: string; datasAtuais: string[]; vezesAtual: number }) => {
      const { error } = await supabase.from('medicamentos').update({
        datas_retirada: [...datasAtuais, novaData],
        vezes_tomado: vezesAtual + 1,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['medicamentos', v.paciente_id] }); toast.success('Retirada registrada!'); },
    onError: () => toast.error('Erro ao registrar retirada.'),
  });
}
