/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // Definir o Agente de IA Nativo da Clínica do Dr. Daniel Delgado
    $ai.agents.define(app, {
      slug: 'clinica-daniel-delgado',
      name: 'Assistente Clínica Dr. Daniel Delgado',
      description:
        'Assistente virtual especializado da clínica do Dr. Daniel Delgado (Cirurgião Vascular e Endovascular). Atende dúvidas de pacientes sobre procedimentos, convênios, preparo para exames e consultas, e permite consulta e gestão interna de agenda, pacientes e orçamentos.',
      systemPrompt:
        'Você é a assistente de inteligência artificial oficial da clínica do Dr. Daniel Delgado, renomado cirurgião vascular e angiologista. ' +
        'Suas funções principais: ' +
        '1. Dúvidas clínicas gerais: esclarecer de forma acolhedora, ética e clara sobre varizes, vasinhos (microvarizes), escleroterapia com espuma densa, laser transdérmico, cirurgia a laser / radiofrequência, ecodoppler vascular venoso e arterial, trombose venosa profunda e linfedema. Sempre reforçar que orientações não substituem avaliação médica presencial. ' +
        '2. Dados da clínica: quando solicitado por membros da equipe médica, consultar ou listar pacientes (collection patients), consultas e horários (collection appointments), orçamentos (collection budgets) e oportunidades/leads (collection leads). ' +
        '3. Cadastro de novos contatos/leads: ao atender um novo paciente ou solicitação de contato, registrar na collection leads com nome, telefone ou observações fornecidas. ' +
        '4. Tom de voz: profissional, empático, seguro e objetivo. Responda em Português do Brasil.',
      tier: 'fast',
      tools: [
        {
          collection: 'patients',
          perms: { list: true, read: true, create: true, update: true },
          actAs: 'admin',
        },
        {
          collection: 'appointments',
          perms: { list: true, read: true, create: true, update: true },
          actAs: 'admin',
        },
        {
          collection: 'budgets',
          perms: { list: true, read: true },
          actAs: 'admin',
        },
        {
          collection: 'leads',
          perms: { list: true, read: true, create: true, update: true },
          actAs: 'admin',
        },
      ],
      memory: [
        {
          type: 'faq',
          payload: {
            qa: [
              {
                question: 'Quais são os tratamentos oferecidos pelo Dr. Daniel Delgado?',
                answer:
                  'O Dr. Daniel Delgado é especialista em Cirurgia Vascular e Endovascular. Os tratamentos incluem: Escleroterapia convencional com glicose, Escleroterapia com Espuma Densa guiada por ultrassom, Laser Transdérmico (CLaCS), Endolaser (ablação térmica de veia safena por fibra óptica), Microcirurgia de varizes ambulatorial, Tratamento de trombose venosa e tratamento clínico de linfedema.',
              },
              {
                question: 'Quais são as orientações e preparo para o Ecodoppler Vascular?',
                answer:
                  'Para o Ecodoppler Venoso ou Arterial de membros inferiores não é necessário jejum absoluto; recomenda-se usar roupas confortáveis e fáceis de retirar (como shorts ou bermuda larga). Para Ecodoppler de Aorta Abdominal e Artérias Renais é necessário jejum prévio de 6 a 8 horas e uso de antiflatulento conforme prescrição.',
              },
              {
                question: 'Quais os horários de atendimento da clínica?',
                answer:
                  'Segunda a Sexta-feira, das 08h às 18h. Atendimentos em Juiz de Fora e unidades de Leopoldina e Além Paraíba mediante agendamento prévio.',
              },
              {
                question: 'Como funciona a recuperação da cirurgia de varizes a laser?',
                answer:
                  'A termoablação por endolaser é um procedimento minimamente invasivo, realizado com anestesia local ou sedação leve. O paciente recebe alta no mesmo dia e em 2 a 3 dias já pode retornar a atividades leves do cotidiano, com muito menos hematomas e dor do que a cirurgia tradicional.',
              },
            ],
          },
        },
        {
          type: 'text',
          payload: {
            text: 'Clínica Dr. Daniel Delgado - Cirurgia Vascular e Angiologia. Telefone/WhatsApp oficial: (32) 99131-5729. Atendimentos particulares e pelos principais convênios com reembolso orientado.',
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'clinica-daniel-delgado')
    } catch (_) {}
  },
)
