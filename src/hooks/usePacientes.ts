import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type Paciente = {
  id: string;
  nome: string;
  contato?: string;
  data_nascimento?: string;
};

const API_URL = "http://localhost:3000";

export function usePacientes(busca?: string) {
  return useQuery<Paciente[]>({
    queryKey: ['pacientes', busca],
    queryFn: async () => {
      const url = busca && busca.trim()
        ? `${API_URL}/pacientes?busca=${encodeURIComponent(busca)}`
        : `${API_URL}/pacientes`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao buscar pacientes");
      return await res.json();
    },
  });
}

export function usePaciente(id: string) {
  return useQuery<Paciente>({
    queryKey: ['paciente', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/pacientes/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar paciente");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useCriarPaciente() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (form: any) => {
      const res = await fetch(`${API_URL}/pacientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao criar paciente");
      return await res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Paciente cadastrado com sucesso!');
    },
    onError: () => toast.error('Erro ao cadastrar paciente.'),
  });
}

export function useEditarPaciente() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...form }: any) => {
      const res = await fetch(`${API_URL}/pacientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao atualizar paciente");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Paciente atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar paciente.'),
  });
}

export function useExcluirPaciente() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/pacientes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir paciente");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Paciente excluído!');
    },
    onError: () => toast.error('Erro ao excluir paciente.'),
  });
}