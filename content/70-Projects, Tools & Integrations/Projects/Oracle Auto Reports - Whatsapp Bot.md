---
Language:
  - "[[SQL]]"
Repository:
  - "[[Oracle_Auto_Reports]]"
Squads:
  - "[[TI]]"
System:
  - "[[PLSQL-Oracle]]"
Open Tags:
  - "[[WhatsApp]]"
  - "[[Monitoramento]]"
  - "[[Alertas]]"
Type: "[[Procedure]]"
tags:
  - Projects
---

[Repositório no GitHub →](https://github.com/GiulianoGMS/Oracle_Auto_Reports)

Sistema de **monitoramento automático do banco Oracle** com envio de alertas e execução de comandos via WhatsApp, usando a API TextMeBot + UTL_HTTP.

---

## Arquitetura

```
NAGP_ENVIO_WHATS  (JOB agendado)
├── Grupo ALL     → 8 procedures de alerta
├── Grupo PDV     → 3 procedures de carga PDV
├── Grupo ESP/SD  → job failures direcionados
├── Grupo BI      → alertas de visões BI
├── Grupo GSD     → grupos WA (carga PDV, exportação, BI)
└── Grupo CFG     → alertas de serviço interrompido
```

**API de envio:** TextMeBot (`http://api.textmebot.com/send.php`)
**Método:** `UTL_HTTP.REQUEST` via GET com parâmetros URL-encoded
**Anti-spam:** `DBMS_SESSION.SLEEP(10)` entre cada mensagem enviada

---

## Objetos

### Orquestrador

| Procedure | Descrição |
|-----------|-----------|
| `NAGP_ENVIO_WHATS` | Procedure principal chamada pelo JOB. Itera sobre `NAGT_API_CALL_NUMBERS` e dispara os alertas conforme o TYPE do destinatário |

### Alertas (prefixo `NAGP_WTS_V2_`)

| Procedure | Trigger | Fonte |
|-----------|---------|-------|
| `NAGP_WTS_V2_INVALIDOBJECTS` | Objetos inválidos no banco | `NAGV_INVALID_OBJECTS` + `NAGV_INVALID_OBJECTS_DW` (PROD e DW/BI) |
| `NAGP_WTS_V2_JOB_RUNFAILURES` | Jobs falhados nos últimos 10 min | `ALL_SCHEDULER_JOB_RUN_DETAILS` |
| `NAGP_WTS_V2_JOB_RUNFAILURES_ESP` | Jobs falhados direcionados por destinatário específico | `ALL_SCHEDULER_JOB_RUN_DETAILS` ← `NAGT_WTS_SCHED_DIR_CONTROL` |
| `NAGP_WTS_V2_LOCKS` | Sessions bloqueadas por > 10 min (600 s) | `GV$SESSION` — exibe bloqueada e bloqueadora com hint para `NAGP_KILL_SESSION` |
| `NAGP_WTS_V2_TB_LOGDBERRO` | Erros de banco registrados no Monitor PDV | `MONITORPDV.TB_LOGDBERRO` |
| `NAGP_WTS_V2_TB_LOGFALHACARGAMONITOR` | Falhas de carga do Monitor PDV | `MONITORPDV.TB_LOGFALHACARGAMONITOR` |
| `NAGP_WTS_V2_CONTROLECARGA_PDV` | Falhas de carga PDV (status 3 e 4 em `TB_PRODPRECO`) | `MONITORPDV.TB_CONTROLECARGAPDV` — agrupa por loja e checkout |
| `NAGP_WTS_V2_STATUS_EXP_INT_PDV` | Exportação de documentos PDV atrasada > 5 min (horário 07–21h) | `NAGV_STATUS_EXP_INT_PDV_v2` + `CONSINCO.VENDAS_PDV` + `@BI` (valor de venda comparado) |
| `NAGP_WTS_V2_ALERTAS_BI` | Visão Qlik Sense desatualizada além do threshold configurado por visão na tabela | `NAGT_CONTROLE_ATUALIZACAO_BI` — threshold variável por `VISAO` |
| `NAGP_WTS_V2_ALERTAS_BOT_DOWN` | Serviço de captura de dados interrompido (sem registro recente) | `NAGT_CONTROLE_ATUALIZACAO_BI` — DTAREGISTRO atrasado além de `MIN_TMP_REGISTRO` por visão |

### Bidirecional — Execução de Comandos via WhatsApp

| Procedure | Função |
|-----------|--------|
| `NAGP_REG_ANSWER_WTS` | Registra mensagem recebida do WhatsApp em `NAGT_ANSWERS_WTS` (`INDPROCESSADO = 'N'`) |
| `NAGP_EXEC_COMMAND_WTS` | Lê fila, extrai padrão `NAGP_*(...)` ou `NAGJ_*` via regex, executa via `EXECUTE IMMEDIATE`; loga e chama `NAGP_WTS_V2_RETURN_CM` |
| `NAGP_WTS_V2_RETURN_CM` | Envia confirmação de execução (sucesso ou erro SQLERRM) para os números do grupo ALL |

---

## Grupos de Destinatários (`NAGT_API_CALL_NUMBERS.TYPE`)

| Tipo | Alertas recebidos |
|------|-------------------|
| `ALL` | Objetos inválidos · job failures · locks · erros DB · falhas de carga · última carga monitor · exportação PDV · bot down |
| `PDV` | Erros DB · falhas de carga · última carga monitor (somente PDV) |
| `ESP` / `SD` | Job failures direcionados mapeados em `NAGT_WTS_SCHED_DIR_CONTROL` |
| `BI` | Alertas de visões Qlik Sense desatualizadas |
| `GSD` | Grupos WA: controle de carga PDV + exportação + alertas BI |
| `CFG` | Apenas alertas de serviço interrompido (bot down) |

> `PERM_CMD = 'S'` habilita execução de comandos remotos para o número cadastrado.

---

## Segurança na Execução de Comandos

- Regex extrai apenas padrões `NAGP_[A-Z0-9_]+\([^)]*\)` ou `NAGJ_[A-Z0-9_]+` — outros textos são ignorados
- Jobs (`NAGJ_`) executados via `DBMS_SCHEDULER.RUN_JOB`, procedures via `EXECUTE IMMEDIATE 'BEGIN ... END'`
- Erros capturados em `WHEN OTHERS THEN` e devolvidos ao solicitante como mensagem de retorno
- Log completo em `NAGT_ANSWERS_WTS_LOG` (comando · data · status · ID)

---

## Tabelas de Suporte

| Tabela | Uso |
|--------|-----|
| `NAGT_API_CALL_NUMBERS` | Destinatários: `NROTELEFONE`, `APIKEY`, `GROUP_ID`, `TYPE`, `STATUS`, `PERM_CMD` |
| `NAGT_ANSWERS_WTS` | Fila de mensagens recebidas; `INDPROCESSADO` controla o processamento |
| `NAGT_ANSWERS_WTS_LOG` | Histórico de comandos executados remotamente |
| `NAGT_WTS_SCHED_DIR_CONTROL` | Mapeamento JOB_NAME → TYPE para alertas direcionados (ESP/SD) |
| `NAGT_CONTROLE_ATUALIZACAO_BI` | Configuração e controle por visão BI — ver detalhes abaixo |

---

## Regras de Alerta — `NAGT_CONTROLE_ATUALIZACAO_BI`

Tabela central que configura **individualmente por visão** quais alertas devem ser disparados e com quais thresholds. Cada linha representa uma visão monitorada.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `VISAO` | VARCHAR2 | Nome da visão/processo monitorado (ex: `Vendas`, `Estoque`) |
| `DTAREGISTRO` | DATE | Último instante em que o serviço de captura registrou dados |
| `DTAATUALIZACAO_BI` | DATE | Último instante em que a visão foi efetivamente atualizada no BI |
| `STATUS_ALERTA` | VARCHAR2 | `'A'` = monitoramento ativo; outro valor = desativado |
| `MIN_TMP_REGISTRO` | NUMBER | Threshold em minutos para detectar **serviço interrompido** (`ALERTAS_BOT_DOWN`) |

### Lógica dos dois alertas

**`NAGP_WTS_V2_ALERTAS_BI`** — detecta dado desatualizado no BI enquanto o serviço ainda está rodando:
```
DTAREGISTRO recente (últimos 10 min)       → serviço de captura está ativo
DTAATUALIZACAO_BI defasada além do limite  → mas o dado do BI não foi atualizado
STATUS_ALERTA = 'A'
```
> O threshold de atraso aceitável para `DTAATUALIZACAO_BI` é configurado **por linha da tabela** — visões mais críticas podem ter um limite menor do que visões menos sensíveis.

**`NAGP_WTS_V2_ALERTAS_BOT_DOWN`** — detecta que o serviço de captura parou de registrar:
```
DTAREGISTRO atrasado além de MIN_TMP_REGISTRO minutos  → serviço não está respondendo
STATUS_ALERTA = 'A'
```
> `MIN_TMP_REGISTRO` é lido diretamente da linha (`X.MIN_TMP_REGISTRO`), portanto cada visão tem sua própria tolerância configurada.