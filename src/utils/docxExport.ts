import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak,
} from 'docx';
import {
  Project,
  Client,
  ConsultingContract,
  MeetingSimulation,
  BSCObjective,
  OKRObjective,
  SwotItem,
  IshikawaAnalysis,
  Action5W2H,
  GanttTask,
  RiskItem,
  ParetoItem,
  ClimateSurvey,
  AppSettings,
} from '../types';

export interface DocxExportParams {
  project: Project;
  client: Client | null;
  contract: ConsultingContract | null;
  meetings: MeetingSimulation[];
  bscObjectives: BSCObjective[];
  okrs: OKRObjective[];
  swotItems: SwotItem[];
  ishikawas: IshikawaAnalysis[];
  actions5w2h: Action5W2H[];
  ganttTasks: GanttTask[];
  risks: RiskItem[];
  pareto: ParetoItem[];
  climateSurveys: ClimateSurvey[];
  consultantNotes: string;
  recommendations: string;
  settings: AppSettings;
  includedModules: Record<string, boolean>;
  formatCurrency: (val: number) => string;
}

const PRIMARY_COLOR = '1E3A8A'; // Deep Corporate Navy
const SECONDARY_COLOR = '2563EB'; // Vibrant Blue
const TEXT_MUTED = '64748B'; // Slate 500
const HEADER_BG = 'F1F5F9'; // Slate 100
const ZEBRA_BG = 'F8FAFC'; // Slate 50
const BORDER_COLOR = 'CBD5E1'; // Slate 300

function createCell(
  text: string,
  options?: {
    bold?: boolean;
    fill?: string;
    widthPercent?: number;
    color?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    fontSize?: number;
  }
): TableCell {
  const {
    bold = false,
    fill,
    widthPercent,
    color,
    align = AlignmentType.LEFT,
    fontSize = 18, // 18 half-pts = 9pt
  } = options || {};

  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    shading: fill ? { fill } : undefined,
    margins: {
      top: 120, // ~6pt
      bottom: 120,
      left: 140,
      right: 140,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
    },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text,
            bold,
            color,
            size: fontSize,
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
}

function createSectionHeading(title: string, subtitle?: string): Paragraph[] {
  const paras: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 360, after: 120 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: PRIMARY_COLOR },
      },
      children: [
        new TextRun({
          text: title,
          bold: true,
          color: PRIMARY_COLOR,
          size: 24, // 12pt
          font: 'Calibri',
        }),
      ],
    }),
  ];

  if (subtitle) {
    paras.push(
      new Paragraph({
        spacing: { before: 0, after: 180 },
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            color: TEXT_MUTED,
            size: 18, // 9pt
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  return paras;
}

export async function generateConsultingDocx(params: DocxExportParams): Promise<Blob> {
  const {
    project,
    client,
    contract,
    meetings,
    bscObjectives,
    okrs,
    swotItems,
    ishikawas,
    actions5w2h,
    ganttTasks,
    risks,
    pareto,
    climateSurveys,
    consultantNotes,
    recommendations,
    settings,
    includedModules,
    formatCurrency,
  } = params;

  const children: (Paragraph | Table)[] = [];

  // ==========================================
  // 1. CAPA / CABEÇALHO FORMAL DO DOCUMENTO
  // ==========================================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: (settings.consultingFirmName || 'CONSULTOR PRIME ASSESSORIA EMPRESARIAL').toUpperCase(),
          bold: true,
          color: SECONDARY_COLOR,
          size: 20, // 10pt
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: 'DOSSIÊ EXECUTIVO DE CONSULTORIA',
          bold: true,
          color: PRIMARY_COLOR,
          size: 36, // 18pt
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
      children: [
        new TextRun({
          text: `Diagnóstico Estratégico, Matrizes de Gestão & Plano de Ação Tático`,
          italics: true,
          color: TEXT_MUTED,
          size: 22, // 11pt
          font: 'Calibri',
        }),
      ],
    })
  );

  // Tabela de Identificação do Projeto
  const metaRows = [
    new TableRow({
      children: [
        createCell('Projeto:', { bold: true, fill: HEADER_BG, widthPercent: 20 }),
        createCell(project.name, { bold: true, widthPercent: 30 }),
        createCell('Cliente:', { bold: true, fill: HEADER_BG, widthPercent: 20 }),
        createCell(project.clientName || client?.name || 'Cliente Corporativo', { widthPercent: 30 }),
      ],
    }),
    new TableRow({
      children: [
        createCell('Segmento:', { bold: true, fill: HEADER_BG, widthPercent: 20 }),
        createCell(project.segment || 'Geral', { widthPercent: 30 }),
        createCell('Consultor Líder:', { bold: true, fill: HEADER_BG, widthPercent: 20 }),
        createCell(project.leadConsultant || 'Consultor Responsável', { widthPercent: 30 }),
      ],
    }),
    new TableRow({
      children: [
        createCell('Período de Execução:', { bold: true, fill: HEADER_BG, widthPercent: 20 }),
        createCell(`${project.startDate || 'Início'} a ${project.expectedEndDate || 'Conclusão'}`, { widthPercent: 30 }),
        createCell('Orçamento Aprovado:', { bold: true, fill: HEADER_BG, widthPercent: 20 }),
        createCell(formatCurrency(project.budget || 0), { bold: true, widthPercent: 30 }),
      ],
    }),
    new TableRow({
      children: [
        createCell('Status Atual:', { bold: true, fill: HEADER_BG, widthPercent: 20 }),
        createCell(project.status, { bold: true, color: PRIMARY_COLOR, widthPercent: 30 }),
        createCell('Data de Emissão:', { bold: true, fill: HEADER_BG, widthPercent: 20 }),
        createCell(new Date().toLocaleDateString('pt-BR'), { widthPercent: 30 }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: metaRows,
    })
  );

  children.push(new Paragraph({ spacing: { before: 240, after: 0 } }));

  // ==========================================
  // 2. SUMÁRIO EXECUTIVO & PARECER
  // ==========================================
  if (includedModules.executiveSummary) {
    children.push(...createSectionHeading('1. SUMÁRIO EXECUTIVO & PARECER DO CONSULTOR'));

    children.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({ text: 'Parecer Geral do Diagnóstico:', bold: true, color: PRIMARY_COLOR, size: 20, font: 'Calibri' }),
        ],
      }),
      new Paragraph({
        spacing: { before: 0, after: 180 },
        children: [
          new TextRun({ text: consultantNotes || 'Sem observações registradas.', size: 20, font: 'Calibri' }),
        ],
      }),
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({ text: 'Recomendações Estratégicas Prioritárias:', bold: true, color: PRIMARY_COLOR, size: 20, font: 'Calibri' }),
        ],
      }),
      new Paragraph({
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({ text: recommendations || 'Sem recomendações cadastradas.', size: 20, font: 'Calibri' }),
        ],
      })
    );

    // Mini Tabela de Indicadores Gerais
    const kpiRows = [
      new TableRow({
        children: [
          createCell('Métrica do Projeto', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 50 }),
          createCell('Resultado Consolidado', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 50 }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Plano de Ações (5W2H) Mapeadas'),
          createCell(`${actions5w2h.length} ações (${actions5w2h.filter((a) => a.status === 'Concluída').length} concluídas)`, { align: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Riscos Identificados e Monitorados', { fill: ZEBRA_BG }),
          createCell(`${risks.length} riscos (${risks.filter((r) => r.classification === 'Crítico' || r.classification === 'Alto').length} de alta criticidade)`, { fill: ZEBRA_BG, align: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Metas Estratégicas BSC Registradas'),
          createCell(`${bscObjectives.length} objetivos distribuídos nas 4 perspectivas`, { align: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Entregas e Tarefas no Cronograma Gantt', { fill: ZEBRA_BG }),
          createCell(`${ganttTasks.length} tarefas mapeadas com responsáveis definidos`, { fill: ZEBRA_BG, align: AlignmentType.CENTER }),
        ],
      }),
    ];

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: kpiRows,
      })
    );
  }

  // ==========================================
  // 3. CONTRATO DE CONSULTORIA
  // ==========================================
  if (includedModules.contract && contract) {
    children.push(...createSectionHeading('2. CONTRATO DE PRESTAÇÃO DE SERVIÇOS (SÍNTESE)'));

    const contractRows = [
      new TableRow({
        children: [
          createCell('Título do Contrato:', { bold: true, fill: HEADER_BG, widthPercent: 25 }),
          createCell(`${contract.title} (${contract.contractNumber})`, { widthPercent: 75 }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Contratante / Cliente:', { bold: true, fill: HEADER_BG, widthPercent: 25 }),
          createCell(`${contract.clientCompany || project.clientName} (CNPJ: ${contract.clientCnpj || 'N/A'})`, { widthPercent: 75 }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Escopo Acordado:', { bold: true, fill: HEADER_BG, widthPercent: 25 }),
          createCell(contract.scope || 'Conforme proposta comercial técnica de consultoria.', { widthPercent: 75 }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Valor e Prazo:', { bold: true, fill: HEADER_BG, widthPercent: 25 }),
          createCell(`${formatCurrency(contract.totalValue)} • Duração de ${contract.durationMonths} meses`, { bold: true, widthPercent: 75 }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Entregáveis Contratuais:', { bold: true, fill: HEADER_BG, widthPercent: 25 }),
          createCell(contract.deliverables && contract.deliverables.length > 0 ? contract.deliverables.join('; ') : 'Relatórios e planos de intervenção.', { widthPercent: 75 }),
        ],
      }),
    ];

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: contractRows,
      })
    );
  }

  // ==========================================
  // 4. ALINHAMENTO COM STAKEHOLDERS & REUNIÕES
  // ==========================================
  if (includedModules.meetings && meetings.length > 0) {
    children.push(...createSectionHeading('3. ALINHAMENTO COM STAKEHOLDERS & REUNIÕES EXECUTIVAS'));

    const meetingRows: TableRow[] = [
      new TableRow({
        children: [
          createCell('Título da Reunião', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 30 }),
          createCell('Data / Duração', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 20 }),
          createCell('Pauta & Objetivos', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 30 }),
          createCell('Status / Clima', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 20 }),
        ],
      }),
    ];

    meetings.forEach((m, idx) => {
      const isZebra = idx % 2 === 1;
      const agendaStr = Array.isArray(m.agenda) ? m.agenda.map((a) => a.title).join(', ') : 'Alinhamento geral';
      meetingRows.push(
        new TableRow({
          children: [
            createCell(m.title, { bold: true, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(`${m.scheduledDate || 'Data'} • ${m.durationMinutes} min`, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(agendaStr, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(`${m.status} (${m.clientMood || 'Neutro'})`, { fill: isZebra ? ZEBRA_BG : undefined }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: meetingRows,
      })
    );
  }

  // ==========================================
  // 5. BALANCED SCORECARD (BSC)
  // ==========================================
  if (includedModules.bsc && bscObjectives.length > 0) {
    children.push(...createSectionHeading('4. BALANCED SCORECARD (BSC) & DIRETRIZES ESTRATÉGICAS'));

    const bscRows: TableRow[] = [
      new TableRow({
        children: [
          createCell('Perspectiva', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 20 }),
          createCell('Objetivo Estratégico', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 30 }),
          createCell('Indicador (KPI)', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 20 }),
          createCell('Real / Meta', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 15 }),
          createCell('Status', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 15 }),
        ],
      }),
    ];

    const perspLabels: Record<string, string> = {
      financial: '1. Financeira',
      customer: '2. Clientes',
      internal: '3. Processos',
      learning: '4. Aprendizado',
    };

    bscObjectives.forEach((b, idx) => {
      const isZebra = idx % 2 === 1;
      const prog = b.targetValue > 0 ? Math.min(100, Math.round((b.currentValue / b.targetValue) * 100)) : 0;
      bscRows.push(
        new TableRow({
          children: [
            createCell(perspLabels[b.perspective] || b.perspective, { bold: true, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(b.name, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(b.kpi, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(`${b.currentValue} / ${b.targetValue} ${b.unit} (${prog}%)`, { align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(b.status, { bold: true, align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: bscRows,
      })
    );
  }

  // ==========================================
  // 6. MATRIZ SWOT
  // ==========================================
  if (includedModules.swot && swotItems.length > 0) {
    children.push(...createSectionHeading('5. MATRIZ SWOT (FORÇAS, FRAQUEZAS, OPORTUNIDADES E AMEAÇAS)'));

    const swotRows: TableRow[] = [
      new TableRow({
        children: [
          createCell('Quadrante', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 20 }),
          createCell('Fator Estratégico', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 35 }),
          createCell('Descrição / Detalhamento', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 35 }),
          createCell('Impacto', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 10 }),
        ],
      }),
    ];

    swotItems.forEach((s, idx) => {
      const isZebra = idx % 2 === 1;
      swotRows.push(
        new TableRow({
          children: [
            createCell(s.category, { bold: true, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(s.factor, { bold: true, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(s.description || '-', { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(String(s.impact || 3), { align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: swotRows,
      })
    );
  }

  // ==========================================
  // 7. DIAGRAMA DE ISHIKAWA
  // ==========================================
  if (includedModules.ishikawa && ishikawas.length > 0) {
    children.push(...createSectionHeading('6. ANÁLISE DE CAUSA E EFEITO (DIAGRAMA DE ISHIKAWA)'));

    ishikawas.forEach((ish) => {
      const prob = ish.problemStatement || ish.problem || ish.description || 'Problema em análise';
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: 'Problema Central (Efeito): ', bold: true, color: PRIMARY_COLOR, size: 20, font: 'Calibri' }),
            new TextRun({ text: prob, bold: true, size: 20, font: 'Calibri' }),
          ],
        })
      );

      const causeRows: TableRow[] = [
        new TableRow({
          children: [
            createCell('Dimensão (6M)', { bold: true, fill: HEADER_BG, widthPercent: 25 }),
            createCell('Causa Identificada', { bold: true, fill: HEADER_BG, widthPercent: 40 }),
            createCell('Relevância / Status', { bold: true, fill: HEADER_BG, widthPercent: 35 }),
          ],
        }),
      ];

      if (ish.causes && ish.causes.length > 0) {
        ish.causes.forEach((c) => {
          causeRows.push(
            new TableRow({
              children: [
                createCell(c.category, { bold: true }),
                createCell(c.cause),
                createCell(`${c.relevance || 'Média'} • ${c.status || 'Identificada'}`),
              ],
            })
          );
        });
      } else {
        causeRows.push(
          new TableRow({
            children: [
              createCell('Geral'),
              createCell('Causas em mapeamento preliminar.'),
              createCell('Em investigação'),
            ],
          })
        );
      }

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: causeRows,
        }),
        new Paragraph({ spacing: { before: 120, after: 0 } })
      );
    });
  }

  // ==========================================
  // 8. PLANO DE AÇÃO (5W2H)
  // ==========================================
  if (includedModules.actions5w2h && actions5w2h.length > 0) {
    children.push(...createSectionHeading('7. PLANO DE AÇÃO OPERACIONAL (5W2H)'));

    const actionRows: TableRow[] = [
      new TableRow({
        children: [
          createCell('O quê (What)', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 24 }),
          createCell('Quem (Who)', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 15 }),
          createCell('Quando (When)', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 12 }),
          createCell('Onde / Por quê', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 20 }),
          createCell('Custo (R$)', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.RIGHT, widthPercent: 14 }),
          createCell('Status', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 15 }),
        ],
      }),
    ];

    actions5w2h.forEach((a, idx) => {
      const isZebra = idx % 2 === 1;
      actionRows.push(
        new TableRow({
          children: [
            createCell(a.what, { bold: true, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(a.who, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(a.when, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(`${a.where || '-'} / ${a.why || '-'}`, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(formatCurrency(a.howMuch || 0), { align: AlignmentType.RIGHT, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(a.status, { bold: true, align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: actionRows,
      })
    );
  }

  // ==========================================
  // 9. CRONOGRAMA GANTT
  // ==========================================
  if (includedModules.gantt && ganttTasks.length > 0) {
    children.push(...createSectionHeading('8. CRONOGRAMA DE ENTREGAS & GANTT'));

    const ganttRows: TableRow[] = [
      new TableRow({
        children: [
          createCell('Atividade / Entrega', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 35 }),
          createCell('Início', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 15 }),
          createCell('Término', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 15 }),
          createCell('Responsável', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 20 }),
          createCell('Status / %', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 15 }),
        ],
      }),
    ];

    ganttTasks.forEach((t, idx) => {
      const isZebra = idx % 2 === 1;
      ganttRows.push(
        new TableRow({
          children: [
            createCell(t.name, { bold: true, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(t.startDate, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(t.endDate, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(t.responsible || 'Consultor', { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(`${t.progressPercent}% (${t.status})`, { align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: ganttRows,
      })
    );
  }

  // ==========================================
  // 10. MATRIZ DE RISCOS
  // ==========================================
  if (includedModules.risks && risks.length > 0) {
    children.push(...createSectionHeading('9. MATRIZ DE RISCOS & PLANOS DE CONTINGÊNCIA'));

    const riskRows: TableRow[] = [
      new TableRow({
        children: [
          createCell('Risco Mapeado', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 30 }),
          createCell('Categoria', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 15 }),
          createCell('Prob x Imp (Score)', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 15 }),
          createCell('Classificação', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 15 }),
          createCell('Ação Preventiva / Contingência', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 25 }),
        ],
      }),
    ];

    risks.forEach((r, idx) => {
      const isZebra = idx % 2 === 1;
      riskRows.push(
        new TableRow({
          children: [
            createCell(r.risk, { bold: true, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(r.category, { fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(`${r.probability} x ${r.impact} = ${r.riskScore}`, { align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(r.classification, { bold: true, align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(r.preventiveAction || r.contingencyPlan || '-', { fill: isZebra ? ZEBRA_BG : undefined }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: riskRows,
      })
    );
  }

  // ==========================================
  // 11. ANÁLISE DE PARETO
  // ==========================================
  if (includedModules.pareto && pareto.length > 0) {
    children.push(...createSectionHeading('10. ANÁLISE DE PARETO (REGRA 80/20)'));

    const totalParetoCount = pareto.reduce((acc, p) => acc + (p.count || 0), 0) || 1;

    const paretoRows: TableRow[] = [
      new TableRow({
        children: [
          createCell('Categoria de Causa / Incidente', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', widthPercent: 35 }),
          createCell('Ocorrências', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 20 }),
          createCell('% do Total', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.CENTER, widthPercent: 20 }),
          createCell('Custo Estimado (R$)', { bold: true, fill: PRIMARY_COLOR, color: 'FFFFFF', align: AlignmentType.RIGHT, widthPercent: 25 }),
        ],
      }),
    ];

    pareto.forEach((p, idx) => {
      const isZebra = idx % 2 === 1;
      const pct = Math.round(((p.count || 0) / totalParetoCount) * 100);
      paretoRows.push(
        new TableRow({
          children: [
            createCell(p.category, { bold: true, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(String(p.count), { align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(`${pct}%`, { align: AlignmentType.CENTER, fill: isZebra ? ZEBRA_BG : undefined }),
            createCell(formatCurrency(p.estimatedCost || 0), { align: AlignmentType.RIGHT, fill: isZebra ? ZEBRA_BG : undefined }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: paretoRows,
      })
    );
  }

  // ==========================================
  // 12. PESQUISA DE CLIMA & ENPS
  // ==========================================
  if (includedModules.climateSurvey && climateSurveys.length > 0) {
    children.push(...createSectionHeading('11. DIAGNÓSTICO DE CLIMA ORGANIZACIONAL & eNPS'));

    climateSurveys.forEach((surv) => {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `${surv.title} (${surv.cycle}) — `, bold: true, color: PRIMARY_COLOR, size: 20, font: 'Calibri' }),
            new TextRun({ text: `eNPS: ${surv.enpsScore > 0 ? `+${surv.enpsScore}` : surv.enpsScore} pts | Favorabilidade: ${surv.overallFavorabilityPercent}%`, bold: true, size: 20, font: 'Calibri' }),
          ],
        })
      );

      const survRows: TableRow[] = [
        new TableRow({
          children: [
            createCell('Total Respondentes', { bold: true, fill: HEADER_BG }),
            createCell(`${surv.totalRespondents} de ${surv.totalEligible} (${surv.participationRate}%)`, { align: AlignmentType.CENTER }),
            createCell('Promotores / Detratores', { bold: true, fill: HEADER_BG }),
            createCell(`${surv.enpsPromotersPercent}% Promotores • ${surv.enpsDetractorsPercent}% Detratores`, { align: AlignmentType.CENTER }),
          ],
        }),
      ];

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: survRows,
        }),
        new Paragraph({ spacing: { before: 120, after: 0 } })
      );
    });
  }

  // ==========================================
  // 13. TERMO DE ENCERRAMENTO & ASSINATURAS
  // ==========================================
  children.push(
    new Paragraph({
      spacing: { before: 480, after: 120 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'VALIDAÇÃO & HOMOLOGAÇÃO DO RELATÓRIO',
          bold: true,
          color: PRIMARY_COLOR,
          size: 20,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 360 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Documento emitido e homologado em ${new Date().toLocaleDateString('pt-BR')}.`,
          italics: true,
          color: TEXT_MUTED,
          size: 18,
          font: 'Calibri',
        }),
      ],
    })
  );

  const sigRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '________________________________________', color: BORDER_COLOR }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: project.leadConsultant || 'Consultor Líder', bold: true, size: 20, font: 'Calibri' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Consultor Líder do Projeto', color: TEXT_MUTED, size: 16, font: 'Calibri' }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '________________________________________', color: BORDER_COLOR }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: project.clientName || 'Representante do Cliente', bold: true, size: 20, font: 'Calibri' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Representante Autorizado do Cliente', color: TEXT_MUTED, size: 16, font: 'Calibri' }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: sigRows,
    })
  );

  // ==========================================
  // MONTAGEM DO DOCUMENTO FINAL COM HEADER/FOOTER
  // ==========================================
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${settings.consultingFirmName || 'Consultor Prime'} • Projeto: ${project.name}`,
                    size: 16,
                    color: TEXT_MUTED,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Página ',
                    size: 16,
                    color: TEXT_MUTED,
                    font: 'Calibri',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: TEXT_MUTED,
                    font: 'Calibri',
                  }),
                  new TextRun({
                    text: ' de ',
                    size: 16,
                    color: TEXT_MUTED,
                    font: 'Calibri',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: TEXT_MUTED,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
