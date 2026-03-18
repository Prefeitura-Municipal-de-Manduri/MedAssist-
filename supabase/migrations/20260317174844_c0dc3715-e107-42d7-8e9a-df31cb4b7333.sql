
-- Tabela de pacientes
CREATE TABLE public.pacientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  contato TEXT,
  data_nascimento DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (sistema interno sem autenticação por enquanto)
CREATE POLICY "Acesso público de leitura pacientes" ON public.pacientes FOR SELECT USING (true);
CREATE POLICY "Acesso público de inserção pacientes" ON public.pacientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público de atualização pacientes" ON public.pacientes FOR UPDATE USING (true);
CREATE POLICY "Acesso público de exclusão pacientes" ON public.pacientes FOR DELETE USING (true);

-- Tabela de medicamentos
CREATE TABLE public.medicamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  datas_retirada DATE[] DEFAULT '{}',
  vezes_tomado INTEGER NOT NULL DEFAULT 0,
  data_validade DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público de leitura medicamentos" ON public.medicamentos FOR SELECT USING (true);
CREATE POLICY "Acesso público de inserção medicamentos" ON public.medicamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público de atualização medicamentos" ON public.medicamentos FOR UPDATE USING (true);
CREATE POLICY "Acesso público de exclusão medicamentos" ON public.medicamentos FOR DELETE USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medicamentos_updated_at BEFORE UPDATE ON public.medicamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Dados de exemplo
INSERT INTO public.pacientes (id, nome, contato, data_nascimento) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maria da Silva', '(11) 98765-4321', '1985-03-15'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'João Santos', '(21) 91234-5678', '1970-08-22'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Ana Oliveira', '(31) 99876-5432', '1995-12-01');

INSERT INTO public.medicamentos (paciente_id, nome, data_inicio, datas_retirada, vezes_tomado, data_validade) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Losartana 50mg', '2024-01-10', ARRAY['2024-01-10','2024-02-10']::DATE[], 2, '2025-12-31'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Metformina 850mg', '2024-03-01', ARRAY['2024-03-01']::DATE[], 1, '2024-06-30'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Omeprazol 20mg', '2024-02-15', ARRAY['2024-02-15','2024-03-15','2024-04-15']::DATE[], 3, '2026-01-15'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Paracetamol 750mg', '2024-06-01', ARRAY['2024-06-01']::DATE[], 1, '2025-08-20');
