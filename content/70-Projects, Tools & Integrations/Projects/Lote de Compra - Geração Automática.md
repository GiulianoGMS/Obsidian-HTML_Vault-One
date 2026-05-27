---
Language:
  - "[[SQL]]"
Repository:
  - "[[DDL-Oracle]]"
Squads:
  - "[[Compras]]"
System:
  - "[[PLSQL-Oracle]]"
  - "[[PLSQL-ERP-Consinco]]"
Open Tags:
  - "[[Lote de Compras]]"
  - "[[Job]]"
  - "[[E-mail]]"
Date:
Type: "[[Package]]"
Project: Lote de Compra - Geração Automática
tags:
  - Projects
---
### Visão Geral

Processo de **geração automática de lotes de compra** de acordo com configurações e cálculos de prazos. A rotina identifica quais fornecedores/itens devem ter lotes criados no dia, cria os lotes no ERP, recalcula a sugestão de compra conforme parametrização e registra logs — com envio automático de e-mail em caso de erro ou sucesso.

---
### Objetos

| Objeto | Tipo | Descrição |
|--------|------|-----------|
| `NAGT_CONTROLELOTECOMPRA` | Tabela | Controle dos lotes e configurações de prazo |
| `NAGF_BUSCAULTDTAPEDIDO` | Function | Calcula as datas de geração com base na última data de pedido |
| `NAGV_BUSCADTAPEDIDO` | View | Retorna os lotes e horários pendentes de criação no dia, incluindo `FORMACALC` |
| `NAGP_GERALOTECOMPRA_v2` | Procedure | Versão atual: cria os lotes, desabilita agendamento dos modelos e chama recálculo de sugestão |
| `NAGPKG_SUGESTAO_COMPRA` | Package | Calcula e atualiza a sugestão de compra por produto/empresa após a geração do lote |
| `NAGP_EMAILAUTO_LOTECOMPRAS` | Procedure | Aviso por e-mail um dia antes das gerações de lote |

---

### Fluxo

1. `NAGF_BUSCAULTDTAPEDIDO` calcula a data esperada de geração por fornecedor/configuração
2. `NAGV_BUSCADTAPEDIDO` consolida os lotes pendentes com horário e parâmetro `FORMACALC`
3. `NAGP_GERALOTECOMPRA_v2` itera sobre a view:
   - Desabilita o agendamento dos lotes modelo que serão gerados
   - Cria cada lote via `NAGP_spMac_GeraLoteCompra`
   - Se `FORMACALC` estiver preenchido, chama `NAGPKG_SUGESTAO_COMPRA.NAGP_ATUALIZA_SUGESTAO` para recalcular a sugestão
   - Envia e-mail HTML de sucesso com número e fornecedor do lote
4. Em caso de erro, grava log em `NAGT_LOGGERALOTEAUTO` e envia e-mail de falha
5. `NAGP_EMAILAUTO_LOTECOMPRAS` roda um dia antes como aviso prévio aos compradores

---

### NAGPKG_SUGESTAO_COMPRA

Package responsável pelo cálculo e atualização da sugestão de compra, acionada automaticamente pela `NAGP_GERALOTECOMPRA_v2` após a criação de cada lote.

| Objeto | Tipo | Descrição |
|--------|------|-----------|
| `NAGF_CALC_SUGEST_COMPRA` | Function | Calcula a sugestão por produto/empresa com base em estoque, média de venda, estoque mín/máx e previsão |
| `NAGP_ATUALIZA_SUGESTAO` | Procedure | Aplica o recálculo no lote gerado conforme o parâmetro `FORMACALC` |
| `NAGP_RATEIA_ACRESC_SUGEST` | Procedure | Rateia incrementos de sugestão entre lojas |

**Modos de cálculo (`FORMACALC`):**

| Código | Descrição |
|--------|-----------|
| `QP` | Arredonda compra final no CD sem alterar lojas |
| `AP` | Arredonda no CD conforme % de proximidade de LASTRO ou PALETE |
| `AL` | Arredonda nas lojas conforme % de proximidade de LASTRO ou PALETE |
| `AC` | Arredonda nas lojas conforme parâmetros configurados |
| `CA` | Cálculo MIN/MAX interno Nagumo — arredonda CD (altera lojas e CD) |
| `CN` | Cálculo MIN/MAX interno Nagumo — sem arredondar no CD (altera lojas e CD) |

---

### Cálculo MIN MAX Interno (NAGF_CALC_SUGEST_COMPRA)

Função desenvolvida internamente pelo Nagumo para calcular a sugestão de compra por produto/empresa. Utilizada pelos modos `CA` e `CN`.

**Parâmetros de entrada:**

| Parâmetro | Descrição |
|-----------|-----------|
| `pdSeqFornecedor` | Fornecedor — usado para buscar o prazo médio de atraso |
| `pdNroEmpresa` | Empresa de referência (loja ou CD) |
| `pdSeqProduto` | Produto |
| `pdPeriodoCalc` | Período de cálculo em dias (configurado na capa do lote) |
| `pdIndTipoMedVda` | Tipo de média: `N` = geral · `P` = promoção · `E` = fora promoção |
| `pdConsEmpAbast` | `S/N` — considera estoque da empresa abastecedora no cálculo das lojas |
| `pdTipoRetorno` | `S` = sugestão limitada · `T` = necessidade total bruta |

**Fórmula:**

Para cada empresa vinculada ao lote, a função projeta o estoque ao fim do período de reposição:

```
Previsão de Estoque = Estoque Atual − (Média Diária × Dias do Período)
```

O período de projeção vai de `SYSDATE` até `SYSDATE + pdPeriodoCalc + DiasAtrasoFornecedor − 1`, absorvendo o prazo médio de entrega do fornecedor.

Com base na previsão, calcula a necessidade de compra e aplica os limites MIN/MAX configurados por produto/empresa (`MRL_PRODUTOEMPRESA.ESTQMINIMODV` / `ESTQMAXIMODV`):

```
Necessidade   = EstqMin − Previsão de Estoque
Sugestão Loja = MIN(Necessidade, EstqMax)        ← limitada ao máximo
Sugestão CD   = MAX(0, Necessidade − EstqMax)    ← excedente que o CD abastece
```

**Retorno por tipo de empresa e modo:**

| Empresa | `pdTipoRetorno = 'S'` | `pdTipoRetorno = 'T'` |
|---------|-----------------------|-----------------------|
| Loja    | Sugestão até o limite do `EstqMax` | Necessidade total bruta |
| CD      | Excedente que ultrapassa o `EstqMax` das lojas | Necessidade total bruta |

> **Diferença entre CA e CN:** ambos executam o mesmo cálculo MIN/MAX e atualizam lojas + CD. A diferença é que `CA` arredonda a compra final do CD para o múltiplo de embalagem, enquanto `CN` mantém o valor exato calculado.

---

### Links

- [Tabela — NAGT_CONTROLELOTECOMPRA](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGT_CONTROLELOTECOMPRA)
- [Function — NAGF_BUSCAULTDTAPEDIDO](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGF_BUSCAULTDTAPEDIDO.sql)
- [View — NAGV_BUSCADTAPEDIDO](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGV_BUSCADTAPEDIDO.sql)
- [Procedure — NAGP_GERALOTECOMPRA_v2](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGP_GERALOTECOMPRA_v2.prc)
- [Package — NAGPKG_SUGESTAO_COMPRA](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGPKG_SUGESTAO_COMPRA.pck)
- [Procedure — NAGP_EMAILAUTO_LOTECOMPRAS](https://github.com/Giulianogms/Procedures_Views_Functions/blob/main/NAGP_EMAILAUTO_LOTECOMPRAS)
- [Projeto no GitHub](https://github.com/users/GiulianoGMS/projects/3)