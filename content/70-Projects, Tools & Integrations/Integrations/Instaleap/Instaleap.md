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
  - "[[IndUtilVenda]]"
Date:
Type: "[[Package]]"
Project: "[[Instaleap]]"
tags:
  - Integrations
---
### Visão Geral

Integração entre o ERP Consinco e a plataforma **Instaleap** (e-commerce Meu Nagumo). Exporta dados de catálogo de produtos (estoque, preço, status, cadastro completo) para a Instaleap via arquivos CSV gerados pelo Oracle `UTL_FILE`, gravados no diretório de banco `PLUSOFT`.

A sincronização é dividida em dois fluxos e três modalidades cada:

| Fluxo                                        | BASE (carga total)        | ALTERADOS (delta)              | NOVOS (delta)              |
| -------------------------------------------- | ------------------------- | ------------------------------ | -------------------------- |
| **Catálogo** (estoque/preço/status por loja) | `NAGV_IEAP_CATALOGO_BASE` | `NAGV_IEAP_CATALOGO_ALTERADOS` | `NAGV_IEAP_CATALOGO_NOVOS` |
| **Produto** (cadastro master)                | `NAGV_IEAP_PROD_BASE`     | `NAGV_IEAP_PROD_ALTERADOS`     | `NAGV_IEAP_PROD_NOVOS`     |

---

### Parâmetros Centralizados — NAGT_PARAMETROS_IEAP

Tabela de parâmetros que centraliza os filtros das views. Evita alterar cada view individualmente ao mudar uma regra.

| Coluna      | Tipo          | Descrição                |
| ----------- | ------------- | ------------------------ |
| `COD_PD`    | VARCHAR2(3)   | Código do parâmetro      |
| `PARAMETRO` | VARCHAR2(100) | Descrição do parâmetro   |
| `VALOR_PD`  | VARCHAR2(1)   | Valor aplicado (`S`/`N`) |

**Parâmetros conhecidos:**

| `COD_PD` | Efeito                                                                                   |
| -------- | ---------------------------------------------------------------------------------------- |
| `'E'`    | Controla se `NAGV_IEAP_PROD_BASE` filtra apenas produtos com `INDINTEGRAECOMMERCE = 'S'` |

---

### Fluxo Catálogo — Estoque, Preço e Status por Loja

Segmentos integrados: **5** e **8** (`NROSEGMENTO IN (5,8)`).

**Regras de estoque por categoria:**

| Categoria | Condição | Estoque enviado |
|-----------|----------|-----------------|
| HORTIFRUTI | Sem EAN cadastrado | `1000` (mascara estoque real) |
| AÇOUGUE / PADARIA | Presente em `NAGT_DEPARA_STOCK_IEAP` | `1000` (mascara estoque real) |
| Demais | — | `FC5ESTOQUEDISPONIVEL(SEQPRODUTO, NROEMPRESA)` |

> Na view `ALTERADOS`, o valor mascarado é `NULL` (em vez de `1000`) para não sobrescrever a Instaleap com dado fictício em sincronizações parciais.

**Produto ativo:** `STATUSVENDA = 'A'` **e** `INDINTEGRAECOMMERCE = 'S'`.
Excluída a categoria `SEQCATEGORIAN1 = 40054`.

---

### Fluxo Produto — Cadastro Master

Dados de produto enviados para a Instaleap:

| Campo Instaleap | Origem ERP |
|-----------------|------------|
| `NAME` | `MAP_PRODUTO.DESCCOMPLETA` |
| `SKU` | `MAP_PRODUTO.SEQPRODUTO` |
| `EAN` | `MAP_PRODCODIGO.CODACESSO` (TIPCODIGO `'E'`, QTDEMBALAGEM 1) |
| `PHOTOSURL` | `https://assetsmn.s3.us-east-1.amazonaws.com/assets/ofertas/{SKU}.jpg` |
| `UNIT` / `SUBUNIT` | `'KG'` se pesável · `'UN'` caso contrário |
| `CLICKMULTIPLIER` | Peso bruto (pesável) ou `1` (unidade) |
| `BRAND` | `MAP_MARCA.MARCA` |
| `DESCRIPTION` | `MAP_PRODUTO.NOMEPRODUTOECOMM` |
| `INGREDIENTS` | `MAP_PRODUTO.DESCCOMPOSICAO` |
| `RELATEDPRODUCTS` | `MAP_PRODUTO.SEQPRODUTOBASE` (produtos base vinculados) |
| `ISACTIVE` | `INDINTEGRAECOMMERCE = 'S'` → `'TRUE'` |
| Informações nutricionais | `MAP_INFNUTRICFAM` via `NAGV_INFNUTRIC_PIVOT` |

**Informações nutricionais enviadas:** Fibra alimentar, sódio, gorduras totais/saturadas/trans, proteínas, carboidratos, valor energético, açúcares totais/adicionados.

---

### Referência de Categorias — CategoryReference

Query auxiliar que lista a hierarquia de categorias (até 5 níveis) com os `SEQCATEGORIAN` correspondentes, usados como `CATEGORY_REFERENCE` na Instaleap. Fonte: `DIM_CATEGORIA@CONSINCODW` (DW).

A função `NAGF_CATEGORIA_IEAP(SEQFAMILIA)` resolve a categoria de uma família diretamente nas views de catálogo.

---

### Promoções — NAGV_IEAP_MENORPROMOCATIVA

Retorna o **menor preço promocional ativo** por SKU e loja. Usada para enviar o preço de promoção vigente à Instaleap, priorizando promoções ativas sobre as inativas de menor preço.

---

### Limite de Quantidade — NAGV_LIMITE_QTD_BLACK

View com limites máximos de quantidade por categoria para períodos especiais (Black Friday). Controla o campo `MAXQTD` enviado à Instaleap.

| Categoria          | Subcategoria                                 | `MAXQTD` |
| ------------------ | -------------------------------------------- | -------- |
| AÇOUGUE            | —                                            | 20       |
| HORTIFRUTI         | —                                            | 20       |
| BASICOS E MATINAIS | ACUCAR, AZEITE, CAFE, LEITE CONDENSADO, etc. | 20       |
| FRIOS E LATICINIOS | QUEIJOS, EMBUTIDOS, MARGARINA, MANTEIRA      | 20       |
| FRIOS E LATICINIOS | AVES NATALINAS                               | 50       |
| BEBIDAS            | CERVEJA                                      | 50       |
| LIMPEZA            | AGUA SANITARIA, DESIFETANTE                  | 20       |
| COMMODITIES        | —                                            | 20       |

---

### Exportação CSV — NAGP_IEAP_EXT_CATALOGO

Procedure que exporta o catálogo completo (`NAGV_IEAP_CATALOGO_BASE`) para CSV via `UTL_FILE`.

| Atributo           | Valor                                   |
| ------------------ | --------------------------------------- |
| Arquivo gerado     | `catalogos_instaleap.csv`               |
| Diretório Oracle   | `PLUSOFT`                               |
| Separador          | `;` (ponto e vírgula)                   |
| Colunas            | `PLU;LOJA;STATUS;ESTOQUE;PRECO`         |
| Hint de otimizador | `OPTIMIZER_FEATURES_ENABLE('11.2.0.4')` |

---

### Todos os Objetos

| Objeto                         | Tipo      | Descrição                                              |
| ------------------------------ | --------- | ------------------------------------------------------ |
| `NAGT_PARAMETROS_IEAP`         | Tabela    | Parâmetros centralizados das views                     |
| `NAGV_IEAP_CATALOGO_BASE`      | View      | Catálogo completo por loja (carga total)               |
| `NAGV_IEAP_CATALOGO_ALTERADOS` | View      | Catálogo — apenas itens alterados (delta)              |
| `NAGV_IEAP_CATALOGO_NOVOS`     | View      | Catálogo — apenas itens novos (delta)                  |
| `NAGV_IEAP_PROD_BASE`          | View      | Cadastro master de produtos (carga total)              |
| `NAGV_IEAP_PROD_ALTERADOS`     | View      | Produto — apenas alterados (delta)                     |
| `NAGV_IEAP_PROD_NOVOS`         | View      | Produto — apenas novos (delta)                         |
| `NAGV_IEAP_MENORPROMOCATIVA`   | View      | Menor preço promocional ativo por SKU/loja             |
| `NAGV_LIMITE_QTD_BLACK`        | View      | Limites de quantidade por categoria (Black Friday)     |
| `NAGP_IEAP_EXT_CATALOGO`       | Procedure | Exporta catálogo para CSV via UTL_FILE                 |
| `NAGF_CATEGORIA_IEAP`          | Function  | Resolve categoria da família para `CATEGORY_REFERENCE` |

---

### Links

- [Repositório — GiulianoGMS/Instaleap](https://github.com/GiulianoGMS/Instaleap)
- [NAGP_IEAP_EXT_CATALOGO](https://github.com/GiulianoGMS/Instaleap/blob/main/NAGP_IEAP_EXT_CATALOGO.prc)
- [NAGV_IEAP_CATALOGO_BASE](https://github.com/GiulianoGMS/Instaleap/blob/main/NAGV_IEAP_CATALOGO_BASE.sql)
- [NAGV_IEAP_PROD_BASE](https://github.com/GiulianoGMS/Instaleap/blob/main/NAGV_IEAP_PROD_BASE.sql)
- [NAGT_PARAMETROS_IEAP](https://github.com/GiulianoGMS/Instaleap/blob/main/NAGT_PARAMETROS_IEAP.sql)