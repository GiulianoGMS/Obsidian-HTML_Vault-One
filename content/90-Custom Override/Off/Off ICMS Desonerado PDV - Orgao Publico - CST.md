---
Language:
  - "[[SQL]]"
Repository:
  - "[[DDL-Oracle]]"
Squads:
  - "[[TI]]"
  - "[[PDV]]"
  - "[[Recebimento]]"
System:
  - "[[PLSQL-Oracle]]"
Open Tags:
  - "[[NFe]]"
  - "[[ICMS Desonerado]]"
  - "[[Desonerado]]"
Date:
Type: "[[Procedure]]"
Project:
tags:
  - Paliativos
---
**Contexto**
Procedimento paliativo que corrige a operação de emissão de desonerado à Orgao Publico pelo PDV (Painel Digital de Vendas), alterando o CST (Código da Situação Tributária) quando necessário.

**Objeto**
NAGP_PALIAT_ICMSDESON_PDV: um procedimento que corrige a operação de emissão de desonerado à Orgao Publico pelo PDV, alterando o CST para 040 quando VLRDESCICMS > 0 e Motivo Desoneração = 8 (Orgao Publico).

**Dependências**
O objeto depende do [[PD]] (Painel Digital) PDV_CGO_CORRIGE_DESON, que lista as [[CGO]]s (Código Geral de Operação) que corrige a operação de emissão de desonerado à Orgao Publico pelo PDV.

**Script**
O script verifica se VLRDESCICMS > 0, Motivo Desoneração = 8 e o CST está na lista do objeto. Se verdadeiro, altera o CST para 040.

```SQL
BEGIN
	NAGJ_PALIAT_ICMSDESON_NFPDV();
END;
```

Este script é chamado pelo Job NAGJ_PALIAT_ICMSDESON_NFPDV.

**Novas tags**
[[Paliativo]] [[CST]] [[Orgao Público]] [[PDV_CGO_CORRIGE_DESON]] [[Job]].