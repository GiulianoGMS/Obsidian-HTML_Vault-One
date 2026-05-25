---
title: Extração de XMLs - PDV
tags: [projeto, XML, PDV]
---

# Extração de XMLs - PDV

Rotina desenvolvida com a finalidade de extração dos [[XML]]s de venda do PDV para pastas mapeadas na rede, a fim de envio para o parceiro Itworks.

## Objetos

- **Procedure:** [NAGP_EXT_XML_PDV](https://github.com/GiulianoGMS/DDL-Objects-Oracle/blob/main/NAGP_EXT_XML_PDV.prc)
- **Job:** `NAGJ_EXT_XML_PDV`
- **Tabela de Log:** `NAGT_XML_EXTRAIDO`

## Configuração de Diretórios

É necessário que o diretório esteja criado no ambiente e apontado corretamente no [[PLSQL-Oracle]].

**Exemplos de diretórios (lojas 1 e 26):**

| DIRECTORY_NAME | DIRECTORY_PATH |
|---|---|
| EXT_XML_PDV_001 | /u02/dados/Ext_XMLs/Loja_001 |
| EXT_XML_PDV_026 | /u02/dados/Ext_XMLs/Loja_026 |

**Comando para criação de diretório:**
```sql
CREATE OR REPLACE DIRECTORY EXT_XML_PDV_061 AS '/u02/dados/Ext_XMLs/Loja_061';
```

> **Importante:** É obrigatório que antes da execução exista um **Diretório** configurado para a empresa que irá passar dentro do loop do [[Job]] ([[Directory]]).

## Chamada no Job

```sql
BEGIN
  FOR emp IN (SELECT NROEMPRESA LOJA FROM MAX_EMPRESA X WHERE NROEMPRESA < 61)
    LOOP
  NAGP_EXT_XML_PDV(psDtaIni     => TRUNC(SYSDATE) -5,
                   psDtaFim     => TRUNC(SYSDATE),
                   psNroEmpresa => emp.Loja,
                   indReproc    => 'N',
                   psChave      => NULL);
    END LOOP;
END;
```

## Variáveis

- **`indReproc`** — Indica se extrai o XML novamente. Se `N`, confere na tabela de log `NAGT_XML_EXTRAIDO` se já foi extraído e não faz nova extração. Default: `N`.
- **Período** — Na rotina, confere emissões dentro de 5 dias.
- **`psChave`** — É possível extrair determinado [[XML]]/[[NFe]] informando a [[Chave de Acesso]] da nota.
