-- SCRIPT PARA CRIAR AS TABELAS NO SUPABASE
-- Copie e cole este código no SQL Editor do seu projeto Supabase

-- 1. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME,
  telefone TEXT,
  duracao INTEGER DEFAULT 1,
  categoria TEXT,
  fidelizado BOOLEAN DEFAULT false,
  obs TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  itens JSONB NOT NULL,
  total_area DECIMAL DEFAULT 0,
  total_placas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Promissórias
CREATE TABLE IF NOT EXISTS promissorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  valor DECIMAL NOT NULL,
  data_vencimento DATE NOT NULL,
  descricao TEXT,
  lembrete_ativo BOOLEAN DEFAULT true,
  dias_aviso INTEGER DEFAULT 3,
  paga BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Contas a Pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor TEXT NOT NULL,
  valor DECIMAL NOT NULL,
  data_vencimento DATE NOT NULL,
  descricao TEXT,
  lembrete_ativo BOOLEAN DEFAULT true,
  dias_aviso INTEGER DEFAULT 3,
  paga BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Clientes Fidelizados
CREATE TABLE IF NOT EXISTS clientes_fidelizados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  categoria TEXT DEFAULT 'Fidelizado',
  notas TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabela de Agendamentos para Fidelizados (COM SUPORTE A RECORRÊNCIA MENSAL)
CREATE TABLE IF NOT EXISTS agendamentos_fidelizados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_fidelizado_id UUID REFERENCES clientes_fidelizados(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  hora_agendamento TIME NOT NULL,
  categoria TEXT,
  descricao TEXT,
  status TEXT DEFAULT 'agendado',
  recorrente BOOLEAN DEFAULT false,
  dia_do_mes INTEGER,
  meses_ate INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabela de Estoque
CREATE TABLE IF NOT EXISTS estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  quantidade INTEGER DEFAULT 0,
  quantidade_minima INTEGER DEFAULT 0,
  valor_unitario DECIMAL DEFAULT 0,
  alerta_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabela de Notas
CREATE TABLE IF NOT EXISTS notas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  tem_lembrete BOOLEAN DEFAULT false,
  data_lembrete DATE,
  hora_lembrete TIME,
  mensagem_whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Row Level Security) mas permitir acesso público para simplificar (Opcional)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos_agendamentos" ON agendamentos FOR ALL USING (true);

ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos_orcamentos" ON orcamentos FOR ALL USING (true);

ALTER TABLE promissorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos_promissorias" ON promissorias FOR ALL USING (true);

ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos_contas" ON contas_pagar FOR ALL USING (true);

ALTER TABLE clientes_fidelizados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos_clientes" ON clientes_fidelizados FOR ALL USING (true);

ALTER TABLE agendamentos_fidelizados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos_agend_fidel" ON agendamentos_fidelizados FOR ALL USING (true);

ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos_estoque" ON estoque FOR ALL USING (true);

ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para todos_notas" ON notas FOR ALL USING (true);
