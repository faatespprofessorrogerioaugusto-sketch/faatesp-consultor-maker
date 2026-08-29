import React, { useState, useMemo } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import {
  ClimateSurvey,
  ClimateDimensionScore,
  ClimateDepartmentScore,
  ClimateQuestion,
  ClimateFeedbackComment,
  ClimateDimensionKey,
} from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  MessageSquare,
  BarChart3,
  Layers,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Printer,
  Sparkles,
  ShieldAlert,
  Send,
  Sliders,
  CheckSquare,
  Building2,
  Filter,
} from 'lucide-react';

export const ClimateSurveyView: React.FC = () => {
  const {
    currentProject,
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
    showToast,
  } = useConsulting();

  const [activeTab, setActiveTab] = useState<
    'dimensions' | 'departments' | 'questions' | 'feedbacks' | 'executive'
  >('dimensions');

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [dimensionFilter, setDimensionFilter] = useState<string>('all');

  // Modals
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<ClimateSurvey | null>(null);
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    cycle: 'Q1 2026',
    status: 'Em andamento' as 'Planejada' | 'Em andamento' | 'Concluída' | 'Encerrada',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    targetAudience: 'Todos os colaboradores e líderes',
    totalEligible: 100,
    totalRespondents: 0,
    enpsScore: 0,
    enpsPromotersPercent: 0,
    enpsPassivesPercent: 0,
    enpsDetractorsPercent: 0,
    overallScore: 3.5,
    overallFavorabilityPercent: 70,
    executiveSummary: '',
  });

  // Modal Comment
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentForm, setCommentForm] = useState<{
    department: string;
    category: 'Elogio' | 'Oportunidade' | 'Crítica' | 'Sugestão';
    sentiment: 'Positivo' | 'Neutro' | 'Crítico';
    dimensionKey: ClimateDimensionKey;
    comment: string;
  }>({
    department: 'Geral',
    category: 'Sugestão',
    sentiment: 'Neutro',
    dimensionKey: 'work_environment',
    comment: '',
  });

  // Modal Question
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState<{
    dimensionKey: ClimateDimensionKey;
    dimensionName: string;
    question: string;
    score: number;
    favorabilityPercent: number;
    neutralPercent: number;
    unfavorablePercent: number;
  }>({
    dimensionKey: 'leadership',
    dimensionName: 'Liderança & Gestão Direta',
    question: '',
    score: 4.0,
    favorabilityPercent: 80,
    neutralPercent: 12,
    unfavorablePercent: 8,
  });

  // Modal 5W2H Conversion
  const [is5W2HModalOpen, setIs5W2HModalOpen] = useState(false);
  const [convertingComment, setConvertingComment] = useState<ClimateFeedbackComment | null>(null);
  const [plan5W2HForm, setPlan5W2HForm] = useState({
    actionWhat: '',
    responsible: currentProject?.leadConsultant || '',
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'survey' | 'question' | 'comment';
    id: string;
    title: string;
  } | null>(null);

  if (!currentProject) {
    return (
      <div id="climate-no-project" className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
        Selecione um projeto de consultoria ativo no topo para acessar a pesquisa de clima.
      </div>
    );
  }

  const survey = currentClimateSurvey || currentProjectClimateSurveys[0];

  // Helper for eNPS classification
  const getEnpsZone = (score: number) => {
    if (score >= 75) return { label: 'Zona de Excelência', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 50) return { label: 'Zona de Qualidade', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
    if (score >= 0) return { label: 'Zona de Aperfeiçoamento', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Zona Crítica', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  };

  const getDimensionStatusBadge = (status: string) => {
    switch (status) {
      case 'Excelente':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Excelente</span>;
      case 'Favorável':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Favorável</span>;
      case 'Atenção':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Atenção</span>;
      case 'Crítico':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Crítico</span>;
    }
  };

  // Dimensions sorted by score
  const sortedDimensions = useMemo(() => {
    if (!survey || !survey.dimensions) return [];
    return [...survey.dimensions].sort((a, b) => b.score - a.score);
  }, [survey]);

  // Highlights
  const highestDimension = sortedDimensions[0];
  const lowestDimension = sortedDimensions[sortedDimensions.length - 1];

  // Feedbacks filtered
  const filteredComments = useMemo(() => {
    if (!survey || !survey.feedbackComments) return [];
    return survey.feedbackComments.filter((c) => {
      const matchDept = departmentFilter === 'all' || c.department === departmentFilter;
      const matchSent = sentimentFilter === 'all' || c.sentiment === sentimentFilter;
      const matchDim = dimensionFilter === 'all' || c.dimensionKey === dimensionFilter;
      return matchDept && matchSent && matchDim;
    });
  }, [survey, departmentFilter, sentimentFilter, dimensionFilter]);

  // Distinct departments
  const availableDepartments = useMemo(() => {
    if (!survey) return [];
    const depts = new Set<string>();
    survey.departments?.forEach((d) => depts.add(d.department));
    survey.feedbackComments?.forEach((c) => depts.add(c.department));
    return Array.from(depts);
  }, [survey]);

  // Handlers
  const handleOpenAddSurvey = () => {
    setEditingSurvey(null);
    setSurveyForm({
      title: `Pesquisa de Clima Organizacional - ${currentProject.name}`,
      cycle: 'Q2 2026',
      status: 'Planejada',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      targetAudience: 'Colaboradores e líderes do projeto',
      totalEligible: 50,
      totalRespondents: 0,
      enpsScore: 30,
      enpsPromotersPercent: 50,
      enpsPassivesPercent: 30,
      enpsDetractorsPercent: 20,
      overallScore: 3.8,
      overallFavorabilityPercent: 76,
      executiveSummary: 'Ciclo de avaliação para acompanhamento das metas de transformação organizacional.',
    });
    setIsSurveyModalOpen(true);
  };

  const handleOpenEditSurvey = (s: ClimateSurvey) => {
    setEditingSurvey(s);
    setSurveyForm({
      title: s.title,
      cycle: s.cycle,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      targetAudience: s.targetAudience,
      totalEligible: s.totalEligible,
      totalRespondents: s.totalRespondents,
      enpsScore: s.enpsScore,
      enpsPromotersPercent: s.enpsPromotersPercent,
      enpsPassivesPercent: s.enpsPassivesPercent,
      enpsDetractorsPercent: s.enpsDetractorsPercent,
      overallScore: s.overallScore,
      overallFavorabilityPercent: s.overallFavorabilityPercent,
      executiveSummary: s.executiveSummary || '',
    });
    setIsSurveyModalOpen(true);
  };

  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyForm.title.trim()) {
      showToast('O título da pesquisa é obrigatório.', 'error');
      return;
    }

    const participationRate =
      surveyForm.totalEligible > 0
        ? Math.min(100, Math.round((surveyForm.totalRespondents / surveyForm.totalEligible) * 100))
        : 0;

    if (editingSurvey) {
      updateClimateSurvey(editingSurvey.id, {
        ...surveyForm,
        participationRate,
      });
    } else {
      addClimateSurvey({
        ...surveyForm,
        participationRate,
        dimensions: [
          { key: 'alignment', name: 'Alinhamento Estratégico', score: 4.2, favorabilityPercent: 84, status: 'Excelente' },
          { key: 'leadership', name: 'Liderança & Gestão', score: 4.0, favorabilityPercent: 80, status: 'Favorável' },
          { key: 'work_environment', name: 'Ambiente & Cultura', score: 3.9, favorabilityPercent: 78, status: 'Favorável' },
          { key: 'wellbeing', name: 'Equilíbrio & Bem-Estar', score: 3.6, favorabilityPercent: 72, status: 'Favorável' },
          { key: 'autonomy', name: 'Autonomia & Processos', score: 3.4, favorabilityPercent: 68, status: 'Atenção' },
          { key: 'communication', name: 'Comunicação Interna', score: 3.3, favorabilityPercent: 65, status: 'Atenção' },
          { key: 'recognition', name: 'Reconhecimento & Carreira', score: 3.1, favorabilityPercent: 58, status: 'Atenção' },
        ],
        departments: [
          { department: 'Operações', totalEmployees: 25, respondents: 22, participationRate: 88, enpsScore: 25, overallScore: 3.7, favorabilityPercent: 74 },
          { department: 'Administrativo & RH', totalEmployees: 10, respondents: 9, participationRate: 90, enpsScore: 40, overallScore: 4.0, favorabilityPercent: 80 },
          { department: 'Tecnologia / Comercial', totalEmployees: 15, respondents: 14, participationRate: 93, enpsScore: 35, overallScore: 3.9, favorabilityPercent: 78 },
        ],
        questions: [],
        feedbackComments: [],
        actionPriorities: [
          'Aprimorar a clareza e transparência dos critérios de promoção e reconhecimento.',
          'Estruturar canal de feedback bidirecional entre diretoria e operação.',
        ],
      });
    }
    setIsSurveyModalOpen(false);
  };

  const handleOpen5W2HModal = (comment: ClimateFeedbackComment) => {
    setConvertingComment(comment);
    setPlan5W2HForm({
      actionWhat: `Implementar melhoria para resolver o gap: "${comment.comment}"`,
      responsible: currentProject.leadConsultant,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });
    setIs5W2HModalOpen(true);
  };

  const handleConfirm5W2HConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !convertingComment) return;
    if (!plan5W2HForm.actionWhat.trim()) {
      showToast('O campo "O que fazer" é obrigatório.', 'error');
      return;
    }
    convertClimateCommentTo5W2H(
      survey.id,
      convertingComment.id,
      plan5W2HForm.actionWhat,
      plan5W2HForm.responsible,
      plan5W2HForm.deadline
    );
    setIs5W2HModalOpen(false);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !questionForm.question.trim()) {
      showToast('O enunciado da pergunta é obrigatório.', 'error');
      return;
    }

    addClimateQuestion(survey.id, {
      ...questionForm,
      responsesCount: survey.totalRespondents || 10,
    });
    setIsQuestionModalOpen(false);
    setQuestionForm({
      dimensionKey: 'leadership',
      dimensionName: 'Liderança & Gestão Direta',
      question: '',
      score: 4.0,
      favorabilityPercent: 80,
      neutralPercent: 12,
      unfavorablePercent: 8,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !commentForm.comment.trim()) {
      showToast('O comentário não pode ficar em branco.', 'error');
      return;
    }

    addClimateFeedbackComment(survey.id, commentForm);
    setIsCommentModalOpen(false);
    setCommentForm({
      department: availableDepartments[0] || 'Geral',
      category: 'Sugestão',
      sentiment: 'Neutro',
      dimensionKey: 'work_environment',
      comment: '',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="climate-survey-view" className="space-y-6">
      <Breadcrumbs
        title="Pesquisa de Clima Organizacional & eNPS"
        subtitle={`Diagnóstico de satisfação, engajamento e lealdade da equipe para ${currentProject.name}`}
      />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Pesquisa de Clima & eNPS
            </h1>
            {survey && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {survey.cycle}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Diagnóstico de satisfação, lealdade (eNPS) e dimensões de engajamento humano para {currentProject.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Survey Selector if multiple exist */}
          {currentProjectClimateSurveys.length > 1 && (
            <select
              id="survey-cycle-select"
              value={survey?.id || ''}
              onChange={(e) => setSelectedClimateSurveyId(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-hidden focus:border-blue-500"
            >
              {currentProjectClimateSurveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.cycle} - {s.status}
                </option>
              ))}
            </select>
          )}

          <button
            id="btn-new-survey"
            onClick={handleOpenAddSurvey}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Ciclo</span>
          </button>

          {survey && (
            <>
              <button
                id="btn-edit-survey"
                onClick={() => handleOpenEditSurvey(survey)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                title="Editar parâmetros do ciclo"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>

              <button
                id="btn-duplicate-survey"
                onClick={() => duplicateClimateSurvey(survey.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                title="Duplicar como novo ciclo"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Duplicar</span>
              </button>

              <button
                id="btn-print-survey"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                title="Imprimir / Salvar PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>

              <button
                id="btn-delete-survey"
                onClick={() =>
                  setDeleteConfirm({
                    type: 'survey',
                    id: survey.id,
                    title: `Excluir a pesquisa "${survey.title}"?`,
                  })
                }
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs border border-rose-500/20 transition-colors"
                title="Excluir este ciclo de pesquisa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {!survey ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <HeartHandshake className="w-12 h-12 text-blue-400 mx-auto opacity-60" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Nenhuma pesquisa de clima cadastrada</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Inicie um novo ciclo de pesquisa de clima organizacional para diagnosticar eNPS, liderança, processos e comunicação.
            </p>
          </div>
          <button
            onClick={handleOpenAddSurvey}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Criar Primeiro Ciclo de Pesquisa
          </button>
        </div>
      ) : (
        <>
          {/* Executive KPI Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* eNPS Gauge Card */}
            <div
              id="kpi-card-enps"
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  eNPS dos Colaboradores
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getEnpsZone(survey.enpsScore).bg} ${getEnpsZone(survey.enpsScore).color}`}>
                  {getEnpsZone(survey.enpsScore).label}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold tracking-tight ${getEnpsZone(survey.enpsScore).color}`}>
                  {survey.enpsScore > 0 ? `+${survey.enpsScore}` : survey.enpsScore}
                </span>
                <span className="text-xs text-slate-500 font-medium">pontos (-100 a +100)</span>
              </div>

              {/* Breakdown Bars: Promotores, Neutros, Detratores */}
              <div className="space-y-1.5 pt-1">
                <div className="h-2 w-full bg-slate-800 rounded-full flex overflow-hidden">
                  <div
                    style={{ width: `${survey.enpsPromotersPercent}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Promotores (9-10): ${survey.enpsPromotersPercent}%`}
                  />
                  <div
                    style={{ width: `${survey.enpsPassivesPercent}%` }}
                    className="bg-amber-400 h-full"
                    title={`Neutros (7-8): ${survey.enpsPassivesPercent}%`}
                  />
                  <div
                    style={{ width: `${survey.enpsDetractorsPercent}%` }}
                    className="bg-rose-500 h-full"
                    title={`Detratores (0-6): ${survey.enpsDetractorsPercent}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {survey.enpsPromotersPercent}% Promotores
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {survey.enpsPassivesPercent}% Neutros
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {survey.enpsDetractorsPercent}% Detratores
                  </span>
                </div>
              </div>
            </div>

            {/* Favorabilidade Geral */}
            <div
              id="kpi-card-favorability"
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Índice de Favorabilidade
                </span>
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Smile className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {survey.overallFavorabilityPercent}%
                </span>
                <span className="text-xs text-slate-400">
                  (Média {survey.overallScore.toFixed(1)} / 5.0)
                </span>
              </div>

              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${survey.overallFavorabilityPercent}%` }}
                    className={`h-full ${
                      survey.overallFavorabilityPercent >= 75
                        ? 'bg-emerald-500'
                        : survey.overallFavorabilityPercent >= 60
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Meta estratégica: &gt; 75%</span>
                  <span>{survey.overallFavorabilityPercent >= 75 ? 'Meta Atingida' : 'Abaixo da Meta'}</span>
                </div>
              </div>
            </div>

            {/* Taxa de Participação */}
            <div
              id="kpi-card-participation"
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Adesão / Respondentes
                </span>
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Users className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {survey.participationRate}%
                </span>
                <span className="text-xs text-slate-400">
                  ({survey.totalRespondents} / {survey.totalEligible} colab.)
                </span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {survey.participationRate >= 80
                    ? 'Amostragem altamente representativa'
                    : 'Amostragem moderada'}
                </span>
              </div>
            </div>

            {/* Destaque vs Prioridade */}
            <div
              id="kpi-card-highlights"
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Destaque & Atenção
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {highestDimension && (
                  <div className="flex items-center justify-between bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-300 truncate max-w-[130px] font-medium" title={highestDimension.name}>
                      ★ {highestDimension.name}
                    </span>
                    <span className="font-bold text-emerald-400 shrink-0">
                      {highestDimension.favorabilityPercent}%
                    </span>
                  </div>
                )}
                {lowestDimension && (
                  <div className="flex items-center justify-between bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-300 truncate max-w-[130px] font-medium" title={lowestDimension.name}>
                      ⚠ {lowestDimension.name}
                    </span>
                    <span className="font-bold text-amber-400 shrink-0">
                      {lowestDimension.favorabilityPercent}%
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 pt-0.5">
                {survey.feedbackComments?.length || 0} feedbacks qualitativos coletados
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-px">
            <button
              id="tab-climate-dimensions"
              onClick={() => setActiveTab('dimensions')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'dimensions'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dimensões do Clima ({survey.dimensions?.length || 0})</span>
            </button>

            <button
              id="tab-climate-departments"
              onClick={() => setActiveTab('departments')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'departments'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Departamentos & Heatmap ({survey.departments?.length || 0})</span>
            </button>

            <button
              id="tab-climate-questions"
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Perguntas Detalhadas ({survey.questions?.length || 0})</span>
            </button>

            <button
              id="tab-climate-feedbacks"
              onClick={() => setActiveTab('feedbacks')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'feedbacks'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mural de Feedbacks & Sentimentos ({survey.feedbackComments?.length || 0})</span>
            </button>

            <button
              id="tab-climate-executive"
              onClick={() => setActiveTab('executive')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'executive'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Diagnóstico Executivo & Recomendações</span>
            </button>
          </div>

          {/* TAB 1: DIMENSIONS */}
          {activeTab === 'dimensions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedDimensions.map((dim, idx) => (
                  <div
                    key={dim.key}
                    id={`dim-card-${dim.key}`}
                    className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                          <h3 className="text-sm font-bold text-white">{dim.name}</h3>
                        </div>
                        {dim.description && (
                          <p className="text-xs text-slate-400">{dim.description}</p>
                        )}
                      </div>
                      {getDimensionStatusBadge(dim.status)}
                    </div>

                    <div className="flex items-end justify-between text-xs pt-1">
                      <div>
                        <span className="text-2xl font-black text-white">
                          {dim.favorabilityPercent}%
                        </span>
                        <span className="text-slate-400 text-xs ml-1.5">favorável</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">Nota Média: </span>
                        <span className="font-bold text-slate-200">{dim.score.toFixed(1)} / 5.0</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${dim.favorabilityPercent}%` }}
                        className={`h-full ${
                          dim.favorabilityPercent >= 80
                            ? 'bg-emerald-500'
                            : dim.favorabilityPercent >= 70
                            ? 'bg-blue-500'
                            : dim.favorabilityPercent >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Satisfação e eNPS por Área / Departamento</h3>
                  <p className="text-xs text-slate-400">
                    Compare os resultados de clima entre diferentes setores para identificar pontos críticos de gestão.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Departamento</th>
                      <th className="py-3.5 px-4">Elegíveis / Respostas</th>
                      <th className="py-3.5 px-4">Taxa Adesão</th>
                      <th className="py-3.5 px-4">eNPS da Área</th>
                      <th className="py-3.5 px-4">Nota Média</th>
                      <th className="py-3.5 px-4">Favorabilidade</th>
                      <th className="py-3.5 px-4">Alertas / Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {survey.departments?.map((dept, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            <span>{dept.department}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {dept.respondents} de {dept.totalEmployees}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-200">{dept.participationRate}%</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-xs border ${getEnpsZone(dept.enpsScore).bg} ${getEnpsZone(dept.enpsScore).color}`}
                          >
                            {dept.enpsScore > 0 ? `+${dept.enpsScore}` : dept.enpsScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-200">
                          {dept.overallScore.toFixed(1)} / 5.0
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${dept.favorabilityPercent}%` }}
                                className="h-full bg-blue-500"
                              />
                            </div>
                            <span className="font-bold text-white">{dept.favorabilityPercent}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {dept.priorityAlert ? (
                            <span className="flex items-center gap-1.5 text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[200px]" title={dept.priorityAlert}>
                                {dept.priorityAlert}
                              </span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Estável
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Diagnóstico item a item com distribuição na escala Likert (Favorável, Neutro, Desfavorável).
                </div>
                <button
                  id="btn-add-question"
                  onClick={() => setIsQuestionModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Pergunta</span>
                </button>
              </div>

              <div className="space-y-3">
                {survey.questions?.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-700">
                            {q.dimensionName}
                          </span>
                          <span className="text-xs font-bold text-slate-400">Item #{idx + 1}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{q.question}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">
                            {q.favorabilityPercent}% Favorável
                          </div>
                          <div className="text-[10px] text-slate-500">Média: {q.score.toFixed(1)}/5.0</div>
                        </div>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'question',
                              id: q.id,
                              title: `Excluir pergunta "${q.question}"?`,
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remover pergunta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Likert Distribution Bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-slate-800 rounded-full flex overflow-hidden">
                        <div
                          style={{ width: `${q.favorabilityPercent}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Concordam / Concordam Totalmente: ${q.favorabilityPercent}%`}
                        />
                        <div
                          style={{ width: `${q.neutralPercent}%` }}
                          className="bg-amber-400 h-full"
                          title={`Neutros: ${q.neutralPercent}%`}
                        />
                        <div
                          style={{ width: `${q.unfavorablePercent}%` }}
                          className="bg-rose-500 h-full"
                          title={`Discordam / Discordam Totalmente: ${q.unfavorablePercent}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span className="text-emerald-400 font-medium">
                          {q.favorabilityPercent}% Favorável (4 ou 5)
                        </span>
                        <span className="text-amber-400 font-medium">
                          {q.neutralPercent}% Neutro (3)
                        </span>
                        <span className="text-rose-400 font-medium">
                          {q.unfavorablePercent}% Desfavorável (1 ou 2)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUALITATIVE FEEDBACK */}
          {activeTab === 'feedbacks' && (
            <div className="space-y-4">
              {/* Filter and Add */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" /> Filtrar:
                  </span>
                  <select
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                  >
                    <option value="all">Todos os Sentimentos</option>
                    <option value="Positivo">Positivo (Elogios)</option>
                    <option value="Neutro">Neutro (Sugestões)</option>
                    <option value="Crítico">Crítico (Gargalos)</option>
                  </select>

                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                  >
                    <option value="all">Todas as Áreas</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  id="btn-add-comment"
                  onClick={() => setIsCommentModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Comentário</span>
                </button>
              </div>

              {/* Feedbacks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredComments.map((com) => (
                  <div
                    key={com.id}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {com.department}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              com.sentiment === 'Positivo'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : com.sentiment === 'Neutro'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {com.category} ({com.sentiment})
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed italic">
                        "{com.comment}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-500">{com.date}</span>

                      <div className="flex items-center gap-2">
                        {com.convertedTo5W2H ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckSquare className="w-3 h-3" /> Desdobrado em 5W2H
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpen5W2HModal(com)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-colors"
                            title="Transformar este apontamento em plano de ação no 5W2H"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Gerar Ação 5W2H</span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'comment',
                              id: com.id,
                              title: 'Excluir este comentário?',
                            })
                          }
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EXECUTIVE SUMMARY */}
          {activeTab === 'executive' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Síntese Executiva do Diagnóstico de Clima
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {survey.executiveSummary ||
                    'Nenhum resumo executivo informado ainda para este ciclo de pesquisa.'}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Principais Prioridades de Intervenção Consultiva
                  </h4>
                  <ul className="space-y-2">
                    {survey.actionPriorities && survey.actionPriorities.length > 0 ? (
                      survey.actionPriorities.map((act, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-blue-500/20">
                            {i + 1}
                          </span>
                          <span>{act}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-500 italic">
                        Nenhuma prioridade listada.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: Create / Edit Survey */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSurvey ? 'Editar Ciclo de Pesquisa' : 'Novo Ciclo de Pesquisa de Clima'}
              </h3>
              <button
                onClick={() => setIsSurveyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSurvey} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título da Pesquisa</label>
                <input
                  type="text"
                  required
                  value={surveyForm.title}
                  onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ciclo / Período</label>
                  <input
                    type="text"
                    value={surveyForm.cycle}
                    onChange={(e) => setSurveyForm({ ...surveyForm, cycle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                    placeholder="Ex: Q2 2026"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={surveyForm.status}
                    onChange={(e) =>
                      setSurveyForm({
                        ...surveyForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    <option value="Planejada">Planejada</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Encerrada">Encerrada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data Início</label>
                  <input
                    type="date"
                    value={surveyForm.startDate}
                    onChange={(e) => setSurveyForm({ ...surveyForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data Término</label>
                  <input
                    type="date"
                    value={surveyForm.endDate}
                    onChange={(e) => setSurveyForm({ ...surveyForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total de Elegíveis</label>
                  <input
                    type="number"
                    min="1"
                    value={surveyForm.totalEligible}
                    onChange={(e) =>
                      setSurveyForm({ ...surveyForm, totalEligible: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Respondentes</label>
                  <input
                    type="number"
                    min="0"
                    value={surveyForm.totalRespondents}
                    onChange={(e) =>
                      setSurveyForm({
                        ...surveyForm,
                        totalRespondents: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">eNPS (-100 a +100)</label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={surveyForm.enpsScore}
                    onChange={(e) =>
                      setSurveyForm({ ...surveyForm, enpsScore: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Promotores %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={surveyForm.enpsPromotersPercent}
                    onChange={(e) =>
                      setSurveyForm({
                        ...surveyForm,
                        enpsPromotersPercent: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Detratores %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={surveyForm.enpsDetractorsPercent}
                    onChange={(e) =>
                      setSurveyForm({
                        ...surveyForm,
                        enpsDetractorsPercent: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Síntese Executiva</label>
                <textarea
                  rows={3}
                  value={surveyForm.executiveSummary}
                  onChange={(e) => setSurveyForm({ ...surveyForm, executiveSummary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 resize-none"
                  placeholder="Destaques, principais gargalos e conclusões da rodada..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSurveyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  Salvar Pesquisa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Qualitative Comment */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Comentário de Feedback</h3>
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddComment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Departamento</label>
                  <input
                    type="text"
                    required
                    value={commentForm.department}
                    onChange={(e) => setCommentForm({ ...commentForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                    placeholder="Ex: Operações, Vendas..."
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria</label>
                  <select
                    value={commentForm.category}
                    onChange={(e) =>
                      setCommentForm({ ...commentForm, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    <option value="Elogio">Elogio</option>
                    <option value="Sugestão">Sugestão</option>
                    <option value="Oportunidade">Oportunidade</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sentimento</label>
                <select
                  value={commentForm.sentiment}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, sentiment: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  <option value="Positivo">Positivo</option>
                  <option value="Neutro">Neutro</option>
                  <option value="Crítico">Crítico (Ponto de Atenção)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Comentário Qualitativo</label>
                <textarea
                  rows={4}
                  required
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 resize-none"
                  placeholder="Relato do colaborador ou síntese da entrevista de clima..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCommentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  Salvar Comentário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Question */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Adicionar Pergunta à Pesquisa</h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dimensão</label>
                <select
                  value={questionForm.dimensionKey}
                  onChange={(e) => {
                    const key = e.target.value as ClimateDimensionKey;
                    const dim = survey.dimensions.find((d) => d.key === key);
                    setQuestionForm({
                      ...questionForm,
                      dimensionKey: key,
                      dimensionName: dim?.name || 'Geral',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  {survey.dimensions.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Enunciado da Pergunta</label>
                <textarea
                  rows={3}
                  required
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 resize-none"
                  placeholder="Ex: Tenho liberdade e autonomia para sugerir melhorias no meu setor."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Favorável % (4-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={questionForm.favorabilityPercent}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        favorabilityPercent: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Neutro % (3)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={questionForm.neutralPercent}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        neutralPercent: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Desfavorável % (1-2)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={questionForm.unfavorablePercent}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        unfavorablePercent: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  Salvar Pergunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Desdobrar em Ação 5W2H */}
      {is5W2HModalOpen && convertingComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                Desdobrar em Plano de Ação 5W2H
              </h3>
              <button
                onClick={() => setIs5W2HModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Feedback de Origem:</span>
              <p className="italic text-slate-200">"{convertingComment.comment}"</p>
              <div className="text-[10px] text-slate-400 pt-1">
                Área: {convertingComment.department} • Sentimento: {convertingComment.sentiment}
              </div>
            </div>

            <form onSubmit={handleConfirm5W2HConversion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  O que fazer (Plano de Intervenção)
                </label>
                <textarea
                  rows={3}
                  required
                  value={plan5W2HForm.actionWhat}
                  onChange={(e) => setPlan5W2HForm({ ...plan5W2HForm, actionWhat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quem (Responsável)</label>
                  <input
                    type="text"
                    required
                    value={plan5W2HForm.responsible}
                    onChange={(e) =>
                      setPlan5W2HForm({ ...plan5W2HForm, responsible: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quando (Prazo)</label>
                  <input
                    type="date"
                    required
                    value={plan5W2HForm.deadline}
                    onChange={(e) =>
                      setPlan5W2HForm({ ...plan5W2HForm, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIs5W2HModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  Criar Ação 5W2H
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Confirmar Exclusão"
          message={deleteConfirm.title}
          confirmLabel="Excluir"
          isDestructive={true}
          onConfirm={() => {
            if (!survey) return;
            if (deleteConfirm.type === 'survey') {
              deleteClimateSurvey(deleteConfirm.id);
            } else if (deleteConfirm.type === 'question') {
              deleteClimateQuestion(survey.id, deleteConfirm.id);
            } else if (deleteConfirm.type === 'comment') {
              deleteClimateFeedbackComment(survey.id, deleteConfirm.id);
            }
            setDeleteConfirm(null);
          }}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};
