---
title: Gerador de Pedidos Ecommerce
tags: [ferramenta, ecommerce, pedidos, PDV]
---

# Gerador de Pedidos Ecommerce

Objeto para geração de pedidos de venda nas tabelas do EDI para integração com ERP/[[PDV]].

- **Package:** `NAGPKG_GERA_PEDVENDA` — [GitHub](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGPK_GERA_PEDVENDA.pkg)
- **Tabela auxiliar de itens:** `NAGT_BASE_PRODUTOS_PED`
- **Tabela de pedidos gerados:** `NAGT_PED_GERADO`

## Procedures da Package

| Procedure | Descrição |
|---|---|
| `INSERE_PROD_BASE_PEDVENDA` | Insere os itens na tabela base para geração dos pedidos |
| `GERA_PEDVENDA` | Gera os Pedidos na EDI |

## 1. Inclusão de Itens

### Insert Automático — INSERE_PROD_BASE_PEDVENDA

```sql
BEGIN
  NAGPKG_GERA_PEDVENDA.INSERE_PROD_BASE_PEDVENDA(pdNroEmpresa      => 61,
                                                 pdQtdLimiteItens  => 4000,
                                                 pdNroEmpBaseVenda => 8);
END;
```

Filtros aplicados automaticamente:
- Item **Ativo para Venda** na empresa informada
- Item com preço de venda normal maior que zero
- Apenas itens com finalidade **Revenda**
- Não componentes de Cesta Básica
- **`pdQtdLimiteItens`** — Quantidade de itens inseridos para geração
- **`pdNroEmpBaseVenda`** — Empresa base de venda (considera produtos vendidos nos últimos 90 dias)

### Insert Manual

```sql
INSERT INTO NAGT_BASE_PRODUTOS_PED (SEQPRODUTO, CODACESSO, PROCESSADO)
VALUES (5500, 789000000001, 'N')
```

> `PROCESSADO` deve ser `'N'` para que a rotina de geração considere a linha.

## 2. Geração de Pedidos — GERA_PEDVENDA

```sql
BEGIN
  NAGPKG_GERA_PEDVENDA.GERA_PEDVENDA(pdNroEmpresa   => 61,
                                     pdCPF          => 12345678910,
                                     pdQtdPorPedido => 100);
END;
```

Regras:
- Inclui itens da tabela auxiliar com `PROCESSADO = 'N'`
- Faz loop de pedidos quebrando pela quantidade de `pdQtdPorPedido` (default: 400)
- Após geração, grava número dos pedidos (AFV) e data em `NAGT_PED_GERADO`
- Se `pdCPF` for NULL, considera `'00000000191'`

## Exemplo Completo

Geração de 500 itens para empresa 61, quebra padrão de 400 por pedido:

```sql
BEGIN
  NAGPKG_GERA_PEDVENDA.INSERE_PROD_BASE_PEDVENDA(61, 500);
  NAGPKG_GERA_PEDVENDA.GERA_PEDVENDA(61);
END;
```

Validar itens não processados:
```sql
SELECT * FROM NAGT_BASE_PRODUTOS_PED WHERE PROCESSADO = 'N';
```

Pedidos gerados:
```sql
SELECT * FROM NAGT_PED_GERADO;
```

## Observações

> Por ser uma rotina de Ecommerce, o objeto gera pedidos na EDI e os mesmos são integrados pela rotina padrão do ERP com segmento ECOMMERCE. Pode ser necessário update no `nrosegmento` da `MAD_PEDVENDA`.

> Pode ocorrer erro de sequencial na execução devido à geração simultânea da rotina padrão de ecommerce. Basta executar novamente.
