---
title: Controle de Selos - Campanha de Selos PDV
tags: [projeto, selos, PDV]
---

# Controle de Selos - Campanha de Selos PDV

[[Query View]] de Controle de [[Selos]] de campanhas do [[PDV]] ([[Campanha de Selos]]). Gera alterações e extrai o relatório [Git](https://github.com/GiulianoGMS/DQL-Oracle/blob/main/SD_Controle%20de%20Selos%20-%20PDV.sql) (Utilizando a [[Procedure]] do quadro 4).

## Objetos

### Procedure de Atualização
[NAGP_UPD_CONTROLE_SELOS_PDV](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_UPD_CONTROLE_SELOS_PDV.prc) — Procedure que atualiza dados pela view.

### Procedure de Gravação
[NAGP_CONTROLE_SELOS_PDV_v2](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_CONTROLE_SELOS_PDV_v2.prc) — Procedure que grava os dados na tabela final (NAGT_CONTROLE_SELOS_PDV_v2).

### Log
Tabela de Log de Atualizações e Estornos: `NAGT_CONTROLE_SELOS_PDV_LOG`

## Regras de Atualização — NAGP_UPD_CONTROLE_SELOS_PDV

**Operações Possíveis:**
1. Ajuste
2. Estorno de Ajuste
3. Selo do Balcão

### 1. Ajustes
Ajustes são realizados na tabela final, considerando o limite de divergência entre Selo Inicial - Selo Final configurado no [[Parâmetro Dinâmico]] ([[PD]]) `DIV_MIN_CONTROLE_SELO`.

- **PD:** `DIV_MIN_CONTROLE_SELO`
- **Grupo:** `NAGUMO`
- Indica o valor mínimo divergente que permitirá alteração da tabela da campanha de selos pelas lojas.

### 2. Estornos
Ao efetuar um estorno, a coluna referenciada é retornada com os valores originais do select que alimenta a tabela, através da View `NAGV_CONTROLE_SELOS_PDV_V2`.

### 3. Selo do Balcão
A opção de Selo do Balcão faz um insert avulso na tabela base, considerando que não é lançado originalmente na operação.

## Nota Relacionada
[[Cadastro - Campanha de Selos PDV - Vinculação de Mix de Produtos em Campanhas]]
