---
Language:
  - "[[SQL]]"
Repository:
  - "[[DDL-Oracle]]"
Squads:
  - "[[Compras]]"
System:
  - "[[PLSQL-Oracle]]"
  - "[[PLSQL-ERP-Consinco]]"
Open Tags:
  - "[[Lote de Compras]]"
  - "[[Job]]"
  - "[[E-mail]]"
Date:
Type: "[[Procedure]]"
Project: "[[Lote de Compra - Geração Automática Form]]"
tags:
  - Projects
---

## Visão Geral

Processo de **geração automática de lotes de compra** de acordo com configurações e cálculos de prazos. A rotina identifica quais fornecedores/itens devem ter lotes criados no dia, cria os lotes no ERP e registra logs de execução — com envio automático de e-mail em caso de erro ou sucesso.

---

## Objetos

| Objeto | Tipo | Descrição |
|--------|------|-----------|
| `NAGT_CONTROLELOTECOMPRA` | Tabela | Tabela de controle dos lotes e configurações de prazo |
| `NAGF_BUSCAULTDTAPEDIDO` | Function | Calcula as datas de geração dos lotes com base na última data de pedido |
| `NAGV_BUSCADTAPEDIDO` | View | Retorna os lotes e horários de geração para consumo da procedure |
| `NAGP_GERALOTECOMPRA` | Procedure | Executa a criação dos lotes e aplica alterações nos lotes modelo |
| `NAGP_EMAILAUTO_LOTECOMPRAS` | Procedure | Rotina de aviso por e-mail um dia antes das gerações de lote |

---

## Fluxo

1. `NAGF_BUSCAULTDTAPEDIDO` calcula a data esperada de geração por fornecedor/configuração
2. `NAGV_BUSCADTAPEDIDO` consolida os lotes pendentes de criação no dia
3. `NAGP_GERALOTECOMPRA` itera sobre a view, cria os lotes no ERP e atualiza os lotes modelo
4. Logs gravados na mesma tabela de AA — e-mail disparado em caso de erro ou sucesso
5. `NAGP_EMAILAUTO_LOTECOMPRAS` roda um dia antes como aviso prévio aos compradores

---

## Links

- [Tabela — NAGT_CONTROLELOTECOMPRA](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGT_CONTROLELOTECOMPRA)
- [Function — NAGF_BUSCAULTDTAPEDIDO](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGF_BUSCAULTDTAPEDIDO.sql)
- [View — NAGV_BUSCADTAPEDIDO](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGV_BUSCADTAPEDIDO.sql)
- [Procedure — NAGP_GERALOTECOMPRA](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGP_GERALOTECOMPRA)
- [Procedure — NAGP_EMAILAUTO_LOTECOMPRAS](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGP_EMAILAUTO_LOTECOMPRAS)
- [Projeto no GitHub](https://github.com/users/GiulianoGMS/projects/3)
