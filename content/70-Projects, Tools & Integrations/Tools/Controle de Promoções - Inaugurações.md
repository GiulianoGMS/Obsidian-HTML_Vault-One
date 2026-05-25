---
Language:
  - "[[SQL]]"
Repository:
  - "[[DDL-Oracle]]"
Squads:
  - "[[PDV]]"
  - "[[TI]]"
  - "[[Pricing]]"
System:
  - "[[PLSQL-Oracle]]"
Open Tags:
  - "[[Preço]]"
  - "[[Preço de Venda]]"
  - "[[Ofertas]]"
  - "[[Inauguração]]"
  - "[[Etiqueta]]"
Date: 2026-05-22
Type: "[[Procedure]]"
Project:
tags:
  - tools
---
Objeto para ajuste de ofertas nas inaugurações de lojas durante [[etiquetagem.]] das [[gondolas]]

**Duas necessidades:**

- **1.:** Inativar as [[Promoções]] que terminam ANTES da inauguração, para que as ofertas que não estarão vigentes não sejam impressas sem necessidade antes da data final.

- **2.:** Postergar o início das [[oferta]] para o dia anterior da [[inauguração]], para que as ofertas não sejam expostas antes, evitando assim vazamento de preços.

**Objeto**: [NAGP_CONTROLE_PROMOC_INAUGURACAO](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_CONTROLE_PROMOC_INAUGURACAO.prc).

**Chamada da Proc.: - Exemplo Loja 61, Inaugurando em 27/05/2026**
```sql
BEGIN
  NAGP_CONTROLE_PROMOC_INAUGURACAO(psNroEmpresa => 61
                                 , psDataAbertura => DATE '2026-05-27');
 END;
```
