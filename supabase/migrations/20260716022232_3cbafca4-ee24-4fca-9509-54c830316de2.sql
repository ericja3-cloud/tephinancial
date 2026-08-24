-- Drop unused feature tables
DROP TABLE IF EXISTS public.debts;
DROP TABLE IF EXISTS public.goals;

-- Evolve transactions for "Fricção Zero" capture
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS establishment text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'confirmado',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS ai_confidence text;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_status_check
    CHECK (status IN ('confirmado','pendente_revisao'));

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_source_check
    CHECK (source IN ('manual','upload','camera','email'));
