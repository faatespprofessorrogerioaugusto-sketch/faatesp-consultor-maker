import {
  Project,
  Client,
  SwotItem,
  GanttTask,
  Action5W2H,
  RiskItem,
  ParetoItem,
  OkrObjective,
  ClimateSurvey,
  ConsultingPlan,
  ConsultingPlanPhaseItem,
} from '../types';

export interface PlanGenerationContext {
  project: Project;
  client?: Client;
  swotItems?: SwotItem[];
  paretoItems?: ParetoItem[];
  risks?: RiskItem[];
  climateSurveys?: ClimateSurvey[];
  okrs?: OkrObjective[];
  ganttTasks?: GanttTask[];
  actions5W2H?: Action5W2H[];
  groupName?: string;
  consultantDefaultName?: string;
}

export function generatePlanForProject(ctx: PlanGenerationContext): ConsultingPlan {
  const {
    project,
    client,
    swotItems = [],
    paretoItems = [],
    risks = [],
    climateSurveys = [],
    okrs = [],
    ganttTasks = [],
    actions5W2H = [],
    groupName = 'Grupo de Consultoria',
    consultantDefaultName,
  } = ctx;

  const projSwot = swotItems.filter((s) => !s.projectId || s.projectId === project.id);
  const projPareto = paretoItems.filter((p) => !p.projectId || p.projectId === project.id);
  const projRisks = risks.filter((r) => !r.projectId || r.projectId === project.id);
  const projOkrs = okrs.filter((o) => !o.projectId || o.projectId === project.id);
  const projGantt = ganttTasks.filter((g) => !g.projectId || g.projectId === project.id);
  const projActions = actions5W2H.filter((a) => !a.projectId || a.projectId === project.id);
  const projClimate = climateSurveys.filter((c) => !c.projectId || c.projectId === project.id);

  // 1. Identificação
  const clientName = client?.name || project.clientName || 'Empresa Cliente S.A.';
  const clientContactPerson = client?.contactPerson || 'Representante Legal / Diretor';
  const clientRole = client?.role || 'Diretoria Executiva / Sponsor';
  const clientEmail = client?.email || '';
  const clientPhone = client?.phone || '';

  const allConsultantsList = [
    project.leadConsultant || consultantDefaultName || 'Consultor Líder',
    ...(project.team || []),
  ].filter(Boolean);
  const uniqueConsultants = Array.from(new Set(allConsultantsList));
  const consultants = uniqueConsultants.length > 0 
    ? uniqueConsultants.join(', ') 
    : 'Equipe de Consultores Especialistas';

  const elaborationDate = project.startDate || new Date().toISOString().split('T')[0];

  // 2. Descrição do Problema ou Oportunidade
  const paretoIssues = projPareto
    .sort((a, b) => (b.count * b.estimatedCost) - (a.count * a.estimatedCost))
    .slice(0, 3)
    .map((p) => `${p.description} (${p.count} ocorrências acumuladas, impacto estimado em R$ ${p.estimatedCost.toLocaleString('pt-BR')})`);

  const swotWeaknesses = projSwot
    .filter((s) => s.category === 'Fraquezas' || s.category === 'Ameaças')
    .slice(0, 3)
    .map((s) => `${s.factor}: ${s.description}`);

  let problemText = project.description || '';
  if (!problemText || problemText.length < 20) {
    problemText = `A organização identificou a necessidade de uma intervenção estruturada de consultoria visando superar gargalos operacionais, aprimorar a eficiência dos processos e alinhar a execução estratégica aos objetivos de crescimento sustentável do negócio.`;
  }

  const painPoints: string[] = [];
  if (paretoIssues.length > 0) {
    painPoints.push(...paretoIssues);
  }
  if (swotWeaknesses.length > 0) {
    painPoints.push(...swotWeaknesses);
  }
  if (painPoints.length === 0) {
    painPoints.push(
      'Desalinhamento entre o planejamento estratégico e a rotina operacional das equipes.',
      'Gargalos na padronização de processos críticos e baixa previsibilidade de indicadores de desempenho.',
      'Necessidade de capacitação da liderança e modernização dos rituais de governança.'
    );
  }

  const problemPerceptionContext =
    `O problema foi percebido a partir da constatação de perdas recorrentes de produtividade, divergências em indicadores de desempenho setoriais e manifestações da equipe diretiva sobre a necessidade de metodologia estruturada para governança e controle de resultados.`;

  // 3. Objetivos do Trabalho
  const objectives: string[] = [];
  if (project.mainObjective) {
    objectives.push(`Objetivo 1 (Geral): ${project.mainObjective}`);
  } else {
    objectives.push('Objetivo 1: Realizar diagnóstico empresarial aprofundado e reestruturar os fluxos operacionais críticos.');
  }

  if (projOkrs.length > 0) {
    projOkrs.slice(0, 3).forEach((okr, idx) => {
      const num = objectives.length + 1;
      const krsSummary = okr.keyResults?.map(kr => `${kr.title} (Meta: ${kr.targetValue} ${kr.unit})`).join('; ');
      objectives.push(`Objetivo ${num}: ${okr.title}${krsSummary ? ` — Resultados-chave: ${krsSummary}` : ''}`);
    });
  }

  while (objectives.length < 3) {
    const num = objectives.length + 1;
    if (num === 2) {
      objectives.push('Objetivo 2: Desenvolver e implantar planos de ação 5W2H e metas de OKRs para monitoramento contínuo dos resultados.');
    } else if (num === 3) {
      objectives.push('Objetivo 3: Mitigar riscos operacionais críticos e elevar o índice de engajamento e clima organizacional da equipe.');
    } else {
      objectives.push(`Objetivo ${num}: Consolidar governança executiva com entrega de relatórios e transferência de conhecimento.`);
    }
  }

  // 4. Metodologias e Ferramentas
  const activeTools: string[] = [
    'Análise SWOT (Forças, Oportunidades, Fraquezas e Ameaças)',
    'Diagrama de Pareto (Priorização 80/20 de causas e perdas)',
    'Matriz de Riscos (Probabilidade x Impacto e Planos de Contingência)',
    'Pesquisa de Clima Organizacional (Mapeamento de Engajamento e eNPS)',
    'OKRs (Objectives and Key Results)',
    'Diagrama de Gantt (Cronograma de Marcos e Fases)',
    'Plano de Ação 5W2H (Operacionalização das Iniciativas)',
    'Entrevistas Estruturadas & Análise Documental',
  ];

  const methodologiesAndTools = 
`Para a condução deste trabalho de consultoria, serão empregadas metodologias consagradas de diagnóstico, planejamento e acompanhamento:
1. Ferramentas de Diagnóstico: Aplicação da Análise SWOT para leitura do ambiente interno e externo; Diagrama de Pareto (Regra 80/20) para isolar as causas prioritárias de ineficiência; Matriz de Riscos para classificação de impactos e medidas preventivas; e Pesquisa de Clima Organizacional para apuração do eNPS e percepção dos colaboradores.
2. Ferramentas de Planejamento e Execução: Desdobramento das diretrizes estratégicas através de OKRs (Objectives and Key Results); estruturação do cronograma temporal e marcos críticos via Diagrama de Gantt; e detalhamento operacional de cada iniciativa por meio do Plano de Ação 5W2H (O que, Por que, Onde, Quando, Quem, Como e Quanto Custa).
3. Técnicas de Coleta de Dados: Entrevistas semiestruturadas com lideranças, questionários com colaboradores, observação direta in loco e análise documental de indicadores históricos.`;

  // 5. Cronograma das Fases do Processo
  const defaultPhases: ConsultingPlanPhaseItem[] = [
    {
      id: 'phase-1',
      stage: 'Primeiro contato e levantamento inicial',
      description: 'Reunião de alinhamento com a diretoria/sponsor, validação do escopo, coleta de documentação preliminar e pactuação de expectativas.',
      estimatedDeadline: '10 a 15 dias',
      responsibleRole: `${uniqueConsultants[0] || 'Consultor Líder'} / Sponsor Cliente`,
    },
    {
      id: 'phase-2',
      stage: 'Diagnóstico',
      description: 'Aplicação das ferramentas de diagnóstico (SWOT, Pareto, Matriz de Riscos e Clima Organizacional), entrevistas em profundidade e mapeamento das causas-raiz.',
      estimatedDeadline: '30 a 45 dias',
      responsibleRole: 'Equipe de Consultoria / Gestores de Área',
    },
    {
      id: 'phase-3',
      stage: 'Planejamento das ações',
      description: 'Construção dos OKRs estratégicos, elaboração da matriz detalhada de planos de ação 5W2H, dimensionamento de recursos e cronograma de Gantt.',
      estimatedDeadline: '20 a 30 dias',
      responsibleRole: `${uniqueConsultants[0] || 'Consultor Líder'} / Comitê de Gestão`,
    },
    {
      id: 'phase-4',
      stage: 'Implementação',
      description: 'Execução das iniciativas priorizadas no 5W2H, acompanhamento semanal de marcos, realização de treinamentos e mitigação de desvios operacionais.',
      estimatedDeadline: '60 a 90 dias',
      responsibleRole: 'Responsáveis pelas Ações (5W2H) / Consultores Facilitadores',
    },
    {
      id: 'phase-5',
      stage: 'Avaliação e encerramento',
      description: 'Medição do atingimento dos Key Results (OKRs), apuração do ROI e ganhos obtidos, apresentação executiva final e entrega do relatório consolidado.',
      estimatedDeadline: '15 a 20 dias',
      responsibleRole: `${uniqueConsultants[0] || 'Consultor Líder'} / Diretoria Executiva`,
    },
  ];

  // 6. Recursos Necessários
  const totalBudgetFormatted = project.budget 
    ? `R$ ${project.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : 'Conforme orçamento contratado';

  const humanResources = `• Consultores Responsáveis: ${consultants}.
• Equipe Interna do Cliente: Patrocinador (Sponsor), gestores dos departamentos envolvidos e pontos focais operacionais para fornecimento de dados e entrevistas.`;

  const materialTechResources = `• Plataforma de Gestão Consultor Prime (módulos SWOT, Pareto, Riscos, OKRs, Gantt e 5W2H).
• Infraestrutura para reuniões (físicas e virtuais), estações de trabalho e orçamento estimado do projeto de ${totalBudgetFormatted}.`;

  const dataAccessDocuments = `• Relatórios contábeis e de faturamento dos últimos 12 a 24 meses.
• Organograma atualizado, fluxogramas de processos vigentes e manuais operacionais.
• Relatórios de auditoria, histórico de indicadores de desempenho (KPIs) e políticas internas de gestão de pessoas.`;

  // 7. Indicadores de Sucesso
  const successIndicators: string[] = [];

  if (projOkrs.length > 0) {
    projOkrs.forEach((okr) => {
      okr.keyResults?.forEach((kr) => {
        if (successIndicators.length < 4) {
          successIndicators.push(`Indicador ${successIndicators.length + 1}: ${kr.title} — Meta: ${kr.targetValue} ${kr.unit}`);
        }
      });
    });
  }

  if (projRisks.length > 0 && successIndicators.length < 4) {
    const critCount = projRisks.filter(r => r.classification === 'Crítico' || r.classification === 'Alto').length;
    if (critCount > 0) {
      successIndicators.push(`Indicador ${successIndicators.length + 1}: Redução de 100% dos ${critCount} riscos classificados como Críticos/Altos através de planos de contingência validados.`);
    }
  }

  if (projClimate.length > 0 && successIndicators.length < 4) {
    successIndicators.push(`Indicador ${successIndicators.length + 1}: Atingimento de eNPS superior a +50 pontos na Pesquisa de Clima Organizacional pós-implementação.`);
  }

  if (projActions.length > 0 && successIndicators.length < 4) {
    successIndicators.push(`Indicador ${successIndicators.length + 1}: Conclusão de no mínimo 90% dos Planos de Ação 5W2H dentro dos prazos e custos planejados.`);
  }

  while (successIndicators.length < 2) {
    const idx = successIndicators.length + 1;
    if (idx === 1) {
      successIndicators.push('Indicador 1: Cumprimento de 100% do cronograma de etapas e entregas da consultoria.');
    } else {
      successIndicators.push('Indicador 2: Atingimento das metas financeiras e operacionais acordadas com a diretoria.');
    }
  }

  // 8. Observações Gerais
  const generalObservations = 
`1. Confidencialidade: Todas as informações financeiras, estratégicas e cadastrais compartilhadas durante a consultoria são estritamente confidenciais e protegidas por termo de sigilo mútuo.
2. Governança: Serão realizados comitês quinzenais de status report com o Sponsor do projeto para validação de entregas parciais e alinhamento de decisões.
3. Premissas: O cumprimento dos prazos estimados depende da tempestividade na disponibilização das informações e do engajamento dos responsáveis internos nomeados.
4. Ajustes de Escopo: Qualquer alteração nas fases ou no escopo original será formalizada previamente mediante aditivo aprovado por ambas as partes.`;

  return {
    id: `plan-${project.id}`,
    projectId: project.id,
    clientName,
    clientContactPerson,
    clientRole,
    clientEmail,
    clientPhone,
    consultants,
    groupName,
    elaborationDate,
    problemDescription: problemText,
    problemPerceptionContext,
    prioritizedPainPoints: painPoints,
    objectives,
    methodologiesAndTools,
    selectedToolsList: activeTools,
    phases: defaultPhases,
    humanResources,
    materialTechResources,
    dataAccessDocuments,
    successIndicators,
    generalObservations,
    status: 'aprovado',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
