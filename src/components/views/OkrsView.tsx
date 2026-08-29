import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { OKRObjective, KeyResult, KRStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ArrowRight,
  CheckSquare,
} from 'lucide-react';

export const OkrsView: React.FC = () => {
  const {
    currentProject,
    currentProjectOKRs,
    addObjective,
    updateObjective,
    duplicateOkr,
    deleteObjective,
    addKeyResult,
    updateKeyResult,
    deleteKeyResult,
  } = useConsulting();

  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [expandedObjectives, setExpandedObjectives] = useState<Record<string, boolean>>({});

  // Modal Objective
  const [isObjModalOpen, setIsObjModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<OKRObjective | null>(null);
  const [objForm, setObjForm] = useState({
    title: '',
    category: 'Estratégico',
    cycle: 'Q1 2025',
    owner: currentProject?.leadConsultant || '',
    description: '',
  });

  // Modal KR
  const [isKrModalOpen, setIsKrModalOpen] = useState(false);
  const [targetObjId, setTargetObjId] = useState<string | null>(null);
  const [editingKr, setEditingKr] = useState<KeyResult | null>(null);
  const [krForm, setKrForm] = useState<{
    title: string;
    initialValue: number;
    targetValue: number;
    currentValue: number;
    unit: string;
    owner: string;
    status: KRStatus;
  }>({
    title: '',
    initialValue: 0,
    targetValue: 100,
    currentValue: 20,
    unit: '%',
    owner: currentProject?.leadConsultant || '',
    status: 'No rumo',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'obj' | 'kr';
    id: string;
    parentObjId?: string;
  } | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  const cycles = Array.from(new Set(currentProjectOKRs.map((o) => o.cycle))).filter(Boolean);

  const toggleExpand = (id: string) => {
    setExpandedObjectives((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddObj = () => {
    setEditingObj(null);
    setObjForm({
      title: '',
      category: 'Estratégico',
      cycle: 'Q1 2025',
      owner: currentProject.leadConsultant,
      description: '',
    });
    setIsObjModalOpen(true);
  };

  const openEditObj = (o: OKRObjective) => {
    setEditingObj(o);
    setObjForm({
      title: o.title,
      category: o.category,
      cycle: o.cycle,
      owner: o.owner,
      description: o.description || '',
    });
    setIsObjModalOpen(true);
  };

  const handleSaveObj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objForm.title.trim()) return;

    if (editingObj) {
      updateObjective(editingObj.id, {
        title: objForm.title,
        category: objForm.category,
        cycle: objForm.cycle,
        owner: objForm.owner,
        description: objForm.description,
      });
    } else {
      addObjective({
        projectId: currentProject.id,
        title: objForm.title,
        category: objForm.category,
        cycle: objForm.cycle,
        owner: objForm.owner,
        description: objForm.description,
        keyResults: [],
      });
    }
    setIsObjModalOpen(false);
  };

  const openAddKr = (objId: string) => {
    setTargetObjId(objId);
    setEditingKr(null);
    setKrForm({
      title: '',
      initialValue: 0,
      targetValue: 100,
      currentValue: 0,
      unit: '%',
      owner: currentProject.leadConsultant,
      status: 'No rumo',
    });
    setIsKrModalOpen(true);
  };

  const openEditKr = (objId: string, kr: KeyResult) => {
    setTargetObjId(objId);
    setEditingKr(kr);
    setKrForm({
      title: kr.title,
      initialValue: kr.initialValue,
      targetValue: kr.targetValue,
      currentValue: kr.currentValue,
      unit: kr.unit,
      owner: kr.owner,
      status: kr.status,
    });
    setIsKrModalOpen(true);
  };

  const handleSaveKr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetObjId || !krForm.title.trim()) return;

    const diff = krForm.targetValue - krForm.initialValue;
    let progress = 0;
    if (diff > 0) {
      progress = Math.min(100, Math.max(0, Math.round(((krForm.currentValue - krForm.initialValue) / diff) * 100)));
    } else if (diff < 0) {
      progress = Math.min(100, Math.max(0, Math.round(((krForm.initialValue - krForm.currentValue) / (krForm.initialValue - krForm.targetValue)) * 100)));
    } else {
      progress = krForm.currentValue >= krForm.targetValue ? 100 : 0;
    }

    let status = krForm.status;
    if (progress >= 100) status = 'Atingido';

    if (editingKr) {
      updateKeyResult(targetObjId, editingKr.id, {
        title: krForm.title,
        initialValue: Number(krForm.initialValue),
        targetValue: Number(krForm.targetValue),
        currentValue: Number(krForm.currentValue),
        unit: krForm.unit,
        owner: krForm.owner,
        progressPercent: progress,
        status: status,
      });
    } else {
      addKeyResult(targetObjId, {
        title: krForm.title,
        initialValue: Number(krForm.initialValue),
        targetValue: Number(krForm.targetValue),
        currentValue: Number(krForm.currentValue),
        unit: krForm.unit,
        owner: krForm.owner,
        progressPercent: progress,
        status: status,
      });
    }
    setIsKrModalOpen(false);
  };

  const handleQuickUpdateKrValue = (
    objId: string,
    krId: string,
    newCurrentVal: number
  ) => {
    const obj = currentProjectOKRs.find((o) => o.id === objId);
    const kr = obj?.keyResults.find((k) => k.id === krId);
    if (!kr) return;

    const diff = kr.targetValue - kr.initialValue;
    let progress = 0;
    if (diff > 0) {
      progress = Math.min(100, Math.max(0, Math.round(((newCurrentVal - kr.initialValue) / diff) * 100)));
    } else if (diff < 0) {
      progress = Math.min(100, Math.max(0, Math.round(((kr.initialValue - newCurrentVal) / (kr.initialValue - kr.targetValue)) * 100)));
    } else {
      progress = newCurrentVal >= kr.targetValue ? 100 : 0;
    }

    let status = kr.status;
    if (progress >= 100) status = 'Atingido';
    else if (progress >= 70) status = 'No rumo';
    else if (progress >= 40) status = 'Em atenção';
    else status = 'Em risco';

    updateKeyResult(objId, krId, {
      currentValue: newCurrentVal,
      progressPercent: progress,
      status: status,
    });
  };

  const filteredOKRs = currentProjectOKRs.filter((o) => {
    return cycleFilter === 'all' || o.cycle === cycleFilter;
  });

  const getProgressBg = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Objetivos e Resultados-Chave (OKRs & Metas)"
        subtitle="Alinhamento estratégico, metas quantitativas mensuráveis e acompanhamento de avanço"
        actions={
          <>
            <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-sm text-slate-100">
              <span className="text-slate-400 font-medium">Ciclo:</span>
              <select
                value={cycleFilter}
                onChange={(e) => setCycleFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-slate-100">Todos os ciclos</option>
                {cycles.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-slate-100">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openAddObj}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Objetivo
            </button>
          </>
        }
      />

      {/* Objectives Accordion List */}
      <div className="space-y-4">
        {filteredOKRs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-200">Nenhum Objetivo Cadastrado</h3>
            <p className="text-xs text-slate-400 mt-1">
              Defina os objetivos estratégicos do projeto e desdobre em Key Results (KRs).
            </p>
            <button
              onClick={openAddObj}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Cadastrar Primeiro Objetivo
            </button>
          </div>
        ) : (
          filteredOKRs.map((obj) => {
            const isExpanded = expandedObjectives[obj.id] !== false; // expanded by default
            const krCount = obj.keyResults.length;
            const avgProgress =
              krCount > 0
                ? Math.round(
                    obj.keyResults.reduce((acc, k) => acc + (k.progressPercent || 0), 0) /
                      krCount
                  )
                : 0;

            return (
              <div
                key={obj.id}
                className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Objective Card Header */}
                <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleExpand(obj.id)}
                      className="p-1 text-slate-400 hover:text-slate-200 mt-0.5 rounded cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-blue-300 uppercase bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/80">
                          {obj.category}
                        </span>
                        <span className="text-[10px] text-slate-300 font-semibold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {obj.cycle}
                        </span>
                        <span className="text-xs text-slate-400">Dono: {obj.owner}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                        {obj.title}
                      </h3>
                      {obj.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">{obj.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress Metric + Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pl-8 md:pl-0">
                    <div className="w-36 text-right">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                          Progresso Médio
                        </span>
                        <span className="text-slate-100">{avgProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressBg(
                            avgProgress
                          )}`}
                          style={{ width: `${avgProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAddKr(obj.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Adicionar Key Result"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Novo KR</span>
                      </button>
                      <button
                        onClick={() => duplicateOkr(obj.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                        title="Duplicar Objetivo"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditObj(obj)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                        title="Editar Objetivo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'obj', id: obj.id })}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                        title="Excluir Objetivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Results Nested List */}
                {isExpanded && (
                  <div className="p-4 bg-slate-900 space-y-3">
                    {krCount === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        Nenhum Key Result vinculado a este objetivo.{' '}
                        <button
                          onClick={() => openAddKr(obj.id)}
                          className="text-blue-400 font-bold hover:underline cursor-pointer"
                        >
                          Clique aqui para adicionar o primeiro KR.
                        </button>
                      </div>
                    ) : (
                      obj.keyResults.map((kr) => (
                        <div
                          key={kr.id}
                          className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-850 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={kr.status} size="sm" />
                              <span className="font-bold text-slate-100 leading-snug">
                                {kr.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              <span>
                                Baseline: {kr.initialValue} {kr.unit}
                              </span>
                              <span>•</span>
                              <span>
                                Meta: {kr.targetValue} {kr.unit}
                              </span>
                              <span>•</span>
                              <span>Resp: {kr.owner}</span>
                            </div>
                          </div>

                          {/* Interactive Value Slider / Input */}
                          <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 font-medium">Realizado:</span>
                              <input
                                type="number"
                                value={kr.currentValue}
                                onChange={(e) =>
                                  handleQuickUpdateKrValue(obj.id, kr.id, Number(e.target.value))
                                }
                                className="w-20 font-mono font-bold text-slate-100 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right focus:outline-none focus:border-blue-500"
                              />
                              <span className="text-xs text-slate-400 font-medium">{kr.unit}</span>
                            </div>

                            <div className="w-24 text-right">
                              <span className="font-bold text-slate-200 text-xs">
                                {kr.progressPercent}%
                              </span>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full ${getProgressBg(
                                    kr.progressPercent
                                  )}`}
                                  style={{ width: `${kr.progressPercent}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditKr(obj.id, kr)}
                                className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'kr',
                                    id: kr.id,
                                    parentObjId: obj.id,
                                  })
                                }
                                className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Objective */}
      {isObjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100">
                {editingObj ? 'Editar Objetivo Estratégico' : 'Novo Objetivo Estratégico'}
              </h3>
              <button onClick={() => setIsObjModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveObj} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Enunciado do Objetivo <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={objForm.title}
                  onChange={(e) => setObjForm({ ...objForm, title: e.target.value })}
                  placeholder="Ex: Aumentar a eficiência operacional e a margem líquida"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={objForm.category}
                    onChange={(e) => setObjForm({ ...objForm, category: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Estratégico">Estratégico</option>
                    <option value="Operacional">Operacional</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Pessoas / RH">Pessoas / RH</option>
                    <option value="Comercial / MKT">Comercial / MKT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Ciclo Temporal
                  </label>
                  <input
                    type="text"
                    value={objForm.cycle}
                    onChange={(e) => setObjForm({ ...objForm, cycle: e.target.value })}
                    placeholder="Ex: Q1 2025"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Dono / Líder
                  </label>
                  <input
                    type="text"
                    value={objForm.owner}
                    onChange={(e) => setObjForm({ ...objForm, owner: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição / Contexto
                </label>
                <textarea
                  rows={2}
                  value={objForm.description}
                  onChange={(e) => setObjForm({ ...objForm, description: e.target.value })}
                  placeholder="Por que este objetivo é prioridade estratégica no momento?"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsObjModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  Salvar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit KR */}
      {isKrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100">
                {editingKr ? 'Editar Key Result (KR)' : 'Adicionar Key Result Mensurável (KR)'}
              </h3>
              <button onClick={() => setIsKrModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKr} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Métrica / Key Result <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={krForm.title}
                  onChange={(e) => setKrForm({ ...krForm, title: e.target.value })}
                  placeholder="Ex: Reduzir tempo de faturamento de 45 para 20 dias"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Inicial
                  </label>
                  <input
                    type="number"
                    value={krForm.initialValue}
                    onChange={(e) => setKrForm({ ...krForm, initialValue: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Meta Final
                  </label>
                  <input
                    type="number"
                    required
                    value={krForm.targetValue}
                    onChange={(e) => setKrForm({ ...krForm, targetValue: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Realizado
                  </label>
                  <input
                    type="number"
                    value={krForm.currentValue}
                    onChange={(e) => setKrForm({ ...krForm, currentValue: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={krForm.unit}
                    onChange={(e) => setKrForm({ ...krForm, unit: e.target.value })}
                    placeholder="%, R$, dias"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={krForm.owner}
                    onChange={(e) => setKrForm({ ...krForm, owner: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={krForm.status}
                    onChange={(e) =>
                      setKrForm({ ...krForm, status: e.target.value as KRStatus })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="No rumo">No rumo (Verde)</option>
                    <option value="Em atenção">Em atenção (Amarelo)</option>
                    <option value="Em risco">Em risco (Vermelho)</option>
                    <option value="Atingido">Atingido (Concluído)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsKrModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  Salvar Key Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            if (deleteConfirm.type === 'obj') {
              deleteObjective(deleteConfirm.id);
            } else if (deleteConfirm.type === 'kr' && deleteConfirm.parentObjId) {
              deleteKeyResult(deleteConfirm.parentObjId, deleteConfirm.id);
            }
            setDeleteConfirm(null);
          }
        }}
        title="Excluir item?"
        message="Tem certeza que deseja excluir este item de OKR?"
        confirmText="Sim, Excluir"
      />
    </div>
  );
};
