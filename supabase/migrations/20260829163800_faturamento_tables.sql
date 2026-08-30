-- Criar tabela de Locais de Trabalho (workplaces)
CREATE TABLE workplaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  tax_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de Plantões (shifts)
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workplace_id UUID NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE workplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Políticas para workplaces
CREATE POLICY "Users can view their own workplaces"
ON workplaces FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workplaces"
ON workplaces FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workplaces"
ON workplaces FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workplaces"
ON workplaces FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para shifts
CREATE POLICY "Users can view their own shifts"
ON shifts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shifts"
ON shifts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shifts"
ON shifts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shifts"
ON shifts FOR DELETE
USING (auth.uid() = user_id);
