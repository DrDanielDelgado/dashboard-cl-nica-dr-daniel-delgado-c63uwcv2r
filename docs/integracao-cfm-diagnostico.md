# Diagnóstico Técnico e Regulatório: Integração com a Prescrição Eletrônica do CFM

**Projeto:** Dashboard Clínica Dr. Daniel Delgado  
**Data da Avaliação:** Março / 2026  
**Estratégia Adotada:** Estratégia B — Acesso Direcionado Seguro (Target `_blank`, `rel="noopener,noreferrer"`)  
**Responsável:** Equipe de Engenharia Clínica & Segurança da Informação

---

## 1. Contexto e Objetivos

O Dr. Daniel Delgado necessita emitir receitas médicas, atestados e relatórios em conformidade com as exigências sanitárias do Conselho Federal de Medicina (CFM) e da Agência Nacional de Vigilância Sanitária (Anvisa).

Este documento formaliza o diagnóstico das opções técnicas de integração com a plataforma oficial de Prescrição Eletrônica do CFM (`https://prescricao.cfm.org.br`), detalhando as decisões tomadas, o que foi comprovado, as limitações identificadas e as recomendações futuras.

---

## 2. O que foi CONFIRMADO (Fontes Oficiais)

A análise da infraestrutura pública do CFM e das normas vigentes confirmou os seguintes pontos:

1. **Inexistência de API Pública para Clínicas e Consultórios:**
   - A plataforma `https://prescricao.cfm.org.br/login` não dispõe de documentação de API pública, catálogo de endpoints REST ou programa aberto para que desenvolvedores de software médico de consultórios individuais emitam receitas via integração machine-to-machine.
   - O login é unificado ao **Portal de Serviços do CFM** exigindo:
     - CRM / UF + CPF + senha do portal; OU
     - Certificado Digital no padrão ICP-Brasil (Certillion, BirdID, token físico A1/A3).

2. **Parcerias Existentes são Formais e Institucionais (CFM ↔ Fornecedor):**
   - As integrações observadas no ecossistema do CFM (ex.: _Informed by Manole_, _InterDrugs_) decorrem de convênios formais e acordos bilaterais de cooperação técnica com o CFM, não de uma API aberta a desenvolvedores terceiros.
   - **Fonte:** [Notícia Oficial CFM - Integração Manole e InterDrugs](https://portal.cfm.org.br/noticias/cfm-oferece-aos-medicos-acesso-a-plataforma-com-informacoes-tecnicas-e-cientificas)

3. **Arquitetura da API do SNCR / Anvisa (RDC nº 1.000/2025):**
   - O Sistema Nacional de Controle de Receituários (SNCR) é gerenciado pela Anvisa. A integração por API do SNCR ocorre entre as **plataformas de prescrição eletrônica homologadas e a Anvisa** (ex.: CFM ↔ Anvisa, Memed ↔ Anvisa), e **NÃO** entre consultórios individuais e a Anvisa.
   - **Fonte oficial CFM:** [Orientação CFM sobre RDC 1.000/2025](https://prescricaoeletronica.cfm.org.br/rdc-1000.html)
     > _"Para emitir receita eletrônica de controlados, o sistema precisa estar integrado ao SNCR por API."_ — Trata-se de requisito que a plataforma de prescrição (neste caso, a do CFM) cumpre para permitir a rastreabilidade nas farmácias.

4. **Regras Sanitárias da RDC 1.000/2025 (Prazos e Tipos de Assinatura):**
   - **Documento Nato-Digital Obrigatório:** Fotos, scans ou cópias digitalizadas de receitas físicas em papel não têm validade legal como receituário eletrônico.
   - **Assinatura Qualificada ICP-Brasil:** Obrigatória para Notificações de Receita A (amarela), B (azul) e Receita de Controle Especial (branca em 2 vias).
   - **Assinatura Avançada (Gov.br prata/ouro):** Aceita para receituários de medicamentos sujeitos a retenção básica (RDC 471/21).
   - **Prazo Limite SNCR:** 30 de setembro de 2026 para implementação plena das funcionalidades eletrônicas pelas plataformas.

---

## 3. Avaliação das Estratégias Consideradas

| Estratégia                                    | Descrição                                                                                                 |      Viabilidade      | Motivo do Descarte / Adoção                                                                                                                                                                                       |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :-------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. API Oficial Direta**                     | Integração via chamadas REST para gerar e assinar receita dentro do nosso dashboard                       |    **Descartada**     | **Inexistência de API pública** disponibilizada pelo CFM para clínicas privadas.                                                                                                                                  |
| **B. Acesso Direcionado Seguro**              | Botão seguro que abre `https://prescricao.cfm.org.br` em nova aba com auditoria leve e lembrete de CRM/UF |      **ADOTADA**      | **Conforme com CFM e LGPD**, sem trânsito de dados de saúde no servidor e sem risco de violação de termos de uso.                                                                                                 |
| **C. Automação de Navegador (RPA/Puppeteer)** | Robô que simula login com CPF/senha do médico e preenche campos automaticamente                           |    **Descartada**     | **Alto risco regulatório e de segurança**: não há autorização nos termos do CFM; violação em potencial de mecanismos de proteção (CAPTCHA, MFA, ICP-Brasil); risco de descarte/bloqueio de credenciais do médico. |
| **D. Integração Direta com SNCR/Anvisa**      | Conexão direta do nosso ERP com a API do Ministério da Saúde / Anvisa                                     | **Referência Futura** | A API do SNCR é destinada a plataformas mantenedoras de receituários eletrônicos completos. Como usamos a plataforma oficial do próprio CFM, este já provê a integração SNCR.                                     |

---

## 4. O que NÃO foi possível confirmar

1. **Existência de Programa de Desenvolvedores / Parceria Privada:**
   - Não foi possível comprovar se o CFM possui edital, termo de credenciamento ou formulário público para que prontuários eletrônicos de terceiros se credenciem como emissores parceiros homologados.
2. **Termos de Uso Específicos sobre Automação:**
   - O portal não disponibiliza um contrato de termos de uso que autorize expressamente ferramentas de scraping ou automação headless de sessões autenticadas. Pelo princípio da precaução e pelas diretrizes de segurança da informação (ISO 27001 / CFM), qualquer automação não expressamente autorizada foi sumariamente descartada.

---

## 5. Arquitetura da Solução Implementada (Estratégia B)

1. **Abertura Segura em Nova Aba:**
   - O médico clica em "Abrir Prescrição Eletrônica do CFM". A URL oficial `https://prescricao.cfm.org.br/` é aberta com atributos `target="_blank"` e `rel="noopener noreferrer"`.
   - A autenticação permanece 100% sob os controles do Portal de Serviços do CFM.
2. **Lembrete de CRM/UF:**
   - Campo cadastrado no perfil do usuário no PocketBase (`crm_numero` e `crm_uf`).
   - NUNCA solicita nem armazena senhas, CPFs em texto ou dados de certificados digitais.
3. **Auditoria Leve:**
   - Cada abertura registra data/hora na coleção `integration_access_logs` e no campo `last_cfm_access` do usuário.
   - Nenhum dado clínico, CID ou medicamento transita ou é registrado no nosso banco de dados.
4. **Fluxo de Contingência (Fallback):**
   - Instruções detalhadas para acesso alternativo via Portal de Serviços (`https://servicos.cfm.org.br`);
   - Link direto para o canal oficial de atendimento: `https://sistemas.cfm.org.br/contatoprescricaoeletronica/br`.

---

## 6. Pendências e Próximos Passos (Para Contato com o CFM)

Caso a clínica deseje estreitar a integração tecnológica futuramente, recomenda-se encaminhar os seguintes questionamentos formais ao CFM via canal de suporte:

1. **Programa de Parceria:** _O CFM possui plano de abertura de API REST para prontuários eletrônicos de clínicas médicas emitirem receitas assinadas via token de integração?_
2. **Autenticação Federada (SSO):** _Existe previsão de suporte a OAuth2/OIDC médico via Portal de Serviços do CFM?_
3. **Validação de Assinatura:** _Há endpoint público para consulta e verificação de receitas emitidas no portal a partir do código do documento?_

---

_Documento arquivado no repositório do Dashboard Clínica Dr. Daniel Delgado para fins de governança e auditoria técnica._
