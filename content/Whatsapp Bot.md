---
Language:
  - "[[TypeScript]]"
Repository:
  - "[[meu-agente-ia]]"
Squads:
  - "[[TI]]"
System:
  - "[[Next.js]]"
Open Tags:
  - "[[WhatsApp]]"
  - "[[IA]]"
  - "[[Evolution API]]"
tags:
  - Projects
---

Agente de IA integrado ao WhatsApp via **Evolution API**, com painel web para testar, configurar e visualizar conversas. Suporta OpenAI GPT-4.1-mini e Groq como provedores de IA.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2.5 — App Router, `output: "standalone"` |
| UI | React 19.2.4 + Tailwind CSS v4 |
| Linguagem | TypeScript 5 |
| Banco | SQLite via Prisma — `better-sqlite3` em dev, `@libsql/client` em produção |
| IA | OpenAI SDK — modelo `gpt-4.1-mini` (padrão) |
| IA alternativa | Groq — `llama-3.3-70b-versatile` — compatível com SDK OpenAI sem dependência extra |
| WhatsApp | Evolution API — webhook `messages.upsert` |
| Auth | Cookie `agent_session` httpOnly 7 dias (sem NextAuth) |
| Deploy | Docker multi-stage → Easypanel, volume persistente `/app/data` |

---

## Fluxo de Mensagens

```
WhatsApp → Evolution API
                ↓ POST /api/webhook (sem auth)
    Filtra: fromMe=true · grupos @g.us · allowedPhones
                ↓
    Busca ou cria Conversation (source: "whatsapp", phone)
                ↓
    Salva Message (role: "user")
    Busca histórico (últimas historyLimit mensagens)
                ↓
    generateResponse(histórico, systemPrompt, temperature, maxTokens, config)
                ↓
    Salva Message (role: "assistant", tokens)
                ↓
    sendWhatsAppMessage → Evolution API → WhatsApp
```

---

## API Routes

| Rota | Método | Auth | Função |
|------|--------|------|--------|
| `/api/auth` | POST | — | Login — compara com `ADMIN_PASSWORD`; seta cookie |
| `/api/auth` | DELETE | cookie | Logout — zera cookie |
| `/api/config` | GET | cookie | Retorna `AgentConfig` (cria padrão se não existir) |
| `/api/config` | PUT | cookie | Upsert de todos os campos da `AgentConfig` |
| `/api/chat` | GET | cookie | Lista conversas `source: "chat"` com mensagens |
| `/api/chat` | POST | cookie | Envia mensagem de teste; cria conversa se necessário |
| `/api/conversations` | GET | cookie | Conversas WhatsApp; filtro opcional `?phone=` |
| `/api/webhook` | POST | — | Recebe eventos da Evolution API |

---

## Provedores de IA

| Provedor | baseURL | Modelo padrão | Fallback de key |
|----------|---------|--------------|-----------------|
| OpenAI | SDK padrão | `gpt-4.1-mini` | `OPENAI_API_KEY` do env se campo vazio no config |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | — |

---

## Configurações (`AgentConfig`)

| Campo | Padrão | Descrição |
|-------|--------|-----------|
| `name` | `Assistente IA` | Nome exibido no painel |
| `systemPrompt` | — | Instrução de sistema enviada ao modelo |
| `temperature` | `0.7` | Criatividade (0–2) |
| `maxTokens` | `1024` | Limite de tokens por resposta |
| `historyLimit` | `10` | Mensagens anteriores enviadas ao modelo |
| `enabled` | `true` | Liga/desliga o agente |
| `allowedPhones` | `""` | CSV de números autorizados (vazio = todos) |
| `evolutionUrl` | `""` | URL base da Evolution API |
| `evolutionApiKey` | `""` | API Key da instância |
| `instanceId` | `""` | ID da instância WhatsApp |
| `aiProvider` | `openai` | `"openai"` ou `"groq"` |

---

## Painel Web

| Página | Rota | Função |
|--------|------|--------|
| Chat de Teste | `/` | Conversa com o agente; `conversationId` persistido em `localStorage` |
| Configurações | `/config` | Edição completa dos parâmetros + toggle de provedor; URL do webhook com botão copiar |
| Conversas WA | `/conversations` | Visualização das conversas reais do WhatsApp com busca por número |

---

## Deploy (Easypanel)

1. Serviço **App** conectado ao GitHub (branch `main`) — build via Dockerfile detectado automaticamente
2. Volume persistente no container path `/app/data` — banco SQLite sobrevive a redeploys
3. Variáveis obrigatórias: `OPENAI_API_KEY`, `ADMIN_PASSWORD`, `NEXTAUTH_SECRET`
4. Porta: `3000`
5. Webhook URL: `https://seudominio.com/api/webhook` → configurar na Evolution API com evento `messages.upsert`