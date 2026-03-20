import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type Medicamento = {
  id: string;
  paciente_id: string;
  nome: string;
  data_inicio: string;
  data_validade?: string;
  vezes_tomado?: number;
  datas_retirada?: string[];
};

const API_URL = "http://localhost:3000";

export function useMedicamentos(pacienteId: string) {
  return useQuery<Medicamento[]>({
    queryKey: ['medicamentos', pacienteId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/medicamentos/${pacienteId}`);
      if (!res.ok) throw new Error("Erro ao buscar medicamentos");
      return await res.json();
    },
    enabled: !!pacienteId,
  });
}

export function useCriarMedicamento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (form: any) => {
      const res = await fetch(`${API_URL}/medicamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          datas_retirada: form.datas_retirada ?? [form.data_inicio],
          vezes_tomado: form.vezes_tomado ?? 0,
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar medicamento");
      return await res.json();
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['medicamentos', v.paciente_id] });
      toast.success('Medicamento adicionado!');
    },
    onError: () => toast.error('Erro ao adicionar medicamento.'),
  });
}

export function useEditarMedicamento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, paciente_id, ...form }: any) => {
      const res = await fetch(`${API_URL}/medicamentos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao atualizar medicamento");
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['medicamentos', v.paciente_id] });
      toast.success('Medicamento atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar medicamento.'),
  });
}

export function useExcluirMedicamento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, paciente_id }: any) => {
      const res = await fetch(`${API_URL}/medicamentos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir medicamento");
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['medicamentos', v.paciente_id] });
      toast.success('Medicamento excluído!');
    },
    onError: () => toast.error('Erro ao excluir medicamento.'),
  });
}

export function useAdicionarRetirada() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, paciente_id, novaData, datasAtuais, vezesAtual }: any) => {
      const res = await fetch(`${API_URL}/medicamentos/${id}/retirada`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          novaData,
          datasAtuais,
          vezesAtual,
        }),
      });

      if (!res.ok) throw new Error("Erro ao registrar retirada");
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['medicamentos', v.paciente_id] });
      toast.success('Retirada registrada!');
    },
    onError: () => toast.error('Erro ao registrar retirada.'),
  });
}