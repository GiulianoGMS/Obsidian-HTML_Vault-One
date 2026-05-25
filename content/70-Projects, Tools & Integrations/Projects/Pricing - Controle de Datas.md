---
title: Pricing - Controle de Datas
tags: [projeto, pricing, etiqueta]
---

# Pricing - Controle de Datas

Desenvolvimento e migração do processo de [[Controle de Datas]] (Satelitsky) para o [[PLSQL-ERP-Consinco]].

## Etapas do Projeto

### 1. Integração de Dados
Necessário integrar os dados entre a aplicação antiga do banco Satelitsky ao ERP.

- [[Procedure]] [NAGP_REP_CONTROLEDATAS](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_REP_CONTROLEDATAS.prc)

### 2. Adequação do Layout de Etiqueta de Validade
Adequação e novo layout de [[Etiqueta de Validade]] dentro do ERP — parametrizar em [[Software de Integração]].

- [[View]] [MRLV_ETIQ_VALIDADE](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/MRLV_ETIQ_VALIDADE.sql)
- Alterar a view [MRLV_PROMOCAOESPECIAL](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/MRLV_PROMOCAOESPECIAL.sql) para popular devidamente o Grid de emissão de etiquetas na busca realizada pelos preços/produtos rebaixados.

![[Pricing - Controle de Validade - Layout Etiqueta.png]]

### 3. Integração com APP Gestão Lojas — Inserção de Produtos (Agrup/Atividades)

- [[Procedure]] [NAGP_REP_CONTROLEDATAS_APP](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_REP_CONTROLEDATAS_APP.prc)

### 3.2. Integração com APP Gestão Lojas — Inserção de Produtos (Avulsas)

- [[Procedure]] [NAGP_REP_CONTROLEDATAS_APPP_PROMOC](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_REP_CONTROLEDATAS_APP_PROMOC.prc)

### 4. APP — Geração de Promoções para Categoria FRIOS (Promoc Agrupada)

- [[Procedure]] [NAGP_REP_CONTROLEDATAS_APP_PROMOC_AGRUP](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_REP_CONTROLEDATAS_APP_PROMOC_AGRUP.prc)

### 5. Adequação da View de População de Produtos ao Grid de Emissão de Etiquetas

- [[View]] [MRLV_PROMOCAOESPECIAL](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/MRLV_PROMOCAOESPECIAL.sql)
