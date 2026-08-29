import React, { useState } from 'react';
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
} from 'lucide-react';

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
    responsible: currentProject?.leadConsultant || '',
    preventiveAction: '',
    contingencyPlan: '',
    reviewDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    status: 'Identificado',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const openCreateModal = (initP: number = 3, initI: number = 3) => {
    setEditingRisk(null);
    setFormData({
      risk: '',
      cause: '',
      consequence: '',
      category: 'Operacional',
      probability: initP,
      impact: initI,
      responsible: currentProject.leadConsultant,
      preventiveAction: '',
      contingencyPlan: '',
      reviewDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Identificado',
    });
    setIsModalOpen(true);
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
      responsible: r.responsible,
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
        responsible: formData.responsible,
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
        responsible: formData.responsible,
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

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Matriz de Riscos (Probabilidade x Impacto 5x5)"
        subtitle="Identificação, severidade e planos de contingência para os riscos do projeto"
        actions={
          <>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                Matriz 5x5
              </button>
              <button
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
              onClick={() => openCreateModal(3, 3)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
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

        {selectedCell && (
          <button
            onClick={() => setSelectedCell(null)}
            className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-semibold cursor-pointer"
          >
            Limpar filtro da célula (P={selectedCell.p}, I={selectedCell.i}) ✕
          </button>
        )}
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h3 className="text-sm font-bold text-slate-100">
                  {selectedCell
                    ? `Riscos na Célula (P=${selectedCell.p}, I=${selectedCell.i} | Score ${selectedCell.p * selectedCell.i})`
                    : `Riscos Mapeados (${filteredRisks.length})`}
                </h3>
                {selectedCell && (
                  <button
                    onClick={() => openCreateModal(selectedCell.p, selectedCell.i)}
                    className="px-2 py-1 text-xs font-semibold text-blue-300 bg-blue-950/70 border border-blue-800 hover:bg-blue-900 rounded-md cursor-pointer"
                  >
                    + Novo nesta célula
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredRisks.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">Nenhum risco com os filtros atuais</p>
                  </div>
                ) : (
                  filteredRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className="p-3.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-800 transition-all space-y-2 text-slate-200"
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
                            onClick={() => duplicateRisk(risk.id)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                            title="Duplicar Risco"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openEditModal(risk)}
                            className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                            title="Editar Risco"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
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
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Nenhum risco com os filtros aplicados.
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
                        onClick={() => duplicateRisk(r.id)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                        title="Duplicar Risco"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                        title="Editar Risco"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
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

      {/* Modal Add / Edit Risk */}
      {isModalOpen && (
        <div
          id="risk-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            id="risk-form-modal-card"
            className="w-full max-w-xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                {editingRisk ? 'Editar Risco do Projeto' : 'Mapear Novo Risco na Matriz'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Evento de Risco / Ameaça <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.risk}
                  onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                  placeholder="Ex: Atraso na liberação da infraestrutura de TI"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Causa do Risco
                  </label>
                  <input
                    type="text"
                    value={formData.cause}
                    onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                    placeholder="Ex: Dependência de fornecedor terceiro"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Consequência no Projeto
                  </label>
                  <input
                    type="text"
                    value={formData.consequence}
                    onChange={(e) => setFormData({ ...formData, consequence: e.target.value })}
                    placeholder="Ex: Paralisação dos testes operacionais"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as RiskCategory })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Probabilidade ({formData.probability}/5)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Impacto ({formData.impact}/5)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: Number(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Calculated Score preview */}
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Severidade Calculada:</span>
                <RiskBadge
                  classification={calculateRiskClassification(formData.probability * formData.impact)}
                  score={formData.probability * formData.impact}
                  size="md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Ação Preventiva (Mitigação)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.preventiveAction}
                    onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
                    placeholder="O que fazer para evitar que ocorra?"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Plano de Contingência (Se ocorrer)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.contingencyPlan}
                    onChange={(e) => setFormData({ ...formData, contingencyPlan: e.target.value })}
                    placeholder="Qual o plano B imediato?"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Data de Revisão
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.reviewDate}
                    onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as RiskStatus })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
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

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  {editingRisk ? 'Salvar Alterações' : 'Mapear Risco'}
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
