export type ModuleId =
  | 'dashboard'
  | 'projects'
  | 'clients'
  | 'swot'
  | 'bsc'
  | 'contract'
  | 'meeting'
  | 'gantt'
  | 'actions5w2h'
  | '5w2h'
  | 'risks'
  | 'pareto'
  | 'climate'
  | 'reports'
  | 'settings';

export type ProjectStatus =
  | 'Planejamento'
  | 'Em andamento'
  | 'Em revisão'
  | 'Concluído'
  | 'Suspenso'
  | 'Cancelado';

export type PriorityLevel = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  segment: string;
  description: string;
  mainObjective: string;
  leadConsultant: string;
  team: string[];
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  notes?: string;
  budget: number;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  role: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  segment: string;
  relationshipOrigin: string;
  relationshipStatus: 'Prospect' | 'Ativo' | 'Em Pausa' | 'Encerrado';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/* 4. SWOT */
export type SwotCategory = 'Forças' | 'Fraquezas' | 'Oportunidades' | 'Ameaças';

export interface SwotItem {
  id: string;
  projectId: string;
  category: SwotCategory;
  factor: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  impact: number; // 1 to 5
  isSelected: boolean; // Selected for executive matrix (up to 5 per quadrant)
  responsible: string;
  recommendedAction?: string;
  notes?: string;
  createdAt: string;
}

/* 5. Gantt Tasks */
export type TaskStatus =
  | 'Não iniciado'
  | 'Em andamento'
  | 'Em revisão'
  | 'Concluído'
  | 'Atrasado'
  | 'Cancelado';

export interface GanttTask {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  stage: string; // Group / Phase e.g. "1. Diagnóstico", "2. Planejamento"
  responsible: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  progressPercent: number; // 0 - 100
  status: TaskStatus;
  priority: PriorityLevel;
  dependencies?: string[]; // IDs of tasks that must finish before
  isMilestone: boolean;
  notes?: string;
  createdAt: string;
}

/* 6. Ishikawa (Fishbone) */
export type IshikawaStatus =
  | 'Identificada'
  | 'Pendente'
  | 'Em investigação'
  | 'Em Investigação'
  | 'Confirmada'
  | 'Descartada'
  | 'Em tratamento';

export interface IshikawaSubcause {
  id: string;
  text: string;
}

export interface IshikawaCause {
  id: string;
  category: string; // "Pessoas", "Processos", "Tecnologia", "Recursos", "Ambiente", "Medição", "Gestão", "Comunicação", or custom
  cause: string;
  subcauses: IshikawaSubcause[] | string[];
  evidence?: string;
  relevance: PriorityLevel;
  recommendedAction?: string;
  investigationAction?: string;
  status: IshikawaStatus;
}

export interface IshikawaAnalysis {
  id: string;
  projectId: string;
  problemStatement?: string;
  problem?: string;
  description?: string;
  problemDescription?: string;
  identificationDate?: string;
  analysisDate?: string;
  responsible: string;
  categories: string[];
  causes: IshikawaCause[];
  createdAt?: string;
}

/* 7. 5W2H Action Plan */
export type ActionStatus =
  | 'Não iniciada'
  | 'Em andamento'
  | 'Em revisão'
  | 'Concluída'
  | 'Atrasada'
  | 'Cancelada';

export interface Action5W2H {
  id: string;
  projectId: string;
  what: string; // O que fazer
  why: string; // Por que fazer
  where: string; // Onde será feito
  when: string; // Prazo final
  startDate?: string;
  who: string; // Responsável
  how: string; // Como fazer
  howMuch: number; // Custo estimado
  priority: PriorityLevel;
  status: ActionStatus;
  progressPercent: number; // 0 - 100
  deliverableEvidence?: string;
  evidence?: string; // Evidência da conclusão
  relatedTool?: string;
  relatedOriginType?: 'swot' | 'risk' | 'ishikawa' | 'gantt' | 'general';
  relatedOriginId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* 8. Risk Matrix */
export type RiskClassification = 'Baixo' | 'Moderado' | 'Alto' | 'Crítico';
export type RiskCategory =
  | 'Estratégico'
  | 'Operacional'
  | 'Financeiro'
  | 'Tecnológico'
  | 'Legal'
  | 'Pessoas'
  | 'Reputacional'
  | string;

export type RiskStatus =
  | 'Identificado'
  | 'Em análise'
  | 'Em tratamento'
  | 'Em Tratamento'
  | 'Mitigado'
  | 'Aceito'
  | 'Ocorrido'
  | 'Encerrado';

export interface RiskItem {
  id: string;
  projectId: string;
  risk: string;
  cause: string;
  consequence: string;
  category: RiskCategory;
  probability: number; // 1 to 5
  impact: number; // 1 to 5
  riskScore: number; // probability * impact (1 to 25)
  classification: RiskClassification;
  responsible: string;
  preventiveAction: string;
  contingencyPlan: string;
  reviewDate?: string;
  deadline?: string;
  status: RiskStatus;
  notes?: string;
  createdAt?: string;
}

/* 9. Pareto Analysis */
export interface ParetoItem {
  id: string;
  projectId: string;
  category: string;
  description: string;
  count: number; // Ocorrências
  estimatedCost: number; // Custo R$
  impactScore: number; // Escala 1-100 ou similar
  period: string; // e.g. "Q1 2026", "Jan-Mar"
  notes?: string;
  createdAt?: string;
}

/* 10. PESTEL Analysis */
export type PestelDimension =
  | 'Político'
  | 'Econômico'
  | 'Social'
  | 'Tecnológico'
  | 'Ambiental'
  | 'Legal';

export type PestelCategory = PestelDimension;

export type PestelTrend = 'Favorável' | 'Neutro' | 'Desfavorável' | 'Positiva' | 'Neutra' | 'Negativa';
export type PestelImpact = 'Positivo' | 'Negativo' | 'Misto' | number;
export type PestelHorizon = 'Curto prazo' | 'Médio prazo' | 'Longo prazo';

export interface PestelItem {
  id: string;
  projectId: string;
  dimension?: PestelDimension;
  category: PestelCategory;
  factor: string;
  description?: string;
  trend: PestelTrend;
  impact: PestelImpact;
  probability?: number;
  horizon?: PestelHorizon;
  uncertainty?: 'Baixo' | 'Médio' | 'Alto';
  implication?: string;
  strategicResponse?: string;
  type?: 'Oportunidade' | 'Ameaça' | 'Neutro';
  recommendedAction?: string;
  responsible?: string;
  status?: 'Monitorar' | 'Em Ação' | 'Resolvido';
  createdAt?: string;
}

/* 11. Stakeholder Matrix */
export type StakeholderStrategy =
  | 'Gerenciar de perto'
  | 'Manter satisfeito'
  | 'Manter informado'
  | 'Monitorar';

export type StakeholderStance = 'Apoiador' | 'Neutro' | 'Resistente' | 'Crítico' | 'Favorável' | 'Apoiador Chave';

export interface StakeholderItem {
  id: string;
  projectId: string;
  name: string;
  organization: string;
  role: string;
  power?: number; // 1 to 5
  influence?: number; // 1 to 5
  interest: number; // 1 to 5
  currentStance?: StakeholderStance;
  desiredStance?: StakeholderStance;
  strategy?: StakeholderStrategy;
  engagementStrategy?: StakeholderStrategy;
  expectations?: string;
  expectation?: string;
  concerns?: string;
  engagementActions?: string;
  contactFrequency?: string;
  communicationFrequency?: string;
  impactPotential?: string;
  responsible: string;
  relationshipStatus?: 'Favorável' | 'Neutro' | 'Resistente' | 'Apoiador Chave';
  notes?: string;
  createdAt?: string;
}

/* 12. Canvas (Business Model / Project / Solution) */
export type CanvasBlockKey =
  | 'key_partners'
  | 'key_activities'
  | 'key_resources'
  | 'value_propositions'
  | 'customer_relationships'
  | 'channels'
  | 'customer_segments'
  | 'cost_structure'
  | 'revenue_streams';

export interface CanvasItem {
  id: string;
  blockKey: CanvasBlockKey;
  text: string;
  description?: string;
  color?: string;
  author?: string;
}

export type CanvasType = 'business_model' | 'project' | 'solution' | 'custom';

export interface CanvasCard {
  id: string;
  text: string;
  color?: string;
  author?: string;
}

export interface CanvasBlock {
  id: string;
  title: string;
  subtitle?: string;
  cards: CanvasCard[];
}

export interface CanvasModel {
  id: string;
  projectId: string;
  title: string;
  type: CanvasType;
  description?: string;
  blocks: Record<string, CanvasCard[]>;
  updatedAt: string;
}

/* 13. Metas & OKRs */
export type OkrStatus = 'No Prazo' | 'No rumo' | 'Em atenção' | 'Em Risco' | 'Em risco' | 'Atrasado' | 'Concluído' | 'Atingido';
export type KRStatus = OkrStatus;

export interface KeyResult {
  id: string;
  title: string;
  indicator?: string;
  initialValue: number;
  targetValue: number;
  currentValue: number;
  unit: string; // '%', 'R$', 'unidades', 'dias', etc.
  progressPercent: number; // auto calculated
  status: KRStatus;
  owner?: string;
  responsible?: string;
  deadline?: string;
  notes?: string;
}

export interface OKRObjective {
  id: string;
  projectId: string;
  title: string;
  objective?: string;
  category: string;
  cycle: string;
  period?: string;
  owner: string;
  responsible?: string;
  description?: string;
  keyResults: KeyResult[];
  overallProgress?: number;
  status?: OkrStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OkrObjective = OKRObjective;

/* 14. Pesquisa de Clima Organizacional & eNPS */
export type ClimateDimensionKey =
  | 'leadership'
  | 'communication'
  | 'work_environment'
  | 'recognition'
  | 'autonomy'
  | 'alignment'
  | 'wellbeing';

export interface ClimateDimensionScore {
  key: ClimateDimensionKey;
  name: string;
  score: number; // 1.0 to 5.0
  favorabilityPercent: number; // 0 to 100%
  status: 'Excelente' | 'Favorável' | 'Atenção' | 'Crítico';
  description?: string;
}

export interface ClimateDepartmentScore {
  department: string;
  totalEmployees: number;
  respondents: number;
  participationRate: number; // %
  enpsScore: number; // -100 to 100
  overallScore: number; // 1.0 to 5.0
  favorabilityPercent: number;
  priorityAlert?: string;
}

export interface ClimateQuestion {
  id: string;
  dimensionKey: ClimateDimensionKey;
  dimensionName: string;
  question: string;
  score: number; // 1.0 to 5.0
  favorabilityPercent: number; // % positive (4 or 5)
  neutralPercent: number; // % neutral (3)
  unfavorablePercent: number; // % negative (1 or 2)
  responsesCount: number;
}

export interface ClimateFeedbackComment {
  id: string;
  department: string;
  category: 'Elogio' | 'Oportunidade' | 'Crítica' | 'Sugestão';
  sentiment: 'Positivo' | 'Neutro' | 'Crítico';
  dimensionKey?: ClimateDimensionKey;
  comment: string;
  date: string;
  convertedTo5W2H?: boolean;
}

export interface ClimateSurvey {
  id: string;
  projectId: string;
  title: string;
  cycle: string; // e.g. "Q1 2026", "Diagnóstico Inicial"
  status: 'Planejada' | 'Em andamento' | 'Concluída' | 'Encerrada';
  startDate: string;
  endDate: string;
  targetAudience: string;
  totalEligible: number;
  totalRespondents: number;
  participationRate: number; // %
  enpsScore: number; // -100 to +100
  enpsPromotersPercent: number; // 0 to 100%
  enpsPassivesPercent: number; // 0 to 100%
  enpsDetractorsPercent: number; // 0 to 100%
  overallScore: number; // 1.0 to 5.0
  overallFavorabilityPercent: number; // 0 to 100%
  dimensions: ClimateDimensionScore[];
  departments: ClimateDepartmentScore[];
  questions: ClimateQuestion[];
  feedbackComments: ClimateFeedbackComment[];
  executiveSummary?: string;
  actionPriorities?: string[];
  createdAt: string;
  updatedAt: string;
}

/* 15. Relatório Executivo */
export interface ReportSectionSelection {
  projectDetails: boolean;
  executiveSummary: boolean;
  dashboardIndicators: boolean;
  swotMatrix: boolean;
  ganttSchedule: boolean;
  ishikawaAnalysis: boolean;
  actionPlan5W2H: boolean;
  riskMatrix: boolean;
  paretoAnalysis: boolean;
  pestelAnalysis: boolean;
  stakeholderMatrix: boolean;
  canvasModel: boolean;
  okrsAndGoals: boolean;
  climateSurvey?: boolean;
  conclusionsAndRecommendations: boolean;
}

export interface ConsultingReportConfig {
  id: string;
  projectId: string;
  title: string;
  subtitle: string;
  consultantName: string;
  consultantRole: string;
  clientName: string;
  date: string;
  version: string;
  executiveSummaryText: string;
  conclusionsText: string;
  sections: ReportSectionSelection;
  customNotes?: string;
}

/* 15. Configurações */
export interface AppSettings {
  consultingFirmName: string;
  consultancyName?: string;
  consultancyTagline?: string;
  logoUrl?: string;
  defaultConsultantName: string;
  consultantDefaultName?: string;
  currency: string;
  dateFormat: string;
  swotMaxItemsPerQuadrant?: number;
  riskScoreThresholds: {
    moderate: number; // score >= 6
    high: number; // score >= 12
    critical: number; // score >= 16
  };
  riskThresholds?: {
    moderate: number;
    high: number;
    critical: number;
  };
  customIshikawaCategories?: string[];
}

export interface AppNotification {
  id: string;
  type: 'warning' | 'info' | 'critical' | 'success';
  title: string;
  message: string;
  targetModule: ModuleId;
  relatedId?: string;
  date: string;
  isRead: boolean;
}

/* 16. Autenticação & Grupos */
export interface UserSession {
  email: string;
  group: string;
  name?: string;
  role?: string;
  loggedInAt: string;
}

/* 17. Balanced Scorecard (BSC) */
export type BSCPerspective = 'financial' | 'customer' | 'internal' | 'learning';

export interface BSCObjective {
  id: string;
  projectId: string;
  perspective: BSCPerspective;
  name: string;
  description: string;
  kpi: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'critical' | 'warning' | 'on_track' | 'achieved';
  initiatives: string;
  responsible: string;
  deadline: string;
}

/* 18. Contrato de Consultoria */
export interface ConsultingContract {
  id: string;
  projectId: string;
  title: string;
  contractNumber: string;
  contractorFirm: string;
  contractorCnpj: string;
  contractorAddress: string;
  contractorRep: string;
  contractorRepRole: string;
  clientCompany: string;
  clientCnpj: string;
  clientAddress: string;
  clientRep: string;
  clientRepCpf: string;
  clientRepRole: string;
  scope: string;
  methodology: string;
  startDate: string;
  durationMonths: number;
  totalValue: number;
  paymentTerms: string;
  deliverables: string[];
  forumCity: string;
  status: 'draft' | 'under_review' | 'signed' | 'active';
  customClauses?: string;
}

/* 19. Simulador e Condução de Reunião */
export interface MeetingAgendaItem {
  id: string;
  title: string;
  allocatedMinutes: number;
  notes: string;
  decisions: string;
}

export interface MeetingSimulation {
  id: string;
  projectId: string;
  title: string;
  type: 'diagnostic_kickoff' | 'results_presentation' | 'status_steering' | 'crisis_alignment';
  scheduledDate: string;
  durationMinutes: number;
  participants: string[];
  clientMood: 'receptive' | 'skeptical' | 'demanding' | 'collaborative';
  objectives: string[];
  agenda: MeetingAgendaItem[];
  objectionsAndAnswers: { objection: string; recommendedResponse: string }[];
  meetingNotes: string;
  actionItemsGenerated: string[];
  status: 'planned' | 'in_progress' | 'completed';
}

