# FinanceFlow → Fricção Zero

Redesign completo do app para captura automatizada de despesas via foto, upload, e (mock) email, com extração por IA (Lovable AI / Gemini).

## O que muda

**Remover:** dashboard antigo, dívidas, metas, simulador. Manter auth e tabela `transactions` (evoluída).

**Novo schema `transactions`:**
- Adicionar: `establishment` (text), `status` ('confirmado'|'pendente_revisao'), `source` ('upload'|'camera'|'email'|'manual'), `ai_confidence` ('Alta'|'Média'|'Baixa'|null)
- Manter: id, user_id, amount, category, date, receipt_url, created_at
- Categorias fixas: Alimentação, Transporte, Lazer, Saúde, Contas Fixas, Outros

## Estrutura de rotas

```
/_authenticated/
  dashboard.tsx      → resumo mensal + gráfico categoria + últimas + alerta pendentes
  capture.tsx        → drag&drop + câmera + processamento IA + confirmação
  transactions.tsx   → lista completa com filtros e edição
  email-setup.tsx    → endereço fictício + tutorial Gmail/Outlook
  settings.tsx       → perfil + moeda (sem chave Gemini — usamos Lovable AI)
```

## IA (server-side, Lovable AI Gateway)

Server function `extractReceipt` em `src/lib/receipts.functions.ts`:
- Recebe imagem/PDF em base64 + mimeType
- Chama `google/gemini-3.5-flash` via AI SDK + Lovable Gateway
- Structured output com Zod: `{ establishment, amount, date, category, confidence }`
- Trata 429/402 com mensagens claras

## Email forwarding (UI + backend mock)

- Endereço exibido: `{user_id_short}@inbox.financeflow.app` (fictício, só UI)
- Rota pública `/api/public/inbound-email` (POST) preparada para receber payload tipo Postmark: valida HMAC (secret gerado), extrai anexos, chama mesma `extractReceipt`, insere como `status='pendente_revisao'`, `source='email'`
- Dashboard mostra banner de alerta quando há pendentes, com botões Confirmar / Editar / Excluir

## UI/Design

- Mobile-first, Tailwind, tokens semânticos existentes
- Componentes shadcn já presentes (Card, Button, Dialog, etc.)
- Recharts para pie chart de categorias
- Estados: skeleton "A IA está processando seu comprovante..." com spinner
- Card de confirmação pós-IA: mostra campos extraídos editáveis + badge de confiança

## Detalhes técnicos

**Migração SQL:**
```sql
ALTER TABLE transactions
  ADD COLUMN establishment text,
  ADD COLUMN status text NOT NULL DEFAULT 'confirmado',
  ADD COLUMN source text NOT NULL DEFAULT 'manual',
  ADD COLUMN ai_confidence text;
-- drop debts, goals (dados do usuário serão perdidos)
DROP TABLE debts;
DROP TABLE goals;
```

**Secrets:** `INBOUND_EMAIL_SECRET` gerado (HMAC do webhook). LOVABLE_API_KEY já existe.

**Bucket `receipts`:** já existe, políticas OK.

**Fluxo captura:**
1. Usuário arrasta arquivo / tira foto
2. Upload → bucket `receipts/{user_id}/{uuid}.ext`
3. Chama `extractReceipt({ receiptPath })` → server baixa via admin, envia p/ Gemini
4. Retorna JSON → mostra tela de confirmação editável
5. Salvar → INSERT transaction com `status='confirmado'`, `source='upload'|'camera'`

## Fora do escopo desta entrega
- Recebimento real de emails (requer provedor Postmark/Mailgun + domínio)
- Chave Gemini do usuário (usamos Lovable AI gratuito/gateway)
- Migrações de dados antigos de dívidas/metas

Ao aprovar, executo migração + rewrite das rotas + server function de IA + endpoint webhook em uma sequência.
