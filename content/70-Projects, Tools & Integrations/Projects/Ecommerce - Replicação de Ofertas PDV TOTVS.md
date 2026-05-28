---
Language:
  - "[[SQL]]"
Repository:
  - "[[DDL-Oracle]]"
Squads:
  - "[[TI]]"
System:
  - "[[PLSQL-Oracle]]"
  - "[[PLSQL-ERP-Consinco]]"
Open Tags:
  - "[[Ecommerce]]"
  - "[[PDV]]"
  - "[[Remarca]]"
Date:
Type: "[[Procedure]]"
Project: "[[Ecommerce - Replicação de Ofertas PDV TOTVS]]"
tags:
  - Projects
---
### Visão Geral

Rotina criada durante a migração do [[PDV]] legado para o **[[PDV TOTVS]]**. Replica as [[Oferta|ofertas]] promocionais do parceiro de [[Ecommerce]] da tabela de [[Remarca]] (`NAGT_REMARCAPROMOCOES`) para as tabelas de [[Promoção]] do [[ERP]], tornando as [[Oferta|ofertas]] disponíveis para o [[PDV TOTVS]].

Pode ser executada manualmente passando um código de [[Promoção]] e/ou data específica, ou chamada por [[Job]] diário sem parâmetros — nesse caso processa todas as [[Promoção|promoções]] com início no dia corrente.

---

### Parâmetros

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `psCodPromocao` | NUMBER | NULL | Filtra uma [[Promoção]] específica. Se nulo, processa todas do dia |
| `psData` | DATE | NULL | Data de início das [[Promoção|promoções]] a processar. Se nulo, usa `SYSDATE` |

---

### Filtros de Origem (`NAGT_REMARCAPROMOCOES`)

| Campo | Valor | Descrição |
|-------|-------|-----------|
| `TIPODESCONTO` | `4` | Tipo de desconto de [[Ecommerce]] |
| `PROMOCAOLIVRE` | `0` | Apenas [[Promoção|promoções]] vinculadas (não livres) |
| `DTINICIO` | `SYSDATE` | [[Promoção|Promoções]] com início no dia |
| — | NOT EXISTS em `MFL_PROMOCAOPDV` | Evita duplicidade na replicação |

---

### Fluxo — 4 Loops Aninhados

**1. Loop Capa** → `MFL_PROMOCAOPDV`

Cria o cabeçalho da [[Promoção]] no [[ERP]]. Usa a sequence `S_SEQPROMOCPDV` para gerar o ID.

| Campo gravado | Valor |
|---------------|-------|
| `DESCRICAO` | `'MEU NAGUMO - ' \|\| CODPROMOCAO` |
| `STATUS` | `'I'` se período > 100 dias (inativa) · `'A'` caso contrário |
| `TIPOPROMOCAO` | `'I'` |
| `CODPARCEIRO` | `700` ([[Meu Nagumo]]) |
| `USUALTERACAO` | `'REP_AUTO'` |

**2. Loop Item** → `MFL_PROMOCPDVITEM`

Para cada produto da [[Promoção]], insere um item vinculado à capa. Resolve o produto via [[EAN]]: join com `MAP_PRODCODIGO` usando `LPAD(CODACESSO, 14, 0)`, `TIPCODIGO IN ('E','B')` e `QTDEMBALAGEM = 1`.

**3. Loop Item_Loja** → `MFL_PROMOCPDVDESCAPARTDE`

Insere o desconto por [[Loja]] com os preços calculados:

```
VLRDESCONTO  = PRECOVALIDNORMAL − PRECOPPROMOCIONAL
PERCDESCONTO = ((PRECOVALIDNORMAL − PRECOPPROMOCIONAL) / PRECOVALIDNORMAL) × 100
```

> Para produtos **pesáveis** (família com `PESAVEL = 'S'`): `QTDAPARTIRDE = 0.01`
> Para os demais: `QTDAPARTIRDE = 1`

Só replica [[Loja|lojas]] onde o preço promocional é **menor** que o preço normal vigente.

**4. Loop Empresa** → `MFL_PROMOCPDVEMP`

Vincula cada [[Loja]] participante da [[Promoção]] ao cabeçalho, com o mesmo `STATUS` da capa.

---

### Tabelas Envolvidas

| Tabela | Papel |
|--------|-------|
| `NAGT_REMARCAPROMOCOES` | Origem — dados de [[Remarca]] do parceiro [[Meu Nagumo]] |
| `MFL_PROMOCAOPDV` | Destino — cabeçalho da [[Promoção]] no [[PDV TOTVS]] |
| `MFL_PROMOCPDVITEM` | Destino — itens da [[Promoção]] |
| `MFL_PROMOCPDVDESCAPARTDE` | Destino — descontos e preços por [[Loja]] |
| `MFL_PROMOCPDVEMP` | Destino — [[Loja|lojas]] vinculadas à [[Promoção]] |
| `MAP_PRODCODIGO` | Resolução [[EAN]] → SeqProduto |
| `MRL_PRODEMPSEG` | Preço normal vigente por empresa/segmento |
| `MAP_FAMILIA` | Verificação de produto pesável |

---

### Links

- [Procedure — NAGP_REP_ECOMMERCE](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_REP_ECOMMERCE.prc)

---

### NAGP_ALT_PROMOC_ECOMM — Inativar ou Excluir Promoção Replicada

Procedimento complementar à `NAGP_REP_ECOMMERCE`. Permite inativar ou remover completamente uma [[Promoção]] de [[Ecommerce]] que já foi replicada para o [[ERP]].

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `psCodPromocao` | NUMBER | Código da [[Promoção]] a gerenciar (mesmo código da origem `NAGT_REMARCAPROMOCOES`) |
| `psComando` | VARCHAR2 | `'I'` = inativar · `'D'` = excluir completamente |

**Lógica:**

Localiza o `SEQPROMOCPDV` via `MFL_PROMOCAOPDV.DESCRICAO LIKE '%CODPROMOCAO%'`. Se encontrado:

| Comando | Ação |
|---------|------|
| `'I'` | `UPDATE MFL_PROMOCAOPDV SET STATUS = 'I'` — inativa a [[Promoção]] sem remover os dados |
| `'D'` | DELETE em cascata em todas as tabelas filhas, na ordem: `MFL_PROMOCPDVDESCAPARTDE` → `MFL_PROMOCPDVEMP` → `MFL_PROMOCPDVITEM` → `MFL_PROMOCPDVSEGMENTO` → `MFL_PROMOCAOPDV` |

> Se o código informado não existir no [[ERP]], a procedure não faz nada (sem erro).

- [Procedure — NAGP_ALT_PROMOC_ECOMM](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_ALT_PROMOC_ECOMM.prc).