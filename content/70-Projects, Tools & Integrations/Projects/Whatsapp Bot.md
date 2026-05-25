---
title: Whatsapp Bot
tags: [projeto, whatsapp, automação, monitoramento]
---

# Whatsapp Bot

Script de automação de alertas/reports via Whatsapp para monitoramento de rotinas internas como Jobs/Schedules automáticos, Cargas, monitoramento de PDV e outros.

Procedures com alertas de monitoramento salvas no [Git](https://github.com/GiulianoGMS/Oracle_Auto_Reports).

## Objetos Principais

| Objeto | Descrição |
|---|---|
| [NAGP_ENVIO_WHATS](https://github.com/GiulianoGMS/Oracle_Auto_Reports/blob/main/NAGP_ENVIO_WHATS.prc) | Procedure principal de envio |
| `NAGT_API_CALL_NUMBERS` | Tabela de Números, Grupos, Types e Keys |
| [NAGP_REG_ANSWER_WTS](https://github.com/GiulianoGMS/Oracle_Auto_Reports/blob/main/NAGP_REG_ANSWER_WTS.prc) | Gravação de mensagens do [[webhook]] |
| [NAGP_EXEC_COMMAND_WTS](https://github.com/GiulianoGMS/Oracle_Auto_Reports/blob/main/NAGP_EXEC_COMMAND_WTS.prc) | Execução de comandos |
| [NAGP_WTS_V2_RETURN_CM](https://github.com/GiulianoGMS/Oracle_Auto_Reports/blob/main/NAGP_WTS_V2_RETURN_CM.prc) | Retorno de execução de comandos |

## Alertas Disponíveis

- **Alertas [[BI]]** — Monitoramento de Vendas [[PDV]] e [[BI]]
- **Monitoramento [[PDV]]** — Erros, Falhas e Carga ([[MonitorPDV]])
- **Controle de Carga [[PDV]]**
- **Objetos Inválidos** — Monitoramento de rotina de visões do [[BI]]
- **Log de Jobs/Schedules**
- **[[Locks]] no Banco de Dados** [[PLSQL-Oracle]]

### Configuração dos Alertas de BI

Os alertas do BI ficam configurados na tabela `NAGT_CONTROLE_ATUALIZACAO_BI`. Quando `STATUS = 'A'`, a rotina pega a linha da visão e faz os cálculos entre tempo de atualização × tempo de registro. Se o tempo máximo (min) ultrapassar o configurado, envia o alerta.

## Execução de Comandos

Apenas números com permissão parametrizados na tabela `NAGT_API_CALL_NUMBERS` executam ações. Além disto, apenas objetos que começam com `NAG__`.

**Comandos úteis:**
- [NAGP_RECOMPILA_OBJ()](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/66feb5d8873fb54ea25ad7255bc552845af6a5c1/NAGP_RECOMPILA_OBJ.prc) — Recompila todos [[objetos inválidos]] no Banco [[PLSQL-Oracle]]
- [NAGP_KILL_SESSION](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/66feb5d8873fb54ea25ad7255bc552845af6a5c1/NAGP_KILL_SESSION.prc)(000,111,2) — Encerrar sessões. Variáveis: (Sid, Serial, Instancia)

## Como Obter o Group ID para Grupos

1. Obter o código/link de convite do grupo do WhatsApp. Exemplo: `Ba4nLE21m5GI3lNZVn9RWe`
2. Abrir a URL no navegador:
   ```
   http://api.textmebot.com/send.php?group_info=Ba4nLE21m5GI3lNZVn9RWe&text=teste&apikey=API_KEY
   ```
3. A resposta mostrará o `Group ID`:
   ```
   Result: Success!
   Group ID: 120363425596383592@g.us
   Subject: Nome do grupo
   ```
4. Na `NAGT_API_CALL_NUMBERS`, inserir na coluna `GROUP_ID`. As procedures passam a utilizar o `GROUP_ID` ao invés do `NROTELEFONE`.
