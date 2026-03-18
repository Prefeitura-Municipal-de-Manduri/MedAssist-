import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Paciente = Tables<'pacientes'>;

export function usePacientes(busca?: string) {
  return useQuery<Paciente[]>({
    queryKey: ['pacientes', busca],
    queryFn: async () => {
      let query = supabase.from('pacientes').select('*').order('nome');
      if (busca && busca.trim()) {
        query = query.ilike('nome', `%${busca.trim()}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function usePaciente(id: string) {
  return useQuery<Paciente>({
    queryKey: ['paciente', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('pacientes').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCriarPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: TablesInsert<'pacientes'>) => {
      const { data, error } = await supabase.from('pacientes').insert(form).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pacientes'] }); toast.success('Paciente cadastrado com sucesso!'); },
    onError: () => toast.error('Erro ao cadastrar paciente.'),
  });
}

export function useEditarPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...form }: TablesUpdate<'pacientes'> & { id: string }) => {
      const { error } = await supabase.from('pacientes').update(form).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pacientes'] }); toast.success('Paciente atualizado!'); },
    onError: () => toast.error('Erro ao atualizar paciente.'),
  });
}

export function useExcluirPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pacientes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pacientes'] }); toast.success('Paciente excluído!'); },
    onError: () => toast.error('Erro ao excluir paciente.'),
  });
}
