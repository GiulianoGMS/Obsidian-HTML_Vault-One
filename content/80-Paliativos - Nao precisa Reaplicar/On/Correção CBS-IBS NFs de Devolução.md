---
Language:
  - "[[SQL]]"
Repository:
  - "[[DDL-Oracle]]"
Squads:
  - "[[TI]]"
  - "[[Recebimento]]"
System:
  - "[[PLSQL-Oracle]]"
Open Tags:
  - "[[NFe]]"
  - "[[Devolução]]"
Date:
Type: "[[Procedure]]"
Project:
tags:
  - Paliativos
---
**Contexto:** Paliativos para correção de rejeições em emissões de [[NFe]] de [[Devolução]]

**Situações e Paliativos:**

**1. Rejeição: Valor CBS/IBS divergente do calculado**
- Sistema não calcula a redução de aliquota, quando existe.
- Objeto: [NAGP_PALIATIVO_CBS_IBS_DEV_RED](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_PALIATIVO_CBS_IBS_DEV_RED.prc)
- Função: Recalcula o imposto considerando a aliquota de redução do item
- [[Job]]: NAGJ_PALIAT_DEV_RED_CBSIBS
- Depende do [[PD]] DEV_CGO_CORRIGE_IBSCBS
- PD: Lista de [[CGO]]s que realiza a correcao dos campos de impostos [[CBS]]/[[IBS]] nas op de devolucoes (Correcao para reducao de aliq)

**2. Rejeição: Valor "1" [[cClasstrib]] incoerente com a tag. Necessário 6 dígitos.**
- Objeto: [NAGP_PALIATIVO_CBS_IBS_DEV_RED](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_PALIATIVO_CBS_IBS_DEV_RED.prc)
- Função: Faz LPAD no cClasstrib considerando o valor original
- [[Job]]: NAGJ_PALIAT_DEV_RED_CBSIBS
- Depende do [[PD]] DEV_CGO_CORRIGE_IBSCBS
- PD: Lista de [[CGO]]s que realiza a correcao dos campos de impostos [[CBS]]/[[IBS]] nas op de devolucoes (Correcao para reducao de aliq)

**3. Rejeição: Valor Total CBS/IBS Divergente do Somatório dos Itens**
- Objeto: [NAGP_PALIATIVO_CBS_IBS_TOT](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_PALIATIVO_CBS_IBS_DEV_TOT.prc)
- [[Job]]: NAGJ_PALIAT_DEV_RED_CBSIBS
- Função: Inativa a [[NT]] da loja, reenvia a [[NFe]] e ativa a NT novamente
- (NT 2025002)

**Tabela de Log e Controle**

O reenvio através dos paliativos fica registrado na [[tabela]] NAGT_PALIAT_DEV. A mesma também é validada nas procedures para evitar reprocessamento indevido das [[NFe]]s.