---
Language:
  - "[[SQL]]"
Repository:
  - "[[DDL-Oracle]]"
Squads:
  - "[[Cadastro]]"
  - "[[TI]]"
System:
  - "[[PLSQL-Oracle]]"
Open Tags:
  - "[[Campanha de Selos]]"
  - "[[Selos]]"
  - "[[Cadastro de Produto]]"
Date:
Type: "[[Procedure]]"
Project:
tags:
---
**Contexto:** Para cada [[Campanha de Selos]] do [[PDV]], se faz necessário a vinculação de [[Produtos]] PARTICIPANTES e NÃO PARTICIPANTES na campanha criada no [[PDV]].

- **Participantes**: Todos os produtos que não estão classificados como "Excluídos de Campanhas" no cadastro do [[PLSQL-ERP-Consinco]], em [[Cadastro]] > [[Atributo Especial]] > Desc Especial. Estes produtos devem ser vinculados com o valor "S" na coluna "ATIVO".

- Não Participantes: Todos os produtos classificados como "Excluídos de Campanhas". Estes produtos devem ser vinculados com o valor "N" na coluna "ATIVO"

A [[Procedure]] [NAGP_CAMPANHA_SELOS_PDV](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/66feb5d8873fb54ea25ad7255bc552845af6a5c1/NAGP_CAMPANHA_SELOS_PDV.prc) , vinculado atualmente na campanha SEQSELO 261 é chamada no [[Job]] NAGJ_SELOS_261 e realiza este processo diariamente às 3h da manhã.

O Objeto realiza a vinculação por [[Campanha de Selos]] (SEQSELO).

Canva Relacionado: [[Controle de Selos - Campanha de Selos PDV.canvas]].