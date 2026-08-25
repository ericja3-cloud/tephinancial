-- Adiciona colunas para configuração de alertas via WhatsApp (CallMeBot)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS whatsapp_alerts boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS callmebot_apikey text;
