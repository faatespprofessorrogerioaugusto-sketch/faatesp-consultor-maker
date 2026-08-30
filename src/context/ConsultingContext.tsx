import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ModuleId,
  Project,
  Client,
  SwotItem,
  GanttTask,
  IshikawaAnalysis,
  IshikawaCause,
  Action5W2H,
  RiskItem,
  ParetoItem,
  PestelItem,
  StakeholderItem,
  CanvasModel,
  CanvasCard,
  OkrObjective,
  KeyResult,
  ClimateSurvey,
  ClimateDimensionScore,
  ClimateDepartmentScore,
  ClimateQuestion,
  ClimateFeedbackComment,
  ConsultingReportConfig,
  AppSettings,
  AppNotification,
  RiskClassification,
  UserSession,
  BSCObjective,
  ConsultingContract,
  MeetingSimulation,
} from '../types';
import {
  initialClients,
  initialProjects,
  initialSwotItems,
  initialGanttTasks,
  initialIshikawaAnalyses,
  initialActions5W2H,
  initialRisks,
  initialParetoItems,
  initialPestelItems,
  initialStakeholders,
  initialCanvasModels,
  initialOkrs,
  initialClimateSurveys,
  initialBscObjectives,
  initialContracts,
  initialMeetings,
  initialReportConfig,
  initialSettings,
} from '../data/initialData';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ConsultingContextType {
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  currentProject?: Project;

  // Projects
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, p: Partial<Project>) => void;
  duplicateProject: (id: string) => string;
  archiveProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // Clients
  clients: Client[];
  addClient: (c: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // SWOT
  swotItems: SwotItem[];
  currentProjectSwot: SwotItem[];
  addSwotItem: (item: Omit<SwotItem, 'id' | 'createdAt' | 'projectId'>) => void;
  updateSwotItem: (id: string, item: Partial<SwotItem>) => void;
  toggleSelectSwotItem: (id: string) => void;
  deleteSwotItem: (id: string) => void;
  duplicateSwotItem: (id: string) => void;

  // Gantt
  ganttTasks: GanttTask[];
  currentProjectTasks: GanttTask[];
  addGanttTask: (task: Omit<GanttTask, 'id' | 'createdAt' | 'projectId'>) => void;
  updateGanttTask: (id: string, task: Partial<GanttTask>) => void;
  deleteGanttTask: (id: string) => void;
  duplicateGanttTask: (id: string) => void;

  // Ishikawa
  ishikawaAnalyses: IshikawaAnalysis[];
  currentProjectIshikawa?: IshikawaAnalysis;
  saveIshikawaAnalysis: (data: Partial<IshikawaAnalysis>) => void;
  addIshikawaCause: (cause: Omit<IshikawaCause, 'id'>) => void;
  updateIshikawaCause: (causeId: string, updates: Partial<IshikawaCause>) => void;
  deleteIshikawaCause: (causeId: string) => void;

  // 5W2H
  actions5W2H: Action5W2H[];
  currentProjectActions: Action5W2H[];
  addAction5W2H: (action: Omit<Action5W2H, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => void;
  updateAction5W2H: (id: string, updates: Partial<Action5W2H>) => void;
  deleteAction5W2H: (id: string) => void;
  duplicateAction5W2H: (id: string) => void;

  // Risks
  risks: RiskItem[];
  currentProjectRisks: RiskItem[];
  addRisk: (risk: Omit<RiskItem, 'id' | 'createdAt' | 'riskScore' | 'classification' | 'projectId'>) => void;
  updateRisk: (id: string, updates: Partial<RiskItem>) => void;
  deleteRisk: (id: string) => void;
  duplicateRisk: (id: string) => void;

  // Pareto
  paretoItems: ParetoItem[];
  currentProjectPareto: ParetoItem[];
  addParetoItem: (item: Omit<ParetoItem, 'id' | 'createdAt' | 'projectId'>) => void;
  updateParetoItem: (id: string, updates: Partial<ParetoItem>) => void;
  deleteParetoItem: (id: string) => void;
  duplicateParetoItem: (id: string) => void;

  // PESTEL
  pestelItems: PestelItem[];
  currentProjectPestel: PestelItem[];
  addPestelItem: (item: Omit<PestelItem, 'id' | 'createdAt' | 'projectId'>) => void;
  updatePestelItem: (id: string, updates: Partial<PestelItem>) => void;
  deletePestelItem: (id: string) => void;
  duplicatePestelItem: (id: string) => void;

  // Stakeholders
  stakeholders: StakeholderItem[];
  currentProjectStakeholders: StakeholderItem[];
  addStakeholder: (item: Omit<StakeholderItem, 'id' | 'createdAt' | 'projectId'>) => void;
  updateStakeholder: (id: string, updates: Partial<StakeholderItem>) => void;
  deleteStakeholder: (id: string) => void;
  duplicateStakeholder: (id: string) => void;

  // Canvas
  canvasModels: CanvasModel[];
  currentProjectCanvas?: CanvasModel;
  saveCanvasModel: (model: Partial<CanvasModel>) => void;
  addCanvasCard: (blockKey: string, cardText: string, color?: string) => void;
  updateCanvasCard: (blockKey: string, cardId: string, cardText: string, color?: string) => void;
  deleteCanvasCard: (blockKey: string, cardId: string) => void;
  moveCanvasCard: (sourceBlockKey: string, targetBlockKey: string, cardId: string) => void;

  // OKRs
  okrs: OkrObjective[];
  currentProjectOkrs: OkrObjective[];
  currentProjectOKRs?: OkrObjective[];
  addOkr: (okr: Omit<OkrObjective, 'id' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'projectId'>) => void;
  updateOkr: (id: string, updates: Partial<OkrObjective>) => void;
  duplicateOkr: (id: string) => void;
  deleteOkr: (id: string) => void;
  addObjective?: (okr: Omit<OkrObjective, 'id' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'projectId'>) => void;
  updateObjective?: (id: string, updates: Partial<OkrObjective>) => void;
  deleteObjective?: (id: string) => void;
  addKeyResult: (okrId: string, kr: Omit<KeyResult, 'id' | 'progressPercent'>) => void;
  updateKeyResult: (okrId: string, krId: string, updates: Partial<KeyResult>) => void;
  deleteKeyResult: (okrId: string, krId: string) => void;
  convertKRTo5W2H: (okrId: string, krId: string, actionWhat: string, responsible: string, deadline: string, cost?: number) => void;

  // Pesquisa de Clima Organizacional & eNPS
  climateSurveys: ClimateSurvey[];
  currentProjectClimateSurveys: ClimateSurvey[];
  currentClimateSurvey?: ClimateSurvey;
  selectedClimateSurveyId: string | null;
  setSelectedClimateSurveyId: (id: string | null) => void;
  addClimateSurvey: (survey: Omit<ClimateSurvey, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => string;
  updateClimateSurvey: (id: string, updates: Partial<ClimateSurvey>) => void;
  deleteClimateSurvey: (id: string) => void;
  duplicateClimateSurvey: (id: string) => void;
  addClimateQuestion: (surveyId: string, q: Omit<ClimateQuestion, 'id'>) => void;
  deleteClimateQuestion: (surveyId: string, qId: string) => void;
  addClimateFeedbackComment: (surveyId: string, c: Omit<ClimateFeedbackComment, 'id' | 'date'>) => void;
  deleteClimateFeedbackComment: (surveyId: string, cId: string) => void;
  convertClimateCommentTo5W2H: (surveyId: string, commentId: string, actionWhat: string, responsible: string, deadline: string) => void;

  // Balanced Scorecard (BSC)
  bscObjectives: BSCObjective[];
  addBscObjective: (objective: Omit<BSCObjective, 'id' | 'projectId'>) => void;
  updateBscObjective: (id: string, objective: Partial<BSCObjective>) => void;
  deleteBscObjective: (id: string) => void;

  // Contratos de Consultoria
  contracts: ConsultingContract[];
  addContract: (contract: Omit<ConsultingContract, 'id' | 'projectId'>) => void;
  updateContract: (id: string, contract: Partial<ConsultingContract>) => void;
  deleteContract: (id: string) => void;

  // Simulador de Reuniões
  meetings: MeetingSimulation[];
  addMeeting: (meeting: Omit<MeetingSimulation, 'id' | 'projectId'>) => void;
  updateMeeting: (id: string, meeting: Partial<MeetingSimulation>) => void;
  deleteMeeting: (id: string) => void;

  // Reports & Settings
  reportConfig: ConsultingReportConfig;
  setReportConfig: React.Dispatch<React.SetStateAction<ConsultingReportConfig>>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Global utilities
  notifications: AppNotification[];
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  formatCurrency: (val?: number) => string;
  calculateRiskClass: (score: number) => RiskClassification;
  exportAllDataJSON: () => void;
  importDataJSON: (jsonData: string) => boolean;
  resetToDemoData: () => void;

  // Auth & Group Management
  currentUser: UserSession | null;
  currentGroup: string;
  availableGroups: string[];
  login: (email: string, group: string) => void;
  logout: () => void;
  switchGroup: (newGroup: string) => void;
  createGroup: (groupName: string) => void;
  deleteGroupData: (groupName: string) => void;
  cleanCurrentGroupData: () => void;
}

const ConsultingContext = createContext<ConsultingContextType | undefined>(undefined);

export const GROUPS_STORAGE_KEY = 'consult_hub_groups_list_v2';
export const SESSION_STORAGE_KEY = 'consult_hub_current_session_v2';

export const PROFESSOR_AUTHORIZED_EMAIL = 'faatesp.professor.rogerioaugusto@gmail.com';

export const isProfessorGroup = (groupName: string): boolean => {
  const clean = (groupName || '').trim().toLowerCase();
  return (
    clean === 'professor' ||
    clean === 'grupo professor' ||
    clean === 'professores' ||
    clean === 'docente' ||
    clean === 'coordenação' ||
    clean === 'coordenacao'
  );
};

export const isProfessorEmail = (email: string): boolean => {
  return (email || '').trim().toLowerCase() === PROFESSOR_AUTHORIZED_EMAIL.toLowerCase();
};

export const defaultAvailableGroups = [
  'Professor',
  'Grupo 01',
  'Grupo 02',
  'Grupo 03',
  'Grupo 04',
  'Grupo 05',
];

export const getGroupStoragePrefix = (groupName: string) => {
  const safe = (groupName || 'default').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `consult_hub_grp_${safe}`;
};

export const loadDataForGroup = (groupName: string, userEmail: string = '') => {
  const prefix = getGroupStoragePrefix(groupName);
  const isInit = localStorage.getItem(`${prefix}_initialized`);

  if (isInit) {
    const getSaved = <T,>(key: string, fallback: T): T => {
      try {
        const item = localStorage.getItem(`${prefix}_${key}`);
        return item ? JSON.parse(item) : fallback;
      } catch {
        return fallback;
      }
    };

    return {
      projects: getSaved<Project[]>('projects', []),
      clients: getSaved<Client[]>('clients', []),
      swotItems: getSaved<SwotItem[]>('swot', []),
      ganttTasks: getSaved<GanttTask[]>('gantt', []),
      ishikawaAnalyses: getSaved<IshikawaAnalysis[]>('ishikawa', []),
      actions5W2H: getSaved<Action5W2H[]>('5w2h', []),
      risks: getSaved<RiskItem[]>('risks', []),
      paretoItems: getSaved<ParetoItem[]>('pareto', []),
      pestelItems: getSaved<PestelItem[]>('pestel', []),
      stakeholders: getSaved<StakeholderItem[]>('stakeholders', []),
      canvasModels: getSaved<CanvasModel[]>('canvas', []),
      okrs: getSaved<OkrObjective[]>('okrs', []),
      climateSurveys: getSaved<ClimateSurvey[]>('climate', []),
      bscObjectives: getSaved<BSCObjective[]>('bsc_objectives', initialBscObjectives),
      contracts: getSaved<ConsultingContract[]>('contracts', initialContracts),
      meetings: getSaved<MeetingSimulation[]>('meetings', initialMeetings),
      reportConfig: getSaved<ConsultingReportConfig>('report', initialReportConfig),
      settings: getSaved<AppSettings>('settings', { ...initialSettings, consultancyName: groupName }),
    };
  } else {
    // If it's the demo group 'Grupo 01', seed with demo data
    if (groupName === 'Grupo 01' || groupName === 'Consultoria Estratégica Alpha') {
      return {
        projects: initialProjects,
        clients: initialClients,
        swotItems: initialSwotItems,
        ganttTasks: initialGanttTasks,
        ishikawaAnalyses: initialIshikawaAnalyses,
        actions5W2H: initialActions5W2H,
        risks: initialRisks,
        paretoItems: initialParetoItems,
        pestelItems: initialPestelItems,
        stakeholders: initialStakeholders,
        canvasModels: initialCanvasModels,
        okrs: initialOkrs,
        climateSurveys: initialClimateSurveys,
        bscObjectives: initialBscObjectives,
        contracts: initialContracts,
        meetings: initialMeetings,
        reportConfig: initialReportConfig,
        settings: initialSettings,
      };
    }

    // If it's the Professor group
    if (isProfessorGroup(groupName)) {
      const professorProjects: Project[] = [
        {
          id: `proj-prof-${Date.now()}`,
          name: 'Supervisão Docente & Projetos de Consultoria',
          clientId: 'cli-prof-1',
          clientName: 'FAATESP - Coordenação Acadêmica de Consultoria',
          segment: 'Educação Executiva & Consultoria',
          description: 'Ambiente central de mentoria e supervisão dos projetos de consultoria estratégica dos Grupos 01 a 05.',
          mainObjective: 'Acompanhar, avaliar e mentorar os diagnósticos, matrizes SWOT, BSC, 5W2H e entregáveis dos grupos.',
          leadConsultant: 'Prof. Rogério Augusto',
          team: ['Prof. Rogério Augusto', 'Equipe Docente FAATESP'],
          startDate: new Date().toISOString().split('T')[0],
          expectedEndDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
          status: 'Em andamento',
          priority: 'Alta',
          budget: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const professorClients: Client[] = [
        {
          id: 'cli-prof-1',
          name: 'FAATESP - Coordenação de Consultoria',
          contactPerson: 'Prof. Rogério Augusto',
          role: 'Coordenador / Professor Orientador',
          phone: '',
          email: PROFESSOR_AUTHORIZED_EMAIL,
          city: 'São Paulo',
          country: 'Brasil',
          segment: 'Educação Executiva',
          relationshipOrigin: 'Supervisão Docente',
          relationshipStatus: 'Ativo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return {
        projects: professorProjects,
        clients: professorClients,
        swotItems: [],
        ganttTasks: [],
        ishikawaAnalyses: [],
        actions5W2H: [],
        risks: [],
        paretoItems: [],
        pestelItems: [],
        stakeholders: [],
        canvasModels: [],
        okrs: [],
        climateSurveys: [],
        bscObjectives: initialBscObjectives,
        contracts: initialContracts,
        meetings: initialMeetings,
        reportConfig: {
          ...initialReportConfig,
          consultantName: 'Prof. Rogério Augusto',
          title: 'Relatório Consolidado de Supervisão de Projetos',
        },
        settings: {
          ...initialSettings,
          consultancyName: 'Supervisão Docente FAATESP',
          consultantDefaultName: 'Prof. Rogério Augusto',
        },
      };
    }

    // Brand new clean environment for any new group!
    const defaultUser = userEmail ? userEmail.split('@')[0] : 'Consultor';
    const cleanProjects: Project[] = [
      {
        id: `proj-${Date.now()}`,
        name: `Diagnóstico & Estratégia - ${groupName || 'Novo Grupo'}`,
        clientId: 'cli-1',
        clientName: 'Organização Principal',
        segment: 'Geral',
        description: `Ambiente limpo iniciado para o grupo ${groupName || 'Novo'}. Pronto para cadastro de diagnósticos, matrizes e planos de ação.`,
        mainObjective: 'Estruturação do plano de consultoria e melhoria contínua',
        leadConsultant: defaultUser,
        team: [defaultUser],
        startDate: new Date().toISOString().split('T')[0],
        expectedEndDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        status: 'Planejamento',
        priority: 'Alta',
        budget: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const cleanClients: Client[] = [
      {
        id: 'cli-1',
        name: 'Organização Principal',
        contactPerson: 'Responsável / Gestor',
        role: 'Líder do Projeto',
        phone: '',
        email: userEmail || '',
        city: '',
        country: 'Brasil',
        segment: 'Corporativo',
        relationshipOrigin: 'Novo Diagnóstico',
        relationshipStatus: 'Ativo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return {
      projects: cleanProjects,
      clients: cleanClients,
      swotItems: [],
      ganttTasks: [],
      ishikawaAnalyses: [],
      actions5W2H: [],
      risks: [],
      paretoItems: [],
      pestelItems: [],
      stakeholders: [],
      canvasModels: [],
      okrs: [],
      climateSurveys: [],
      bscObjectives: [],
      contracts: [],
      meetings: [],
      reportConfig: {
        ...initialReportConfig,
        consultantName: defaultUser,
        title: `Relatório Executivo - ${groupName || 'Consultoria'}`,
      },
      settings: {
        ...initialSettings,
        consultancyName: groupName || 'Consultoria Pro',
        consultantDefaultName: defaultUser,
      },
    };
  }
};

export const ConsultingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [availableGroups, setAvailableGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Merge to ensure defaultAvailableGroups (including 'Professor') are present
          return Array.from(new Set([...defaultAvailableGroups, ...parsed]));
        }
      }
      return defaultAvailableGroups;
    } catch {
      return defaultAvailableGroups;
    }
  });

  const currentGroup = currentUser?.group || '';

  // Initial group data
  const initialGroupData = useMemo(() => {
    const activeGroup = currentUser?.group || 'Grupo 01';
    return loadDataForGroup(activeGroup, currentUser?.email || '');
  }, []);

  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    return initialGroupData.projects[0]?.id || 'proj-1';
  });

  // Core entities
  const [projects, setProjects] = useState<Project[]>(initialGroupData.projects);
  const [clients, setClients] = useState<Client[]>(initialGroupData.clients);
  const [swotItems, setSwotItems] = useState<SwotItem[]>(initialGroupData.swotItems);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(initialGroupData.ganttTasks);
  const [ishikawaAnalyses, setIshikawaAnalyses] = useState<IshikawaAnalysis[]>(initialGroupData.ishikawaAnalyses);
  const [actions5W2H, setActions5W2H] = useState<Action5W2H[]>(initialGroupData.actions5W2H);
  const [risks, setRisks] = useState<RiskItem[]>(initialGroupData.risks);
  const [paretoItems, setParetoItems] = useState<ParetoItem[]>(initialGroupData.paretoItems);
  const [pestelItems, setPestelItems] = useState<PestelItem[]>(initialGroupData.pestelItems);
  const [stakeholders, setStakeholders] = useState<StakeholderItem[]>(initialGroupData.stakeholders);
  const [canvasModels, setCanvasModels] = useState<CanvasModel[]>(initialGroupData.canvasModels);
  const [okrs, setOkrs] = useState<OkrObjective[]>(initialGroupData.okrs);
  const [climateSurveys, setClimateSurveys] = useState<ClimateSurvey[]>(initialGroupData.climateSurveys);
  const [bscObjectives, setBscObjectives] = useState<BSCObjective[]>(initialGroupData.bscObjectives || initialBscObjectives);
  const [contracts, setContracts] = useState<ConsultingContract[]>(initialGroupData.contracts || initialContracts);
  const [meetings, setMeetings] = useState<MeetingSimulation[]>(initialGroupData.meetings || initialMeetings);
  const [selectedClimateSurveyId, setSelectedClimateSurveyId] = useState<string | null>(null);
  const [reportConfig, setReportConfig] = useState<ConsultingReportConfig>(initialGroupData.reportConfig);
  const [settings, setSettings] = useState<AppSettings>(initialGroupData.settings);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to group-isolated LocalStorage
  useEffect(() => {
    if (!currentUser?.group) return;
    const prefix = getGroupStoragePrefix(currentUser.group);
    try {
      localStorage.setItem(`${prefix}_initialized`, 'true');
      localStorage.setItem(`${prefix}_projects`, JSON.stringify(projects));
      localStorage.setItem(`${prefix}_clients`, JSON.stringify(clients));
      localStorage.setItem(`${prefix}_swot`, JSON.stringify(swotItems));
      localStorage.setItem(`${prefix}_gantt`, JSON.stringify(ganttTasks));
      localStorage.setItem(`${prefix}_ishikawa`, JSON.stringify(ishikawaAnalyses));
      localStorage.setItem(`${prefix}_5w2h`, JSON.stringify(actions5W2H));
      localStorage.setItem(`${prefix}_risks`, JSON.stringify(risks));
      localStorage.setItem(`${prefix}_pareto`, JSON.stringify(paretoItems));
      localStorage.setItem(`${prefix}_pestel`, JSON.stringify(pestelItems));
      localStorage.setItem(`${prefix}_stakeholders`, JSON.stringify(stakeholders));
      localStorage.setItem(`${prefix}_canvas`, JSON.stringify(canvasModels));
      localStorage.setItem(`${prefix}_okrs`, JSON.stringify(okrs));
      localStorage.setItem(`${prefix}_climate`, JSON.stringify(climateSurveys));
      localStorage.setItem(`${prefix}_bsc_objectives`, JSON.stringify(bscObjectives));
      localStorage.setItem(`${prefix}_contracts`, JSON.stringify(contracts));
      localStorage.setItem(`${prefix}_meetings`, JSON.stringify(meetings));
      localStorage.setItem(`${prefix}_report`, JSON.stringify(reportConfig));
      localStorage.setItem(`${prefix}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [
    currentUser?.group,
    projects,
    clients,
    swotItems,
    ganttTasks,
    ishikawaAnalyses,
    actions5W2H,
    risks,
    paretoItems,
    pestelItems,
    stakeholders,
    canvasModels,
    okrs,
    climateSurveys,
    bscObjectives,
    contracts,
    meetings,
    reportConfig,
    settings,
  ]);

  // Auth & Group Actions
  const login = (email: string, group: string) => {
    const cleanEmail = email.trim();
    const cleanGroup = group.trim();
    if (!cleanEmail || !cleanGroup) {
      showToast('Por favor, informe seu e-mail e grupo de trabalho.', 'warning');
      return;
    }

    // Security Restriction: Only authorized professor email can access the Professor group/role
    if (isProfessorGroup(cleanGroup) && !isProfessorEmail(cleanEmail)) {
      showToast(
        'Acesso Restrito: Este ambiente é exclusivo da coordenação e docência. Por favor, acesse através do seu grupo de consultoria.',
        'error'
      );
      return;
    }

    setAvailableGroups((prev) => {
      if (!prev.includes(cleanGroup)) {
        const updated = [...prev, cleanGroup];
        try {
          localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      }
      return prev;
    });

    const session: UserSession = {
      email: cleanEmail,
      group: cleanGroup,
      name: cleanEmail.split('@')[0],
      loggedInAt: new Date().toISOString(),
    };

    setCurrentUser(session);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error(e);
    }

    // Load data for this group
    const data = loadDataForGroup(cleanGroup, cleanEmail);
    setProjects(data.projects);
    setClients(data.clients);
    setSwotItems(data.swotItems);
    setGanttTasks(data.ganttTasks);
    setIshikawaAnalyses(data.ishikawaAnalyses);
    setActions5W2H(data.actions5W2H);
    setRisks(data.risks);
    setParetoItems(data.paretoItems);
    setPestelItems(data.pestelItems);
    setStakeholders(data.stakeholders);
    setCanvasModels(data.canvasModels);
    setOkrs(data.okrs);
    setClimateSurveys(data.climateSurveys);
    setBscObjectives(data.bscObjectives || initialBscObjectives);
    setContracts(data.contracts || initialContracts);
    setMeetings(data.meetings || initialMeetings);
    setReportConfig(data.reportConfig);
    setSettings(data.settings);

    if (data.projects.length > 0) {
      setCurrentProjectId(data.projects[0].id);
    }
    setActiveModule('dashboard');
    showToast(`Conectado ao grupo: ${cleanGroup}`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  const switchGroup = (newGroup: string) => {
    if (!currentUser) return;
    const cleanNewGroup = newGroup.trim();

    // Security Restriction on switching groups
    if (isProfessorGroup(cleanNewGroup) && !isProfessorEmail(currentUser.email)) {
      showToast(
        'Acesso Restrito: Este ambiente é exclusivo da coordenação e docência. Por favor, acesse através do seu grupo de consultoria.',
        'error'
      );
      return;
    }

    login(currentUser.email, cleanNewGroup);
  };

  const createGroup = (groupName: string) => {
    const clean = groupName.trim();
    if (!clean) return;
    setAvailableGroups((prev) => {
      if (!prev.includes(clean)) {
        const updated = [...prev, clean];
        try {
          localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      }
      return prev;
    });
  };

  const deleteGroupData = (groupName: string) => {
    const prefix = getGroupStoragePrefix(groupName);
    const keys = [
      'initialized', 'projects', 'clients', 'swot', 'gantt', 'ishikawa',
      '5w2h', 'risks', 'pareto', 'pestel', 'stakeholders', 'canvas',
      'okrs', 'climate', 'report', 'settings'
    ];
    keys.forEach((k) => localStorage.removeItem(`${prefix}_${k}`));
    showToast(`Dados do grupo "${groupName}" foram limpos.`, 'info');
  };

  const cleanCurrentGroupData = () => {
    if (!currentUser?.group) return;
    const clean = loadDataForGroup('', currentUser.email);
    setProjects(clean.projects);
    setClients(clean.clients);
    setSwotItems([]);
    setGanttTasks([]);
    setIshikawaAnalyses([]);
    setActions5W2H([]);
    setRisks([]);
    setParetoItems([]);
    setPestelItems([]);
    setStakeholders([]);
    setCanvasModels([]);
    setOkrs([]);
    setClimateSurveys([]);
    if (clean.projects.length > 0) {
      setCurrentProjectId(clean.projects[0].id);
    }
    showToast(`Ambiente do grupo "${currentUser.group}" reiniciado e limpo!`, 'info');
  };

  // Derived current project
  const currentProject = useMemo(() => {
    const found = projects.find((p) => p.id === currentProjectId);
    return found || projects[0];
  }, [projects, currentProjectId]);

  // Ensure valid currentProjectId
  useEffect(() => {
    if (!projects.find((p) => p.id === currentProjectId) && projects.length > 0) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, currentProjectId]);

  // Helpers
  const formatCurrency = (val: number = 0) => {
    const symbol = settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : 'R$';
    return `${symbol} ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateRiskClass = (score: number): RiskClassification => {
    if (score >= settings.riskThresholds.critical) return 'Crítico';
    if (score >= settings.riskThresholds.high) return 'Alto';
    if (score >= settings.riskThresholds.moderate) return 'Moderado';
    return 'Baixo';
  };

  // Filtered by project
  const currentProjectSwot = useMemo(
    () => swotItems.filter((i) => i.projectId === currentProjectId),
    [swotItems, currentProjectId]
  );

  const currentProjectTasks = useMemo(
    () => ganttTasks.filter((t) => t.projectId === currentProjectId),
    [ganttTasks, currentProjectId]
  );

  const currentProjectIshikawa = useMemo(
    () => ishikawaAnalyses.find((a) => a.projectId === currentProjectId) || {
      id: `ishi-${currentProjectId}`,
      projectId: currentProjectId,
      problem: 'Defina o problema principal a ser analisado',
      problemDescription: '',
      analysisDate: new Date().toISOString().split('T')[0],
      responsible: currentProject?.leadConsultant || 'Consultor',
      categories: settings.customIshikawaCategories,
      causes: [],
      createdAt: new Date().toISOString(),
    },
    [ishikawaAnalyses, currentProjectId, currentProject, settings.customIshikawaCategories]
  );

  const currentProjectActions = useMemo(
    () => actions5W2H.filter((a) => a.projectId === currentProjectId),
    [actions5W2H, currentProjectId]
  );

  const currentProjectRisks = useMemo(
    () => risks.filter((r) => r.projectId === currentProjectId),
    [risks, currentProjectId]
  );

  const currentProjectPareto = useMemo(
    () => paretoItems.filter((p) => p.projectId === currentProjectId),
    [paretoItems, currentProjectId]
  );

  const currentProjectPestel = useMemo(
    () => pestelItems.filter((p) => p.projectId === currentProjectId),
    [pestelItems, currentProjectId]
  );

  const currentProjectStakeholders = useMemo(
    () => stakeholders.filter((s) => s.projectId === currentProjectId),
    [stakeholders, currentProjectId]
  );

  const currentProjectCanvas = useMemo(
    () =>
      canvasModels.find((c) => c.projectId === currentProjectId) || {
        id: `canvas-${currentProjectId}`,
        projectId: currentProjectId,
        title: `Canvas - ${currentProject?.name || 'Novo Projeto'}`,
        type: 'business_model',
        blocks: {
          keyPartners: [],
          keyActivities: [],
          keyResources: [],
          valuePropositions: [],
          customerRelationships: [],
          channels: [],
          customerSegments: [],
          costStructure: [],
          revenueStreams: [],
        },
        updatedAt: new Date().toISOString(),
      },
    [canvasModels, currentProjectId, currentProject]
  );

  const currentProjectOkrs = useMemo(
    () => okrs.filter((o) => o.projectId === currentProjectId),
    [okrs, currentProjectId]
  );

  const currentProjectClimateSurveys = useMemo(
    () => climateSurveys.filter((c) => c.projectId === currentProjectId),
    [climateSurveys, currentProjectId]
  );

  const currentClimateSurvey = useMemo(() => {
    if (selectedClimateSurveyId) {
      const found = currentProjectClimateSurveys.find((c) => c.id === selectedClimateSurveyId);
      if (found) return found;
    }
    return currentProjectClimateSurveys[0];
  }, [currentProjectClimateSurveys, selectedClimateSurveyId]);

  // Dynamic Notifications calculation
  const notifications = useMemo(() => {
    const notifs: AppNotification[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Check overdue actions
    currentProjectActions.forEach((act) => {
      if (act.status !== 'Concluída' && act.status !== 'Cancelada' && act.when < today) {
        notifs.push({
          id: `notif-act-overdue-${act.id}`,
          type: 'warning',
          title: 'Ação 5W2H Atrasada',
          message: `A ação "${act.what.substring(0, 45)}..." venceu em ${act.when}.`,
          targetModule: '5w2h',
          relatedId: act.id,
          date: today,
          isRead: false,
        });
      }
    });

    // Check critical risks
    currentProjectRisks.forEach((r) => {
      if (r.classification === 'Crítico' && r.status !== 'Mitigado' && r.status !== 'Encerrado') {
        notifs.push({
          id: `notif-risk-crit-${r.id}`,
          type: 'critical',
          title: 'Risco Crítico Ativo',
          message: `Risco pontuação ${r.riskScore}: "${r.risk.substring(0, 45)}..." requer plano urgente.`,
          targetModule: 'risks',
          relatedId: r.id,
          date: today,
          isRead: false,
        });
      }
    });

    // Check gantt tasks ending next 7 days
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().split('T')[0];

    currentProjectTasks.forEach((t) => {
      if (t.status !== 'Concluído' && t.status !== 'Cancelado' && t.endDate >= today && t.endDate <= next7DaysStr) {
        notifs.push({
          id: `notif-task-near-${t.id}`,
          type: 'info',
          title: 'Entrega nos Próximos 7 Dias',
          message: `A tarefa "${t.name}" tem término previsto para ${t.endDate}.`,
          targetModule: 'gantt',
          relatedId: t.id,
          date: today,
          isRead: false,
        });
      }
    });

    return notifs;
  }, [currentProjectActions, currentProjectRisks, currentProjectTasks]);

  // Project CRUD
  const addProject = (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `proj-${Date.now()}`;
    const newP: Project = {
      ...p,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newP, ...prev]);
    setCurrentProjectId(id);
    showToast(`Projeto "${newP.name}" criado com sucesso!`);
    return id;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    showToast('Projeto atualizado com sucesso!');
  };

  const duplicateProject = (id: string) => {
    const original = projects.find((p) => p.id === id);
    if (!original) return '';
    const newId = `proj-${Date.now()}`;
    const dup: Project = {
      ...original,
      id: newId,
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [dup, ...prev]);

    // Duplicate project tools items
    const origSwot = swotItems.filter((i) => i.projectId === id);
    const newSwot = origSwot.map((s) => ({ ...s, id: `swot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, projectId: newId }));
    setSwotItems((prev) => [...prev, ...newSwot]);

    const origGantt = ganttTasks.filter((t) => t.projectId === id);
    const newGantt = origGantt.map((t) => ({ ...t, id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, projectId: newId }));
    setGanttTasks((prev) => [...prev, ...newGantt]);

    const origIshikawa = ishikawaAnalyses.filter((a) => a.projectId === id);
    const newIshikawa = origIshikawa.map((a) => ({
      ...a,
      id: `ishi-${newId}`,
      projectId: newId,
      causes: a.causes.map((c) => ({
        ...c,
        id: `cause-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        subcauses: c.subcauses?.map((sub) => ({
          ...sub,
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        })),
      })),
    }));
    setIshikawaAnalyses((prev) => [...prev, ...newIshikawa]);

    const orig5W2H = actions5W2H.filter((a) => a.projectId === id);
    const new5W2H = orig5W2H.map((a) => ({ ...a, id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, projectId: newId }));
    setActions5W2H((prev) => [...prev, ...new5W2H]);

    const origRisks = risks.filter((r) => r.projectId === id);
    const newRisks = origRisks.map((r) => ({ ...r, id: `risk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, projectId: newId }));
    setRisks((prev) => [...prev, ...newRisks]);

    const origPareto = paretoItems.filter((p) => p.projectId === id);
    const newPareto = origPareto.map((p) => ({ ...p, id: `par-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, projectId: newId }));
    setParetoItems((prev) => [...prev, ...newPareto]);

    const origPestel = pestelItems.filter((p) => p.projectId === id);
    const newPestel = origPestel.map((p) => ({ ...p, id: `pest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, projectId: newId }));
    setPestelItems((prev) => [...prev, ...newPestel]);

    const origStakeholders = stakeholders.filter((s) => s.projectId === id);
    const newStakeholders = origStakeholders.map((s) => ({ ...s, id: `stk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, projectId: newId }));
    setStakeholders((prev) => [...prev, ...newStakeholders]);

    const origCanvas = canvasModels.filter((c) => c.projectId === id);
    const newCanvas = origCanvas.map((c) => ({
      ...c,
      id: `canvas-${newId}`,
      projectId: newId,
      title: `Canvas - ${dup.name}`,
      blocks: Object.entries(c.blocks || {}).reduce<Record<string, CanvasCard[]>>((acc, [k, cards]) => {
        acc[k] = (Array.isArray(cards) ? (cards as CanvasCard[]) : []).map((card) => ({
          ...card,
          id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        }));
        return acc;
      }, {}),
    }));
    setCanvasModels((prev) => [...prev, ...newCanvas]);

    const origOkrs = okrs.filter((o) => o.projectId === id);
    const newOkrs = origOkrs.map((o) => ({
      ...o,
      id: `okr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: newId,
      keyResults: o.keyResults.map((kr) => ({
        ...kr,
        id: `kr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      })),
    }));
    setOkrs((prev) => [...prev, ...newOkrs]);

    const origClimate = climateSurveys.filter((c) => c.projectId === id);
    const newClimate = origClimate.map((c) => ({
      ...c,
      id: `clim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: newId,
      questions: c.questions.map((q) => ({
        ...q,
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      })),
      feedbackComments: c.feedbackComments.map((com) => ({
        ...com,
        id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      })),
    }));
    setClimateSurveys((prev) => [...prev, ...newClimate]);

    setCurrentProjectId(newId);
    showToast(`Projeto duplicado como "${dup.name}"!`);
    return newId;
  };

  const archiveProject = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isArchived: !p.isArchived, updatedAt: new Date().toISOString() } : p))
    );
    showToast('Status de arquivamento do projeto alterado.');
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      showToast('Não é possível excluir o único projeto restante.', 'warning');
      return;
    }
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);

    // Fallback current project if active project was deleted
    if (currentProjectId === id && remaining.length > 0) {
      setCurrentProjectId(remaining[0].id);
    }

    // Clean associated items across all modules
    setSwotItems((prev) => prev.filter((i) => i.projectId !== id));
    setGanttTasks((prev) => prev.filter((t) => t.projectId !== id));
    setIshikawaAnalyses((prev) => prev.filter((a) => a.projectId !== id));
    setActions5W2H((prev) => prev.filter((a) => a.projectId !== id));
    setRisks((prev) => prev.filter((r) => r.projectId !== id));
    setParetoItems((prev) => prev.filter((p) => p.projectId !== id));
    setPestelItems((prev) => prev.filter((p) => p.projectId !== id));
    setStakeholders((prev) => prev.filter((s) => s.projectId !== id));
    setCanvasModels((prev) => prev.filter((c) => c.projectId !== id));
    setOkrs((prev) => prev.filter((o) => o.projectId !== id));
    setClimateSurveys((prev) => prev.filter((c) => c.projectId !== id));

    showToast('Projeto e todos os seus registros excluídos com sucesso.', 'info');
  };

  // Client CRUD
  const addClient = (c: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `client-${Date.now()}`;
    const newC: Client = {
      ...c,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients((prev) => [newC, ...prev]);
    showToast(`Cliente "${newC.name}" cadastrado!`);
    return id;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    showToast('Dados do cliente atualizados.');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('Cliente removido.');
  };

  // SWOT CRUD
  const addSwotItem = (item: Omit<SwotItem, 'id' | 'createdAt' | 'projectId'>) => {
    const newItem: SwotItem = {
      ...item,
      id: `swot-${Date.now()}`,
      projectId: currentProjectId,
      createdAt: new Date().toISOString(),
    };
    setSwotItems((prev) => [...prev, newItem]);
    showToast('Fator SWOT adicionado!');
  };

  const updateSwotItem = (id: string, updates: Partial<SwotItem>) => {
    setSwotItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Fator SWOT atualizado.');
  };

  const toggleSelectSwotItem = (id: string) => {
    const target = swotItems.find((s) => s.id === id);
    if (!target) return;
    
    // Check if adding exceeds max
    if (!target.isSelected) {
      const currentSelectedCount = currentProjectSwot.filter(
        (s) => s.category === target.category && s.isSelected
      ).length;
      if (currentSelectedCount >= settings.swotMaxItemsPerQuadrant) {
        showToast(
          `Aviso: O quadrante ${target.category} já possui ${settings.swotMaxItemsPerQuadrant} itens selecionados para a matriz executiva.`,
          'warning'
        );
      }
    }

    setSwotItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isSelected: !s.isSelected } : s))
    );
  };

  const deleteSwotItem = (id: string) => {
    setSwotItems((prev) => prev.filter((s) => s.id !== id));
    showToast('Fator SWOT removido.');
  };

  const duplicateSwotItem = (id: string) => {
    const orig = swotItems.find((s) => s.id === id);
    if (!orig) return;
    const dup: SwotItem = {
      ...orig,
      id: `swot-${Date.now()}`,
      factor: `${orig.factor} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    setSwotItems((prev) => [...prev, dup]);
    showToast('Fator SWOT duplicado.');
  };

  // Gantt CRUD
  const addGanttTask = (task: Omit<GanttTask, 'id' | 'createdAt' | 'projectId'>) => {
    const newTask: GanttTask = {
      ...task,
      id: `task-${Date.now()}`,
      projectId: currentProjectId,
      createdAt: new Date().toISOString(),
    };
    setGanttTasks((prev) => [...prev, newTask]);
    showToast('Tarefa do cronograma adicionada!');
  };

  const updateGanttTask = (id: string, updates: Partial<GanttTask>) => {
    setGanttTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Tarefa atualizada.');
  };

  const deleteGanttTask = (id: string) => {
    setGanttTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Tarefa removida.');
  };

  const duplicateGanttTask = (id: string) => {
    const orig = ganttTasks.find((t) => t.id === id);
    if (!orig) return;
    const dup: GanttTask = {
      ...orig,
      id: `task-${Date.now()}`,
      name: `${orig.name} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    setGanttTasks((prev) => [...prev, dup]);
    showToast('Tarefa duplicada.');
  };

  // Ishikawa
  const saveIshikawaAnalysis = (data: Partial<IshikawaAnalysis>) => {
    setIshikawaAnalyses((prev) => {
      const exists = prev.find((a) => a.projectId === currentProjectId);
      if (exists) {
        return prev.map((a) => (a.projectId === currentProjectId ? { ...a, ...data } : a));
      } else {
        return [
          ...prev,
          {
            id: `ishi-${currentProjectId}`,
            projectId: currentProjectId,
            problem: data.problem || 'Problema em análise',
            problemDescription: data.problemDescription || '',
            analysisDate: data.analysisDate || new Date().toISOString().split('T')[0],
            responsible: data.responsible || currentProject?.leadConsultant || 'Consultor',
            categories: data.categories || settings.customIshikawaCategories,
            causes: data.causes || [],
            createdAt: new Date().toISOString(),
          },
        ];
      }
    });
    showToast('Diagrama de Ishikawa salvo com sucesso.');
  };

  const addIshikawaCause = (cause: Omit<IshikawaCause, 'id'>) => {
    const newCause: IshikawaCause = {
      ...cause,
      id: `cause-${Date.now()}`,
    };
    setIshikawaAnalyses((prev) => {
      const exists = prev.find((a) => a.projectId === currentProjectId);
      if (exists) {
        return prev.map((a) =>
          a.projectId === currentProjectId ? { ...a, causes: [...a.causes, newCause] } : a
        );
      } else {
        return [
          ...prev,
          {
            id: `ishi-${currentProjectId}`,
            projectId: currentProjectId,
            problem: 'Problema em análise',
            problemDescription: '',
            analysisDate: new Date().toISOString().split('T')[0],
            responsible: currentProject?.leadConsultant || 'Consultor',
            categories: settings.customIshikawaCategories,
            causes: [newCause],
            createdAt: new Date().toISOString(),
          },
        ];
      }
    });
    showToast('Causa adicionada ao diagrama!');
  };

  const updateIshikawaCause = (causeId: string, updates: Partial<IshikawaCause>) => {
    setIshikawaAnalyses((prev) =>
      prev.map((a) =>
        a.projectId === currentProjectId
          ? {
              ...a,
              causes: a.causes.map((c) => (c.id === causeId ? { ...c, ...updates } : c)),
            }
          : a
      )
    );
    showToast('Causa atualizada.');
  };

  const deleteIshikawaCause = (causeId: string) => {
    setIshikawaAnalyses((prev) =>
      prev.map((a) =>
        a.projectId === currentProjectId
          ? {
              ...a,
              causes: a.causes.filter((c) => c.id !== causeId),
            }
          : a
      )
    );
    showToast('Causa removida.');
  };

  // 5W2H CRUD
  const addAction5W2H = (action: Omit<Action5W2H, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => {
    const newAct: Action5W2H = {
      ...action,
      id: `act-${Date.now()}`,
      projectId: currentProjectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActions5W2H((prev) => [newAct, ...prev]);
    showToast('Ação 5W2H cadastrada!');
  };

  const updateAction5W2H = (id: string, updates: Partial<Action5W2H>) => {
    setActions5W2H((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
    showToast('Ação 5W2H atualizada.');
  };

  const deleteAction5W2H = (id: string) => {
    setActions5W2H((prev) => prev.filter((a) => a.id !== id));
    showToast('Ação 5W2H excluída.');
  };

  const duplicateAction5W2H = (id: string) => {
    const orig = actions5W2H.find((a) => a.id === id);
    if (!orig) return;
    const dup: Action5W2H = {
      ...orig,
      id: `act-${Date.now()}`,
      what: `${orig.what} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActions5W2H((prev) => [dup, ...prev]);
    showToast('Ação 5W2H duplicada.');
  };

  // Risks CRUD
  const addRisk = (
    r: Omit<RiskItem, 'id' | 'createdAt' | 'riskScore' | 'classification' | 'projectId'>
  ) => {
    const riskScore = r.probability * r.impact;
    const classification = calculateRiskClass(riskScore);
    const newRisk: RiskItem = {
      ...r,
      id: `risk-${Date.now()}`,
      projectId: currentProjectId,
      riskScore,
      classification,
      createdAt: new Date().toISOString(),
    };
    setRisks((prev) => [newRisk, ...prev]);
    showToast('Risco registrado na matriz!');
  };

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const prob = updates.probability ?? r.probability;
          const imp = updates.impact ?? r.impact;
          const riskScore = prob * imp;
          const classification = calculateRiskClass(riskScore);
          return {
            ...r,
            ...updates,
            probability: prob,
            impact: imp,
            riskScore,
            classification,
          };
        }
        return r;
      })
    );
    showToast('Risco atualizado.');
  };

  const deleteRisk = (id: string) => {
    setRisks((prev) => prev.filter((r) => r.id !== id));
    showToast('Risco removido.');
  };

  const duplicateRisk = (id: string) => {
    const orig = risks.find((r) => r.id === id);
    if (!orig) return;
    const dup: RiskItem = {
      ...orig,
      id: `risk-${Date.now()}`,
      risk: `${orig.risk} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    setRisks((prev) => [dup, ...prev]);
    showToast('Risco duplicado.');
  };

  // Pareto CRUD
  const addParetoItem = (item: Omit<ParetoItem, 'id' | 'createdAt' | 'projectId'>) => {
    const newItem: ParetoItem = {
      ...item,
      id: `par-${Date.now()}`,
      projectId: currentProjectId,
      createdAt: new Date().toISOString(),
    };
    setParetoItems((prev) => [...prev, newItem]);
    showToast('Item cadastrado na Análise de Pareto!');
  };

  const updateParetoItem = (id: string, updates: Partial<ParetoItem>) => {
    setParetoItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Item de Pareto atualizado.');
  };

  const deleteParetoItem = (id: string) => {
    setParetoItems((prev) => prev.filter((p) => p.id !== id));
    showToast('Item removido.');
  };

  const duplicateParetoItem = (id: string) => {
    const orig = paretoItems.find((p) => p.id === id);
    if (!orig) return;
    const dup: ParetoItem = {
      ...orig,
      id: `par-${Date.now()}`,
      category: `${orig.category} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    setParetoItems((prev) => [...prev, dup]);
    showToast('Item duplicado.');
  };

  // PESTEL CRUD
  const addPestelItem = (item: Omit<PestelItem, 'id' | 'createdAt' | 'projectId'>) => {
    const newItem: PestelItem = {
      ...item,
      id: `pest-${Date.now()}`,
      projectId: currentProjectId,
      createdAt: new Date().toISOString(),
    };
    setPestelItems((prev) => [...prev, newItem]);
    showToast('Fator PESTEL registrado!');
  };

  const updatePestelItem = (id: string, updates: Partial<PestelItem>) => {
    setPestelItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Fator PESTEL atualizado.');
  };

  const deletePestelItem = (id: string) => {
    setPestelItems((prev) => prev.filter((p) => p.id !== id));
    showToast('Fator removido.');
  };

  const duplicatePestelItem = (id: string) => {
    const orig = pestelItems.find((p) => p.id === id);
    if (!orig) return;
    const dup: PestelItem = {
      ...orig,
      id: `pest-${Date.now()}`,
      factor: `${orig.factor} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    setPestelItems((prev) => [...prev, dup]);
    showToast('Fator duplicado.');
  };

  // Stakeholders CRUD
  const addStakeholder = (item: Omit<StakeholderItem, 'id' | 'createdAt' | 'projectId'>) => {
    const newItem: StakeholderItem = {
      ...item,
      id: `stk-${Date.now()}`,
      projectId: currentProjectId,
      createdAt: new Date().toISOString(),
    };
    setStakeholders((prev) => [...prev, newItem]);
    showToast('Stakeholder mapeado!');
  };

  const updateStakeholder = (id: string, updates: Partial<StakeholderItem>) => {
    setStakeholders((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Dados do stakeholder atualizados.');
  };

  const deleteStakeholder = (id: string) => {
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
    showToast('Stakeholder removido.');
  };

  const duplicateStakeholder = (id: string) => {
    const orig = stakeholders.find((s) => s.id === id);
    if (!orig) return;
    const dup: StakeholderItem = {
      ...orig,
      id: `stk-${Date.now()}`,
      name: `${orig.name} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    setStakeholders((prev) => [...prev, dup]);
    showToast('Stakeholder duplicado.');
  };

  // Canvas
  const saveCanvasModel = (model: Partial<CanvasModel>) => {
    setCanvasModels((prev) => {
      const exists = prev.find((c) => c.projectId === currentProjectId);
      if (exists) {
        return prev.map((c) =>
          c.projectId === currentProjectId
            ? { ...c, ...model, updatedAt: new Date().toISOString() }
            : c
        );
      } else {
        return [
          ...prev,
          {
            id: `canvas-${currentProjectId}`,
            projectId: currentProjectId,
            title: model.title || 'Canvas do Projeto',
            type: model.type || 'business_model',
            blocks: model.blocks || {},
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    });
    showToast('Canvas atualizado com sucesso.');
  };

  const addCanvasCard = (blockKey: string, cardText: string, color: string = 'blue') => {
    const card: CanvasCard = {
      id: `c-${Date.now()}`,
      text: cardText,
      color,
    };
    setCanvasModels((prev) => {
      const exists = prev.find((c) => c.projectId === currentProjectId);
      if (exists) {
        const blockCards = exists.blocks[blockKey] || [];
        return prev.map((c) =>
          c.projectId === currentProjectId
            ? {
                ...c,
                blocks: {
                  ...c.blocks,
                  [blockKey]: [...blockCards, card],
                },
                updatedAt: new Date().toISOString(),
              }
            : c
        );
      }
      return prev;
    });
    showToast('Cartão adicionado ao bloco!');
  };

  const updateCanvasCard = (blockKey: string, cardId: string, cardText: string, color?: string) => {
    setCanvasModels((prev) =>
      prev.map((c) => {
        if (c.projectId === currentProjectId) {
          const blockCards = c.blocks[blockKey] || [];
          return {
            ...c,
            blocks: {
              ...c.blocks,
              [blockKey]: blockCards.map((card) =>
                card.id === cardId ? { ...card, text: cardText, color: color || card.color } : card
              ),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    showToast('Cartão atualizado.');
  };

  const deleteCanvasCard = (blockKey: string, cardId: string) => {
    setCanvasModels((prev) =>
      prev.map((c) => {
        if (c.projectId === currentProjectId) {
          const blockCards = c.blocks[blockKey] || [];
          return {
            ...c,
            blocks: {
              ...c.blocks,
              [blockKey]: blockCards.filter((card) => card.id !== cardId),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    showToast('Cartão removido.');
  };

  const moveCanvasCard = (sourceBlockKey: string, targetBlockKey: string, cardId: string) => {
    if (sourceBlockKey === targetBlockKey) return;
    setCanvasModels((prev) =>
      prev.map((c) => {
        if (c.projectId === currentProjectId) {
          const sourceCards = c.blocks[sourceBlockKey] || [];
          const cardToMove = sourceCards.find((card) => card.id === cardId);
          if (!cardToMove) return c;

          const targetCards = c.blocks[targetBlockKey] || [];
          return {
            ...c,
            blocks: {
              ...c.blocks,
              [sourceBlockKey]: sourceCards.filter((card) => card.id !== cardId),
              [targetBlockKey]: [...targetCards, cardToMove],
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    showToast('Cartão movido de bloco.');
  };

  // OKRs CRUD
  const addOkr = (
    okr: Omit<OkrObjective, 'id' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'projectId'>
  ) => {
    const newOkr: OkrObjective = {
      ...okr,
      id: `okr-${Date.now()}`,
      projectId: currentProjectId,
      overallProgress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOkrs((prev) => [newOkr, ...prev]);
    showToast('Objetivo OKR cadastrado!');
  };

  const updateOkr = (id: string, updates: Partial<OkrObjective>) => {
    setOkrs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o))
    );
    showToast('OKR atualizado.');
  };

  const duplicateOkr = (id: string) => {
    const orig = okrs.find((o) => o.id === id);
    if (!orig) return;
    const dup: OkrObjective = {
      ...orig,
      id: `okr-${Date.now()}`,
      title: `${orig.title} (Cópia)`,
      keyResults: orig.keyResults.map((kr) => ({
        ...kr,
        id: `kr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOkrs((prev) => [dup, ...prev]);
    showToast(`Objetivo OKR "${dup.title}" duplicado com sucesso!`);
  };

  const deleteOkr = (id: string) => {
    setOkrs((prev) => prev.filter((o) => o.id !== id));
    showToast('OKR excluído.');
  };

  const calculateKrProgress = (initial: number, target: number, current: number): number => {
    const diff = target - initial;
    if (diff > 0) {
      return Math.min(100, Math.max(0, Math.round(((current - initial) / diff) * 100)));
    } else if (diff < 0) {
      return Math.min(100, Math.max(0, Math.round(((initial - current) / (initial - target)) * 100)));
    }
    return current >= target ? 100 : 0;
  };

  const addKeyResult = (okrId: string, kr: Omit<KeyResult, 'id' | 'progressPercent'>) => {
    const progress = calculateKrProgress(kr.initialValue, kr.targetValue, kr.currentValue);
    const newKr: KeyResult = {
      ...kr,
      id: `kr-${Date.now()}`,
      progressPercent: progress,
    };

    setOkrs((prev) =>
      prev.map((o) => {
        if (o.id === okrId) {
          const newKrs = [...o.keyResults, newKr];
          const avgProgress = Math.round(
            newKrs.reduce((acc, curr) => acc + curr.progressPercent, 0) / newKrs.length
          );
          return {
            ...o,
            keyResults: newKrs,
            overallProgress: avgProgress,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );
    showToast('Resultado-Chave (KR) adicionado!');
  };

  const updateKeyResult = (okrId: string, krId: string, updates: Partial<KeyResult>) => {
    setOkrs((prev) =>
      prev.map((o) => {
        if (o.id === okrId) {
          const newKrs = o.keyResults.map((kr) => {
            if (kr.id === krId) {
              const init = updates.initialValue ?? kr.initialValue;
              const target = updates.targetValue ?? kr.targetValue;
              const curr = updates.currentValue ?? kr.currentValue;
              const progress = calculateKrProgress(init, target, curr);
              return {
                ...kr,
                ...updates,
                initialValue: init,
                targetValue: target,
                currentValue: curr,
                progressPercent: progress,
              };
            }
            return kr;
          });
          const avgProgress = Math.round(
            newKrs.reduce((acc, curr) => acc + curr.progressPercent, 0) / newKrs.length
          );
          return {
            ...o,
            keyResults: newKrs,
            overallProgress: avgProgress,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );
    showToast('Resultado-Chave atualizado.');
  };

  const deleteKeyResult = (okrId: string, krId: string) => {
    setOkrs((prev) =>
      prev.map((o) => {
        if (o.id === okrId) {
          const newKrs = o.keyResults.filter((kr) => kr.id !== krId);
          const avgProgress =
            newKrs.length > 0
              ? Math.round(
                  newKrs.reduce((acc, curr) => acc + curr.progressPercent, 0) / newKrs.length
                )
              : 0;
          return {
            ...o,
            keyResults: newKrs,
            overallProgress: avgProgress,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );
    showToast('Resultado-Chave removido.');
  };

  const convertKRTo5W2H = (
    okrId: string,
    krId: string,
    actionWhat: string,
    responsible: string,
    deadline: string,
    cost: number = 0
  ) => {
    const okr = okrs.find((o) => o.id === okrId);
    const kr = okr?.keyResults.find((k) => k.id === krId);
    
    const newAction: Action5W2H = {
      id: `act-okr-${Date.now()}`,
      projectId: currentProjectId,
      what: actionWhat || `Ação para atingimento da meta: ${kr?.title || 'Resultado-Chave'}`,
      why: `Garantir o atingimento do Objetivo "${okr?.title || 'Estratégico'}" e do indicador ${kr?.indicator || 'KR'} (${kr?.currentValue ?? 0} -> ${kr?.targetValue ?? 0} ${kr?.unit ?? ''})`,
      where: 'Setor / Projeto de Consultoria',
      when: deadline || kr?.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      who: responsible || kr?.responsible || currentProject?.leadConsultant || 'Consultor',
      how: 'Execução do plano de intervenção operacional acordado com os stakeholders',
      howMuch: cost,
      priority: 'Alta',
      status: 'Não iniciada',
      progressPercent: 0,
      relatedOriginType: 'general',
      relatedOriginId: krId,
      notes: `Gerado a partir do OKR: ${okr?.title} (KR: ${kr?.title})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActions5W2H((prev) => [newAction, ...prev]);
    showToast('Plano de Ação 5W2H criado com sucesso a partir do Resultado-Chave!');
  };

  // Pesquisa de Clima Organizacional & eNPS
  const addClimateSurvey = (survey: Omit<ClimateSurvey, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>): string => {
    const newId = `climate-${Date.now()}`;
    const newSurvey: ClimateSurvey = {
      ...survey,
      id: newId,
      projectId: currentProjectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClimateSurveys((prev) => [newSurvey, ...prev]);
    setSelectedClimateSurveyId(newId);
    showToast('Pesquisa de Clima criada com sucesso!');
    return newId;
  };

  const updateClimateSurvey = (id: string, updates: Partial<ClimateSurvey>) => {
    setClimateSurveys((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
    showToast('Pesquisa de Clima atualizada com sucesso.');
  };

  const deleteClimateSurvey = (id: string) => {
    setClimateSurveys((prev) => prev.filter((s) => s.id !== id));
    if (selectedClimateSurveyId === id) {
      setSelectedClimateSurveyId(null);
    }
    showToast('Pesquisa de Clima excluída.');
  };

  const duplicateClimateSurvey = (id: string) => {
    const found = climateSurveys.find((s) => s.id === id);
    if (!found) return;
    const duplicatedId = `climate-${Date.now()}`;
    const duplicated: ClimateSurvey = {
      ...found,
      id: duplicatedId,
      title: `${found.title} (Cópia)`,
      cycle: `${found.cycle} - Cópia`,
      status: 'Planejada',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClimateSurveys((prev) => [duplicated, ...prev]);
    setSelectedClimateSurveyId(duplicatedId);
    showToast('Pesquisa duplicada como novo ciclo.');
  };

  const addClimateQuestion = (surveyId: string, q: Omit<ClimateQuestion, 'id'>) => {
    const newQ: ClimateQuestion = {
      ...q,
      id: `cq-${Date.now()}`,
    };
    setClimateSurveys((prev) =>
      prev.map((s) => {
        if (s.id === surveyId) {
          const updatedQuestions = [...s.questions, newQ];
          return {
            ...s,
            questions: updatedQuestions,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    showToast('Pergunta adicionada à pesquisa.');
  };

  const deleteClimateQuestion = (surveyId: string, qId: string) => {
    setClimateSurveys((prev) =>
      prev.map((s) => {
        if (s.id === surveyId) {
          return {
            ...s,
            questions: s.questions.filter((q) => q.id !== qId),
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    showToast('Pergunta removida.');
  };

  const addClimateFeedbackComment = (surveyId: string, c: Omit<ClimateFeedbackComment, 'id' | 'date'>) => {
    const newComment: ClimateFeedbackComment = {
      ...c,
      id: `fc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      convertedTo5W2H: false,
    };
    setClimateSurveys((prev) =>
      prev.map((s) => {
        if (s.id === surveyId) {
          return {
            ...s,
            feedbackComments: [newComment, ...s.feedbackComments],
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    showToast('Comentário qualitativo registrado.');
  };

  const deleteClimateFeedbackComment = (surveyId: string, cId: string) => {
    setClimateSurveys((prev) =>
      prev.map((s) => {
        if (s.id === surveyId) {
          return {
            ...s,
            feedbackComments: s.feedbackComments.filter((c) => c.id !== cId),
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    showToast('Comentário removido.');
  };

  const convertClimateCommentTo5W2H = (
    surveyId: string,
    commentId: string,
    actionWhat: string,
    responsible: string,
    deadline: string
  ) => {
    // 1. Mark comment as converted
    setClimateSurveys((prev) =>
      prev.map((s) => {
        if (s.id === surveyId) {
          return {
            ...s,
            feedbackComments: s.feedbackComments.map((c) =>
              c.id === commentId ? { ...c, convertedTo5W2H: true } : c
            ),
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    // 2. Create 5W2H action
    const newAction: Action5W2H = {
      id: `act-${Date.now()}`,
      projectId: currentProjectId,
      what: actionWhat,
      why: 'Oportunidade de melhoria identificada no Diagnóstico de Clima Organizacional / eNPS.',
      where: 'Áreas impactadas / Operação',
      when: deadline,
      startDate: new Date().toISOString().split('T')[0],
      who: responsible || currentProject?.leadConsultant || 'Consultor / RH',
      how: 'Estruturar plano de intervenção corretiva com os líderes setoriais e acompanhar quinzenalmente.',
      howMuch: 0,
      priority: 'Alta',
      status: 'Não iniciada',
      progressPercent: 0,
      relatedTool: 'Pesquisa de Clima',
      relatedOriginType: 'general',
      relatedOriginId: commentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActions5W2H((prev) => [newAction, ...prev]);
    showToast('Plano de ação 5W2H gerado com sucesso a partir do Clima!', 'success');
  };

  // Balanced Scorecard (BSC) CRUD
  const addBscObjective = (obj: Omit<BSCObjective, 'id' | 'projectId'>) => {
    const newObj: BSCObjective = {
      ...obj,
      id: `bsc-${Date.now()}`,
      projectId: currentProjectId,
    };
    setBscObjectives((prev) => [...prev, newObj]);
    showToast('Objetivo BSC adicionado com sucesso!');
  };

  const updateBscObjective = (id: string, updates: Partial<BSCObjective>) => {
    setBscObjectives((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    showToast('Objetivo BSC atualizado.');
  };

  const deleteBscObjective = (id: string) => {
    setBscObjectives((prev) => prev.filter((o) => o.id !== id));
    showToast('Objetivo BSC removido.');
  };

  // Contratos de Prestação de Serviço CRUD
  const addContract = (contract: Omit<ConsultingContract, 'id' | 'projectId'>) => {
    const newContract: ConsultingContract = {
      ...contract,
      id: `contract-${Date.now()}`,
      projectId: currentProjectId,
    };
    setContracts((prev) => [newContract, ...prev]);
    showToast('Contrato de Prestação de Serviço cadastrado com sucesso!');
  };

  const updateContract = (id: string, updates: Partial<ConsultingContract>) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Contrato de Prestação de Serviço atualizado com sucesso.');
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    showToast('Contrato removido.');
  };

  // Simulador de Reunião CRUD
  const addMeeting = (meeting: Omit<MeetingSimulation, 'id' | 'projectId'>) => {
    const newMeeting: MeetingSimulation = {
      ...meeting,
      id: `meeting-${Date.now()}`,
      projectId: currentProjectId,
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    showToast('Simulação de Reunião registrada com sucesso!');
  };

  const updateMeeting = (id: string, updates: Partial<MeetingSimulation>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    showToast('Simulação de Reunião atualizada.');
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    showToast('Simulação de Reunião excluída.');
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Configurações salvas!');
  };

  // Backup & Restore
  const exportAllDataJSON = () => {
    const payload = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      projects,
      clients,
      swotItems,
      ganttTasks,
      ishikawaAnalyses,
      actions5W2H,
      risks,
      paretoItems,
      pestelItems,
      stakeholders,
      canvasModels,
      okrs,
      climateSurveys,
      reportConfig,
      settings,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `consulthub_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup completo exportado em JSON com sucesso!');
  };

  const importDataJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.swotItems) setSwotItems(parsed.swotItems);
      if (parsed.ganttTasks) setGanttTasks(parsed.ganttTasks);
      if (parsed.ishikawaAnalyses) setIshikawaAnalyses(parsed.ishikawaAnalyses);
      if (parsed.actions5W2H) setActions5W2H(parsed.actions5W2H);
      if (parsed.risks) setRisks(parsed.risks);
      if (parsed.paretoItems) setParetoItems(parsed.paretoItems);
      if (parsed.pestelItems) setPestelItems(parsed.pestelItems);
      if (parsed.stakeholders) setStakeholders(parsed.stakeholders);
      if (parsed.canvasModels) setCanvasModels(parsed.canvasModels);
      if (parsed.okrs) setOkrs(parsed.okrs);
      if (parsed.climateSurveys) setClimateSurveys(parsed.climateSurveys);
      if (parsed.reportConfig) setReportConfig(parsed.reportConfig);
      if (parsed.settings) setSettings(parsed.settings);
      showToast('Dados restaurados com sucesso a partir do arquivo!', 'success');
      return true;
    } catch (e) {
      console.error('Error parsing JSON backup:', e);
      showToast('Erro ao importar arquivo. Verifique a estrutura do JSON.', 'error');
      return false;
    }
  };

  const resetToDemoData = () => {
    setProjects(initialProjects);
    setClients(initialClients);
    setSwotItems(initialSwotItems);
    setGanttTasks(initialGanttTasks);
    setIshikawaAnalyses(initialIshikawaAnalyses);
    setActions5W2H(initialActions5W2H);
    setRisks(initialRisks);
    setParetoItems(initialParetoItems);
    setPestelItems(initialPestelItems);
    setStakeholders(initialStakeholders);
    setCanvasModels(initialCanvasModels);
    setOkrs(initialOkrs);
    setClimateSurveys(initialClimateSurveys);
    setReportConfig(initialReportConfig);
    setSettings(initialSettings);
    setCurrentProjectId('proj-1');
    showToast('Base de demonstração restaurada com sucesso!');
  };

  return (
    <ConsultingContext.Provider
      value={{
        activeModule,
        setActiveModule,
        currentProjectId,
        setCurrentProjectId,
        currentProject,

        projects,
        addProject,
        updateProject,
        duplicateProject,
        archiveProject,
        deleteProject,

        clients,
        addClient,
        updateClient,
        deleteClient,

        swotItems,
        currentProjectSwot,
        addSwotItem,
        updateSwotItem,
        toggleSelectSwotItem,
        deleteSwotItem,
        duplicateSwotItem,

        ganttTasks,
        currentProjectTasks,
        addGanttTask,
        updateGanttTask,
        deleteGanttTask,
        duplicateGanttTask,

        ishikawaAnalyses,
        currentProjectIshikawa,
        saveIshikawaAnalysis,
        addIshikawaCause,
        updateIshikawaCause,
        deleteIshikawaCause,

        actions5W2H,
        currentProjectActions,
        addAction5W2H,
        updateAction5W2H,
        deleteAction5W2H,
        duplicateAction5W2H,

        risks,
        currentProjectRisks,
        addRisk,
        updateRisk,
        deleteRisk,
        duplicateRisk,

        paretoItems,
        currentProjectPareto,
        addParetoItem,
        updateParetoItem,
        deleteParetoItem,
        duplicateParetoItem,

        pestelItems,
        currentProjectPestel,
        addPestelItem,
        updatePestelItem,
        deletePestelItem,
        duplicatePestelItem,

        stakeholders,
        currentProjectStakeholders,
        addStakeholder,
        updateStakeholder,
        deleteStakeholder,
        duplicateStakeholder,

        canvasModels,
        currentProjectCanvas,
        saveCanvasModel,
        addCanvasCard,
        updateCanvasCard,
        deleteCanvasCard,
        moveCanvasCard,

        okrs,
        currentProjectOkrs,
        currentProjectOKRs: currentProjectOkrs,
        addOkr,
        updateOkr,
        duplicateOkr,
        deleteOkr,
        addObjective: addOkr,
        updateObjective: updateOkr,
        deleteObjective: deleteOkr,
        addKeyResult,
        updateKeyResult,
        deleteKeyResult,
        convertKRTo5W2H,

        climateSurveys,
        currentProjectClimateSurveys,
        currentClimateSurvey,
        selectedClimateSurveyId,
        setSelectedClimateSurveyId,
        addClimateSurvey,
        updateClimateSurvey,
        deleteClimateSurvey,
        duplicateClimateSurvey,
        addClimateQuestion,
        deleteClimateQuestion,
        addClimateFeedbackComment,
        deleteClimateFeedbackComment,
        convertClimateCommentTo5W2H,

        bscObjectives,
        addBscObjective,
        updateBscObjective,
        deleteBscObjective,

        contracts,
        addContract,
        updateContract,
        deleteContract,

        meetings,
        addMeeting,
        updateMeeting,
        deleteMeeting,

        reportConfig,
        setReportConfig,
        settings,
        updateSettings,

        notifications,
        toasts,
        showToast,
        removeToast,
        formatCurrency,
        calculateRiskClass,
        exportAllDataJSON,
        importDataJSON,
        resetToDemoData,

        // Auth & Group Management
        currentUser,
        currentGroup,
        availableGroups,
        login,
        logout,
        switchGroup,
        createGroup,
        deleteGroupData,
        cleanCurrentGroupData,
      }}
    >
      {children}
    </ConsultingContext.Provider>
  );
};

export const useConsulting = () => {
  const context = useContext(ConsultingContext);
  if (!context) {
    throw new Error('useConsulting must be used within a ConsultingProvider');
  }
  return context;
};
