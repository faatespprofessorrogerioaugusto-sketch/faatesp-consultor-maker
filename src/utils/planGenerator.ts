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

  // Strict filter: only items strictly belonging to this project
  const projSwot = swotItems.filter((s) => s.projectId === project.id);
  const projPareto = paretoItems.filter((p) => p.projectId === project.id);
  const projRisks = risks.filter((r) => r.projectId === project.id);
  const projOkrs = okrs.filter((o) => o.projectId === project.id);
  const projGantt = ganttTasks.filter((g) => g.projectId === project.id);
  const projActions = actions5W2H.filter((a) => a.projectId === project.id);
  const projClimate = climateSurveys.filter((c) => c.projectId === project.id);

  // 1. Identificação
  const clientName = client?.name || project.clientName || '';
  const clientContactPerson = client?.contactPerson || '';
  const clientRole = client?.role || '';
  const clientEmail = client?.email || '';
  const clientPhone = client?.phone || '';

  const allConsultantsList = [
    project.leadConsultant || consultantDefaultName,
    ...(project.team || []),
  ].filter(Boolean);
  const uniqueConsultants = Array.from(new Set(allConsultantsList));
  const consultants = uniqueConsultants.length > 0 
    ? uniqueConsultants.join(', ') 
    : 'Consultores Responsáveis';

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

  const problemText = project.description || 'Descrever a situação e desafios diagnosticados na empresa.';

  const painPoints: string[] = [];
  if (paretoIssues.length > 0) {
    painPoints.push(...paretoIssues);
  }
  if (swotWeaknesses.length > 0) {
    painPoints.push(...swotWeaknesses);
  }

  const problemPerceptionContext = painPoints.length > 0
    ? `Identificado a partir das ferramentas de diagnóstico aplicadas (Pareto e Análise SWOT do projeto).`
    : '';

  // 3. Objetivos do Trabalho
  const objectives: string[] = [];
  if (project.mainObjective) {
    objectives.push(project.mainObjective);
  }

  if (projOkrs.length > 0) {
    projOkrs.forEach((okr) => {
      const krsSummary = okr.keyResults?.map(kr => `${kr.title} (Meta: ${kr.targetValue} ${kr.unit})`).join('; ');
      objectives.push(`${okr.title}${krsSummary ? ` — Resultados-chave: ${krsSummary}` : ''}`);
    });
  }

  if (objectives.length === 0) {
    objectives.push('Definir os objetivos específicos e metas da consultoria.');
  }

  // 4. Metodologias e Ferramentas
  const activeTools: string[] = [];
  if (projSwot.length > 0) activeTools.push('Análise SWOT');
  if (projPareto.length > 0) activeTools.push('Diagrama de Pareto (80/20)');
  if (projRisks.length > 0) activeTools.push('Matriz de Riscos');
  if (projClimate.length > 0) activeTools.push('Pesquisa de Clima Organizacional');
  if (projOkrs.length > 0) activeTools.push('OKRs (Objectives & Key Results)');
  if (projGantt.length > 0) activeTools.push('Diagrama de Gantt');
  if (projActions.length > 0) activeTools.push('Plano de Ação 5W2H');

  let methodologiesAndTools = 
`Para a condução deste trabalho de consultoria, serão empregadas metodologias de diagnóstico, planejamento e acompanhamento:
1. Ferramentas de Diagnóstico: Análise SWOT, Diagrama de Pareto, Matriz de Riscos e Pesquisa de Clima Organizacional.
2. Ferramentas de Planejamento e Execução: OKRs (Objectives and Key Results), Diagrama de Gantt e Planos de Ação 5W2H.
3. Técnicas de Coleta de Dados: Entrevistas semiestruturadas com lideranças, questionários com colaboradores e análise documental.`;

  // 5. Cronograma das Fases do Processo
  const defaultPhases: ConsultingPlanPhaseItem[] = [
    {
      id: 'phase-1',
      stage: 'Primeiro contato e levantamento inicial',
      description: 'Reunião de alinhamento de escopo, coleta de documentação preliminar e pactuação de expectativas.',
      estimatedDeadline: '10 a 15 dias',
      responsibleRole: `${uniqueConsultants[0] || 'Consultor Líder'} / Sponsor Cliente`,
    },
    {
      id: 'phase-2',
      stage: 'Diagnóstico',
      description: 'Aplicação das ferramentas de diagnóstico (SWOT, Pareto, Matriz de Riscos e Clima), entrevistas e mapeamento das causas-raiz.',
      estimatedDeadline: '30 a 45 dias',
      responsibleRole: 'Equipe de Consultoria / Gestores de Área',
    },
    {
      id: 'phase-3',
      stage: 'Planejamento das ações',
      description: 'Construção dos OKRs estratégicos, elaboração da matriz 5W2H, dimensionamento de recursos e cronograma.',
      estimatedDeadline: '20 a 30 dias',
      responsibleRole: `${uniqueConsultants[0] || 'Consultor Líder'} / Comitê de Gestão`,
    },
    {
      id: 'phase-4',
      stage: 'Implementação',
      description: 'Execução das iniciativas priorizadas no 5W2H, acompanhamento periódico de marcos e capacitação.',
      estimatedDeadline: '60 a 90 dias',
      responsibleRole: 'Responsáveis pelas Ações / Consultores Facilitadores',
    },
    {
      id: 'phase-5',
      stage: 'Avaliação e encerramento',
      description: 'Medição do atingimento dos Key Results (OKRs), apuração de ganhos, apresentação executiva e entrega do relatório final.',
      estimatedDeadline: '15 a 20 dias',
      responsibleRole: `${uniqueConsultants[0] || 'Consultor Líder'} / Diretoria Executiva`,
    },
  ];

  // 6. Recursos Necessários
  const totalBudgetFormatted = project.budget 
    ? `R$ ${project.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : 'A definir no orçamento contratado';

  const humanResources = `• Consultores Responsáveis: ${consultants}.
• Equipe Interna do Cliente: Sponsor do projeto e gestores das áreas envolvidas.`;

  const materialTechResources = `• Plataforma de Gestão Consultor Prime.
• Orçamento previsto para o projeto: ${totalBudgetFormatted}.`;

  const dataAccessDocuments = `• Relatórios operacionais, organograma e documentos internos pertinentes ao escopo do projeto.`;

  // 7. Indicadores de Sucesso
  const successIndicators: string[] = [];

  if (projOkrs.length > 0) {
    projOkrs.forEach((okr) => {
      okr.keyResults?.forEach((kr) => {
        successIndicators.push(`${kr.title} — Meta: ${kr.targetValue} ${kr.unit}`);
      });
    });
  }

  if (projRisks.length > 0) {
    const critCount = projRisks.filter(r => r.classification === 'Crítico' || r.classification === 'Alto').length;
    if (critCount > 0) {
      successIndicators.push(`Mitigação dos ${critCount} riscos críticos/altos identificados na Matriz de Riscos.`);
    }
  }

  if (projClimate.length > 0) {
    successIndicators.push(`Atingimento de índice positivo de engajamento e eNPS na Pesquisa de Clima Organizacional.`);
  }

  if (projActions.length > 0) {
    successIndicators.push(`Execução de 100% das ações priorizadas no Plano de Ação 5W2H.`);
  }

  if (successIndicators.length === 0) {
    successIndicators.push('Cumprimento de 100% das metas e prazos pactuados no escopo do projeto.');
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
