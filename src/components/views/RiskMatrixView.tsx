import React, { useState, useEffect } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { RiskItem, RiskCategory, RiskStatus, RiskClassification } from '../../types';
import { RiskBadge, StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  ShieldAlert,
  Plus,
  Grid3X3,
  List,
  Edit2,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Filter,
  Shield,
  Layers,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';

interface RiskPreset {
  title: string;
  category: RiskCategory;
  cause: string;
  consequence: string;
  probability: number;
  impact: number;
  preventiveAction: string;
  contingencyPlan: string;
}

const RISK_PRESETS: RiskPreset[] = [
  {
    title: 'Atraso na liberação da infraestrutura de TI / acessos',
    category: 'Tecnológico',
    cause: 'Dependência de fornecedor terceiro ou políticas rígidas de segurança',
    consequence: 'Paralisação dos testes operacionais e postergação do Go-Live',
    probability: 4,
    impact: 4,
    preventiveAction: 'Mapear requisitos de acesso 30 dias antes e realizar homologação em sandbox.',
    contingencyPlan: 'Acionar contingência com infraestrutura temporária local ou suporte emergencial.',
  },
  {
    title: 'Resistência à mudança e baixa adesão dos colaboradores',
    category: 'Pessoas',
    cause: 'Falta de comunicação clara sobre os benefícios e medo de substituição',
    consequence: 'Uso incorreto dos novos processos e desmotivação da equipe',
    probability: 4,
    impact: 3,
    preventiveAction: 'Workshops de sensibilização, plano de Change Management e formação de embaixadores.',
    contingencyPlan: 'Reforço de treinamentos práticos 1 a 1 e canais diretos de feedback semanal.',
  },
  {
    title: 'Ruptura ou atraso na cadeia de suprimentos crítica',
    category: 'Operacional',
    cause: 'Concentração em fornecedor único e oscilações logísticas',
    consequence: 'Interrupção na linha de produção e atraso nas entregas aos clientes',
    probability: 3,
    impact: 5,
    preventiveAction: 'Qualificação prévia de fornecedores secundários e revisão dos níveis de estoque mínimo.',
    contingencyPlan: 'Acionamento de estoque pulmão emergencial e frete expresso prioritário.',
  },
  {
    title: 'Desalinhamento de expectativas com a diretoria/patrocinador',
    category: 'Estratégico',
    cause: 'Mudança de diretrizes estratégicas ou falha na comunicação de status',
    consequence: 'Perda de patrocínio do projeto e cancelamento de investimentos',
    probability: 2,
    impact: 5,
    preventiveAction: 'Reuniões quinzenais de alinhamento executivo com ata formal e validação de marcos.',
    contingencyPlan: 'Reunião extraordinária de repactuação de escopo e termo aditivo com novas premissas.',
  },
  {
    title: 'Estouro do orçamento previsto para contratações/licenças',
    category: 'Financeiro',
    cause: 'Variação cambial e custos ocultos de integração não previstos',
    consequence: 'Déficit orçamentário e necessidade de corte de entregáveis secundários',
    probability: 3,
    impact: 4,
    preventiveAction: 'Auditoria orçamentária semanal com margem de segurança de 10% para contingência.',
    contingencyPlan: 'Reavaliação e postergação de módulos opcionais para a Fase 2.',
  },
  {
    title: 'Não conformidade com exigências regulatórias ou LGPD',
    category: 'Legal',
    cause: 'Tratamento inadequado de dados sensíveis nos novos fluxos operacionais',
    consequence: 'Risco de multas administrativas e danos à reputação da empresa',
    probability: 2,
    impact: 5,
    preventiveAction: 'Auditoria jurídica prévia e adequação das políticas de privacidade nos novos fluxos.',
    contingencyPlan: 'Isolamento dos dados sensíveis e consultoria jurídica especializada imediata.',
  },
];

export const RiskMatrixView: React.FC = () => {
  const {
    currentProject,
    currentProjectRisks,
    addRisk,
    updateRisk,
    duplicateRisk,
    deleteRisk,
    calculateRiskClassification,
    settings,
    currentUser,
  } = useConsulting();

  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);

  const [formData, setFormData] = useState<{
    risk: string;
    cause: string;
    consequence: string;
    category: RiskCategory;
    probability: number;
    impact: number;
    responsible: string;
    preventiveAction: string;
    contingencyPlan: string;
    reviewDate: string;
    status: RiskStatus;
  }>({
    risk: '',
    cause: '',
    consequence: '',
    category: 'Operacional',
    probability: 3,
    impact: 3,
    responsible: '',
    preventiveAction: '',
    contingencyPlan: '',
    reviewDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    status: 'Identificado',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  const categories: RiskCategory[] = [
    'Estratégico',
    'Operacional',
    'Financeiro',
    'Tecnológico',
    'Legal',
    'Pessoas',
    'Reputacional',
  ];

  const getCellColor = (p: number, i: number) => {
    const score = p * i;
    const { critical, high, moderate } = settings.riskScoreThresholds;
    if (score >= critical) return 'bg-rose-600 text-white hover:bg-rose-500';
    if (score >= high) return 'bg-amber-600 text-white hover:bg-amber-500';
    if (score >= moderate) return 'bg-blue-600 text-white hover:bg-blue-500';
    return 'bg-emerald-600 text-white hover:bg-emerald-500';
  };

  const getScoreColorClass = (score: number) => {
    const { critical, high, moderate } = settings.riskScoreThresholds;
    if (score >= critical) return 'text-rose-400 bg-rose-950/50 border-rose-800';
    if (score >= high) return 'text-amber-400 bg-amber-950/50 border-amber-800';
    if (score >= moderate) return 'text-blue-400 bg-blue-950/50 border-blue-800';
    return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
  };

  const openCreateModal = (initP: number = 3, initI: number = 3) => {
    setEditingRisk(null);
    setFormData({
      risk: '',
      cause: '',
      consequence: '',
      category: 'Operacional',
      probability: initP,
      impact: initI,
      responsible: currentProject.leadConsultant || currentUser?.name || currentUser?.email || 'Consultor Responsável',
      preventiveAction: '',
      contingencyPlan: '',
      reviewDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Identificado',
    });
    setIsModalOpen(true);
  };

  const applyPreset = (preset: RiskPreset) => {
    setFormData((prev) => ({
      ...prev,
      risk: preset.title,
      category: preset.category,
      cause: preset.cause,
      consequence: preset.consequence,
      probability: preset.probability,
      impact: preset.impact,
      preventiveAction: preset.preventiveAction,
      contingencyPlan: preset.contingencyPlan,
    }));
  };

  const openEditModal = (r: RiskItem) => {
    setEditingRisk(r);
    setFormData({
      risk: r.risk,
      cause: r.cause,
      consequence: r.consequence,
      category: r.category,
      probability: r.probability,
      impact: r.impact,
      responsible: r.responsible || currentProject.leadConsultant || 'Consultor Responsável',
      preventiveAction: r.preventiveAction,
      contingencyPlan: r.contingencyPlan,
      reviewDate: r.reviewDate,
      status: r.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.risk.trim()) return;

    const score = formData.probability * formData.impact;
    const classification = calculateRiskClassification(score);

    if (editingRisk) {
      updateRisk(editingRisk.id, {
        risk: formData.risk,
        cause: formData.cause,
        consequence: formData.consequence,
        category: formData.category,
        probability: formData.probability,
        impact: formData.impact,
        riskScore: score,
        classification: classification,
        responsible: formData.responsible || currentProject.leadConsultant || 'Consultor Responsável',
        preventiveAction: formData.preventiveAction,
        contingencyPlan: formData.contingencyPlan,
        reviewDate: formData.reviewDate,
        status: formData.status,
      });
    } else {
      addRisk({
        projectId: currentProject.id,
        risk: formData.risk,
        cause: formData.cause,
        consequence: formData.consequence,
        category: formData.category,
        probability: formData.probability,
        impact: formData.impact,
        riskScore: score,
        classification: classification,
        responsible: formData.responsible || currentProject.leadConsultant || 'Consultor Responsável',
        preventiveAction: formData.preventiveAction,
        contingencyPlan: formData.contingencyPlan,
        reviewDate: formData.reviewDate,
        status: formData.status,
      });
    }
    setIsModalOpen(false);
  };

  const filteredRisks = currentProjectRisks.filter((r) => {
    const matchClass =
      classificationFilter === 'all' || r.classification === classificationFilter;
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchStat = statusFilter === 'all' || r.status === statusFilter;
    const matchCell = selectedCell
      ? r.probability === selectedCell.p && r.impact === selectedCell.i
      : true;

    return matchClass && matchCat && matchStat && matchCell;
  });

  const probabilityLabels = [
    { level: 1, label: 'Muito Baixa (1)' },
    { level: 2, label: 'Baixa (2)' },
    { level: 3, label: 'Média (3)' },
    { level: 4, label: 'Alta (4)' },
    { level: 5, label: 'Muito Alta (5)' },
  ];

  const impactLabels = [
    { level: 1, label: 'Muito Baixo (1)' },
    { level: 2, label: 'Baixo (2)' },
    { level: 3, label: 'Médio (3)' },
    { level: 4, label: 'Alto (4)' },
    { level: 5, label: 'Crítico (5)' },
  ];

  const currentScore = formData.probability * formData.impact;
  const currentClassification = calculateRiskClassification(currentScore);

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Matriz de Riscos (Probabilidade x Impacto 5x5)"
        subtitle="Identificação, severidade e planos de contingência para os riscos do projeto"
        actions={
          <>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                Matriz 5x5
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Tabela Detalhada
              </button>
            </div>

            <button
              type="button"
              id="btn-mapear-novo-risco"
              onClick={() => openCreateModal(3, 3)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Mapear Novo Risco
            </button>
          </>
        }
      />

      {/* Filters Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Classificação:</span>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todas as classificações</option>
              <option value="Crítico">Crítico (16-25)</option>
              <option value="Alto">Alto (12-15)</option>
              <option value="Moderado">Moderado (6-11)</option>
              <option value="Baixo">Baixo (1-5)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="Identificado">Identificado</option>
              <option value="Em análise">Em análise</option>
              <option value="Em tratamento">Em tratamento</option>
              <option value="Mitigado">Mitigado</option>
              <option value="Aceito">Aceito</option>
              <option value="Encerrado">Encerrado</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCell && (
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-semibold cursor-pointer"
            >
              Limpar filtro da célula (P={selectedCell.p}, I={selectedCell.i}) ✕
            </button>
          )}

          <button
            type="button"
            onClick={() => openCreateModal(3, 3)}
            className="md:hidden px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Risco
          </button>
        </div>
      </div>

      {/* MATRIX VIEW (5x5 GRID + ACTIVE LIST) */}
      {viewMode === 'matrix' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 5x5 Matrix Canvas Grid */}
          <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Grade Probabilidade x Impacto</h3>
                <p className="text-xs text-slate-400">
                  Clique em qualquer célula para filtrar os riscos ou adicionar diretamente
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Crítico
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Alto
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Mod.
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Baixo
                </span>
              </div>
            </div>

            {/* Matrix Visual Layout */}
            <div className="flex">
              {/* Y Axis Label: Probabilidade */}
              <div className="w-8 flex items-center justify-center -rotate-90 text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">
                PROBABILIDADE &uarr;
              </div>

              <div className="flex-1">
                {/* 5 Rows (Probabilidade 5 down to 1) */}
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((p) => (
                    <div key={p} className="flex items-center gap-1.5">
                      <span className="w-6 text-xs font-bold text-slate-400 text-right shrink-0">
                        {p}
                      </span>
                      {/* 5 Columns (Impacto 1 to 5) */}
                      <div className="grid grid-cols-5 gap-1.5 flex-1">
                        {[1, 2, 3, 4, 5].map((i) => {
                          const cellRisks = currentProjectRisks.filter(
                            (r) => r.probability === p && r.impact === i
                          );
                          const isSelected =
                            selectedCell?.p === p && selectedCell?.i === i;

                          return (
                            <button
                              key={`${p}-${i}`}
                              type="button"
                              id={`matrix-cell-p${p}-i${i}`}
                              onClick={() => {
                                if (isSelected) setSelectedCell(null);
                                else setSelectedCell({ p, i });
                              }}
                              className={`h-14 sm:h-16 rounded-lg p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer relative ${getCellColor(
                                p,
                                i
                              )} ${
                                isSelected
                                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-102 z-10 shadow-lg'
                                  : 'opacity-90 hover:opacity-100'
                              }`}
                              title={`Probabilidade: ${p}, Impacto: ${i} (Score: ${p * i}) - ${cellRisks.length} riscos`}
                            >
                              <div className="w-full flex items-center justify-between text-[10px] opacity-90">
                                <span>P{p}×I{i}</span>
                                <span>={p * i}</span>
                              </div>

                              {cellRisks.length > 0 ? (
                                <span className="font-black text-sm sm:text-base bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                                  {cellRisks.length}
                                </span>
                              ) : (
                                <span className="text-[10px] opacity-40">-</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* X Axis Header: Impacto */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-6 shrink-0" />
                  <div className="grid grid-cols-5 gap-1.5 flex-1 text-center text-xs font-bold text-slate-400">
                    <span>1 (Muito Baixo)</span>
                    <span>2 (Baixo)</span>
                    <span>3 (Médio)</span>
                    <span>4 (Alto)</span>
                    <span>5 (Crítico)</span>
                  </div>
                </div>
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                  IMPACTO &rarr;
                </p>
              </div>
            </div>
          </div>

          {/* Right: Risks in Selected Cell / Filtered */}
          <div className="lg:col-span-5 bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
                <h3 className="text-sm font-bold text-slate-100 truncate">
                  {selectedCell
                    ? `Riscos na Célula (P=${selectedCell.p}, I=${selectedCell.i})`
                    : `Riscos Mapeados (${filteredRisks.length})`}
                </h3>
                <button
                  type="button"
                  onClick={() => openCreateModal(selectedCell?.p || 3, selectedCell?.i || 3)}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-300 bg-blue-950/70 border border-blue-800 hover:bg-blue-900 rounded-md cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {selectedCell ? 'Nesta célula' : 'Novo Risco'}
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredRisks.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-3">
                    <Shield className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Nenhum risco encontrado</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedCell
                          ? `Não há riscos mapeados para P=${selectedCell.p} e I=${selectedCell.i}.`
                          : 'Comece a identificar ameaças e planos de mitigação.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCreateModal(selectedCell?.p || 3, selectedCell?.i || 3)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Mapear Primeiro Risco
                    </button>
                  </div>
                ) : (
                  filteredRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className="p-3.5 rounded-lg border border-slate-750 bg-slate-800/70 hover:bg-slate-800 transition-all space-y-2 text-slate-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-900 px-1.5 py-0.2 rounded border border-slate-700">
                              {risk.category}
                            </span>
                            <RiskBadge
                              classification={risk.classification}
                              score={risk.riskScore}
                              size="sm"
                            />
                            <StatusBadge status={risk.status} size="sm" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-100 mt-1 leading-snug">
                            {risk.risk}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => duplicateRisk(risk.id)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                            title="Duplicar Risco"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(risk)}
                            className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                            title="Editar Risco"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(risk.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                            title="Excluir Risco"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {risk.cause && (
                        <p className="text-[11px] text-slate-300">
                          <strong className="text-slate-400">Causa:</strong> {risk.cause}
                        </p>
                      )}
                      {risk.preventiveAction && (
                        <p className="text-[11px] text-emerald-300 font-medium">
                          <strong className="text-emerald-400">Prevenção:</strong> {risk.preventiveAction}
                        </p>
                      )}
                      {risk.contingencyPlan && (
                        <p className="text-[11px] text-amber-300 font-medium">
                          <strong className="text-amber-400">Contingência:</strong> {risk.contingencyPlan}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Resp: {risk.responsible}</span>
                        <span>Revisão: {risk.reviewDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TABLE DETAILED VIEW */
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-x-auto text-slate-100">
          <table className="w-full text-left text-xs divide-y divide-slate-800 min-w-[1000px]">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4 w-60">Evento de Risco</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-center">P × I</th>
                <th className="py-3 px-3">Severidade</th>
                <th className="py-3 px-4 w-52">Ação Preventiva</th>
                <th className="py-3 px-4 w-52">Contingência</th>
                <th className="py-3 px-3">Responsável</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="space-y-2">
                      <p>Nenhum risco com os filtros aplicados.</p>
                      <button
                        type="button"
                        onClick={() => openCreateModal(3, 3)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Mapear Novo Risco
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRisks.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <div>{r.risk}</div>
                      {r.consequence && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {r.consequence}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-300">{r.category}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                      {r.probability} × {r.impact} = {r.riskScore}
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge classification={r.classification} score={r.riskScore} />
                    </td>
                    <td className="py-3 px-4 text-slate-300">{r.preventiveAction || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{r.contingencyPlan || '-'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{r.responsible}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => duplicateRisk(r.id)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                        title="Duplicar Risco"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(r)}
                        className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                        title="Editar Risco"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(r.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                        title="Excluir Risco"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL ADD / EDIT RISK */}
      {isModalOpen && (
        <div
          id="risk-form-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
        >
          <div
            id="risk-form-modal-card"
            className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {editingRisk ? 'Editar Risco do Projeto' : 'Mapear Novo Risco na Matriz'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina severidade (Probabilidade × Impacto), causa-raiz e planos de ação
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                title="Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Presets Library (Only in Create Mode) */}
              {!editingRisk && (
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Sugestões Rápidas de Riscos de Consultoria:
                    </span>
                    <span className="text-[10px] text-slate-400">Clique para preencher</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {RISK_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="text-[11px] px-2.5 py-1 bg-slate-900/80 hover:bg-blue-600/20 hover:border-blue-500/50 border border-slate-700 text-slate-300 hover:text-blue-300 rounded-lg transition-all text-left cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[260px]">{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evento de Risco */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Evento de Risco / Ameaça Identificada <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.risk}
                  onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                  placeholder="Ex: Atraso na liberação da infraestrutura de TI ou recusa de homologação"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-3 focus:outline-none focus:border-blue-500 placeholder:text-slate-500 font-medium"
                />
              </div>

              {/* Causa e Consequência */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Causa-Raiz do Risco
                  </label>
                  <input
                    type="text"
                    value={formData.cause}
                    onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                    placeholder="Ex: Dependência de fornecedor terceiro único"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Consequência / Impacto no Projeto
                  </label>
                  <input
                    type="text"
                    value={formData.consequence}
                    onChange={(e) => setFormData({ ...formData, consequence: e.target.value })}
                    placeholder="Ex: Paralisação dos testes e estouro de prazo em 2 semanas"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Categoria do Risco
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: c })}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                        formData.category === c
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEVERITY EVALUATION (PROBABILITY & IMPACT 1-5 SELECTORS) */}
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Avaliação de Severidade (Matriz 5x5)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Score Calculado:</span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getScoreColorClass(currentScore)}`}>
                      {formData.probability} × {formData.impact} = {currentScore} ({currentClassification})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Probabilidade */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Probabilidade de Ocorrência (1 a 5):
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {probabilityLabels.map((p) => (
                        <button
                          key={p.level}
                          type="button"
                          onClick={() => setFormData({ ...formData, probability: p.level })}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            formData.probability === p.level
                              ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/40 shadow-sm'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                          }`}
                        >
                          {p.level}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nível: {probabilityLabels.find((p) => p.level === formData.probability)?.label}
                    </p>
                  </div>

                  {/* Impacto */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Impacto se ocorrer (1 a 5):
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {impactLabels.map((imp) => (
                        <button
                          key={imp.level}
                          type="button"
                          onClick={() => setFormData({ ...formData, impact: imp.level })}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            formData.impact === imp.level
                              ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/40 shadow-sm'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                          }`}
                        >
                          {imp.level}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nível: {impactLabels.find((imp) => imp.level === formData.impact)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ação Preventiva e Contingência */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ação Preventiva (Mitigação)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.preventiveAction}
                    onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
                    placeholder="O que será feito com antecedência para evitar que o risco ocorra?"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Plano de Contingência (Se ocorrer)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.contingencyPlan}
                    onChange={(e) => setFormData({ ...formData, contingencyPlan: e.target.value })}
                    placeholder="Qual é o plano B imediato caso o risco venha a se concretizar?"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Governança do Risco */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Nome do consultor ou líder"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Data de Revisão
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.reviewDate}
                    onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Status Atual
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as RiskStatus })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Identificado">Identificado</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Em tratamento">Em tratamento</option>
                    <option value="Mitigado">Mitigado</option>
                    <option value="Aceito">Aceito</option>
                    <option value="Encerrado">Encerrado</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {editingRisk ? 'Salvar Alterações' : 'Registrar Risco na Matriz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteRisk(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Remover Risco da Matriz?"
        message="Tem certeza que deseja remover este risco da matriz?"
        confirmText="Sim, Remover"
      />
    </div>
  );
};
