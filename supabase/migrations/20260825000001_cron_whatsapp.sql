-- NOTA: Execute este script SQL no Editor de SQL do seu projeto no painel do Supabase.
-- Substitua [SEU_PROJECT_REF] e [SUA_ANON_KEY] pelos valores reais do seu projeto.

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove o job antigo se existir (desativado na primeira execução para não dar erro)
-- SELECT cron.unschedule('whatsapp_reminders_job');

-- Cria o job para rodar todos os dias as 08:00 (horário UTC, ajuste conforme necessário)
SELECT cron.schedule(
  'whatsapp_reminders_job',
  '0 11 * * *', -- 11:00 UTC = 08:00 BRT
  $$
    SELECT net.http_post(
      url:='https://[SEU_PROJECT_REF].supabase.co/functions/v1/whatsapp-reminders',
      headers:='{"Authorization": "Bearer [SUA_ANON_KEY]"}'::jsonb,
      body:='{}'::jsonb
    )
  $$
);
