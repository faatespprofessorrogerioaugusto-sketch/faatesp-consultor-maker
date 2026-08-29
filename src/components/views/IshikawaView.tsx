import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { IshikawaCause, IshikawaSubcause, PriorityLevel, IshikawaStatus } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  GitFork,
  Plus,
  Network,
  ListTree,
  Edit2,
  Trash2,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const IshikawaView: React.FC = () => {
  const {
    currentProject,
    currentProjectIshikawa,
    saveIshikawa,
    addIshikawaCause,
    updateIshikawaCause,
    deleteIshikawaCause,
    convertIshikawaTo5W2H,
    settings,
  } = useConsulting();

  const [viewMode, setViewMode] = useState<'diagram' | 'tree'>('diagram');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Problem Header Edit Modal
  const [isHeaderEditOpen, setIsHeaderEditOpen] = useState(false);
  const [problemHeader, setProblemHeader] = useState({
    problemStatement: currentProjectIshikawa?.problemStatement || '',
    description: currentProjectIshikawa?.description || '',
    responsible: currentProjectIshikawa?.responsible || currentProject?.leadConsultant || '',
    identificationDate:
      currentProjectIshikawa?.identificationDate || new Date().toISOString().split('T')[0],
  });

  // Cause Modal State
  const [isCauseModalOpen, setIsCauseModalOpen] = useState(false);
  const [editingCause, setEditingCause] = useState<IshikawaCause | null>(null);

  const [causeForm, setCauseForm] = useState<{
    category: string;
    cause: string;
    evidence: string;
    relevance: PriorityLevel;
    recommendedAction: string;
    status: IshikawaStatus;
    subcausesText: string;
  }>({
    category: 'Processos',
    cause: '',
    evidence: '',
    relevance: 'Alta',
    recommendedAction: '',
    status: 'Identificada',
    subcausesText: '',
  });

  // Custom Category Add
  const [isCustomCategoryModalOpen, setIsCustomCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  const allCategories = currentProjectIshikawa?.categories || [
    'Pessoas',
    'Processos',
    'Tecnologia',
    'Recursos',
    'Ambiente',
    'Medição',
    'Gestão',
    'Comunicação',
  ];

  const causes = currentProjectIshikawa?.causes || [];

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    saveIshikawa({
      projectId: currentProject.id,
      problemStatement: problemHeader.problemStatement,
      description: problemHeader.description,
      responsible: problemHeader.responsible,
      identificationDate: problemHeader.identificationDate,
      categories: allCategories,
      causes: causes,
    });
    setIsHeaderEditOpen(false);
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || allCategories.includes(newCategoryName.trim())) return;
    const updatedCategories = [...allCategories, newCategoryName.trim()];
    saveIshikawa({
      projectId: currentProject.id,
      problemStatement: currentProjectIshikawa?.problemStatement || 'Definição do Efeito / Problema',
      description: currentProjectIshikawa?.description || '',
      responsible: currentProjectIshikawa?.responsible || currentProject.leadConsultant,
      identificationDate:
        currentProjectIshikawa?.identificationDate || new Date().toISOString().split('T')[0],
      categories: updatedCategories,
      causes: causes,
    });
    setNewCategoryName('');
    setIsCustomCategoryModalOpen(false);
  };

  const openAddCause = (cat: string = 'Processos') => {
    setEditingCause(null);
    setCauseForm({
      category: cat,
      cause: '',
      evidence: '',
      relevance: 'Alta',
      recommendedAction: '',
      status: 'Identificada',
      subcausesText: '',
    });
    setIsCauseModalOpen(true);
  };

  const openEditCause = (c: IshikawaCause) => {
    setEditingCause(c);
    setCauseForm({
      category: c.category,
      cause: c.cause,
      evidence: c.evidence || '',
      relevance: c.relevance,
      recommendedAction: c.recommendedAction || c.investigationAction || '',
      status: c.status,
      subcausesText: (c.subcauses || []).map((s) => (typeof s === 'string' ? s : s.text)).join('\n'),
    });
    setIsCauseModalOpen(true);
  };

  const handleSaveCause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!causeForm.cause.trim()) return;

    const subcauses: IshikawaSubcause[] = causeForm.subcausesText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t, idx) => ({ id: `sub-${Date.now()}-${idx}`, text: t }));

    if (editingCause) {
      updateIshikawaCause(editingCause.id, {
        category: causeForm.category,
        cause: causeForm.cause,
        evidence: causeForm.evidence,
        relevance: causeForm.relevance,
        recommendedAction: causeForm.recommendedAction,
        status: causeForm.status,
        subcauses: subcauses,
      });
    } else {
      addIshikawaCause({
        category: causeForm.category,
        cause: causeForm.cause,
        evidence: causeForm.evidence,
        relevance: causeForm.relevance,
        recommendedAction: causeForm.recommendedAction,
        status: causeForm.status,
        subcauses: subcauses,
      });
    }
    setIsCauseModalOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Diagrama de Ishikawa (Espinha de Peixe / Causa & Efeito)"
        subtitle="Análise profunda das causas raízes e fatores determinantes do problema central"
        actions={
          <>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('diagram')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'diagram' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                Diagrama Gráfico
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                Árvore de Causas
              </button>
            </div>

            <button
              onClick={() => openAddCause(allCategories[0])}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Causa
            </button>
          </>
        }
      />

      {/* Central Problem Statement Header Card */}
      <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-100">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
              Efeito / Problema Central Sob Diagnóstico
            </span>
            <span className="text-xs text-slate-400">
              Identificado em: {currentProjectIshikawa?.identificationDate || 'Não informado'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            {currentProjectIshikawa?.problemStatement || 'Defina o problema central a ser analisado'}
          </h2>
          <p className="text-xs text-slate-400">
            {currentProjectIshikawa?.description || 'Nenhuma descrição detalhada informada.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setProblemHeader({
                problemStatement: currentProjectIshikawa?.problemStatement || '',
                description: currentProjectIshikawa?.description || '',
                responsible: currentProjectIshikawa?.responsible || currentProject.leadConsultant,
                identificationDate:
                  currentProjectIshikawa?.identificationDate || new Date().toISOString().split('T')[0],
              });
              setIsHeaderEditOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Editar Problema Central
          </button>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="font-semibold text-slate-400 mr-1">Filtrar Categoria:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas ({causes.length})
          </button>
          {allCategories.map((cat) => {
            const count = causes.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsCustomCategoryModalOpen(true)}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 py-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Categoria
        </button>
      </div>

      {/* VIEW: VISUAL FISHBONE CANVAS DIAGRAM */}
      {viewMode === 'diagram' ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-6 overflow-x-auto text-slate-100">
          <div className="min-w-[900px] relative py-8">
            {/* Main Central Spine Arrow Line */}
            <div className="relative flex items-center my-12">
              <div className="flex-1 h-2 bg-slate-700 rounded-l-full relative" />
              {/* Fish Head (Central Problem Box) */}
              <div className="w-72 bg-gradient-to-r from-slate-950 to-rose-950 text-white p-4 rounded-xl shadow-xl border-2 border-rose-500/60 shrink-0 relative -ml-2 z-10">
                <span className="text-[9px] uppercase font-bold text-rose-400 tracking-wider block">
                  Problema / Efeito
                </span>
                <p className="text-xs font-bold mt-1 line-clamp-3 leading-snug">
                  {currentProjectIshikawa?.problemStatement || 'Defina o Problema Central'}
                </p>
                <div className="mt-2 pt-2 border-t border-rose-900/50 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{causes.length} causas</span>
                  <span>{causes.filter((c) => c.status === 'Confirmada').length} confirmadas</span>
                </div>
              </div>
            </div>

            {/* Upper Category Branches */}
            <div className="grid grid-cols-4 gap-4 -mt-44 mb-20 relative z-20">
              {allCategories.slice(0, 4).map((cat) => {
                const catCauses = causes.filter((c) => c.category === cat);
                return (
                  <div
                    key={cat}
                    className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between min-h-[170px]"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                        <span className="font-bold text-xs text-blue-300 uppercase tracking-wide">
                          {cat}
                        </span>
                        <button
                          onClick={() => openAddCause(cat)}
                          className="p-1 text-blue-400 hover:bg-slate-700 rounded cursor-pointer"
                          title={`Adicionar causa em ${cat}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                        {catCauses.length === 0 ? (
                          <span className="text-[11px] text-slate-500 italic block">
                            Nenhuma causa nesta espinha
                          </span>
                        ) : (
                          catCauses.map((c) => (
                            <div
                              key={c.id}
                              className={`p-2 rounded-lg text-xs border transition-all ${
                                c.status === 'Confirmada'
                                  ? 'bg-rose-950/50 border-rose-800 text-rose-100'
                                  : 'bg-slate-900 border-slate-700 text-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-bold leading-snug">{c.cause}</span>
                                <button
                                  onClick={() => openEditCause(c)}
                                  className="text-slate-400 hover:text-blue-400 p-0.5 cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px]">
                                <StatusBadge status={c.status} size="sm" />
                                {c.status === 'Confirmada' && (
                                  <button
                                    onClick={() => convertIshikawaTo5W2H(c.id)}
                                    className="text-blue-400 hover:underline font-bold cursor-pointer"
                                    title="Gerar Ação 5W2H"
                                  >
                                    + 5W2H
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lower Category Branches */}
            <div className="grid grid-cols-4 gap-4 mt-8 relative z-20">
              {allCategories.slice(4, 8).map((cat) => {
                const catCauses = causes.filter((c) => c.category === cat);
                return (
                  <div
                    key={cat}
                    className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between min-h-[170px]"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                        <span className="font-bold text-xs text-blue-300 uppercase tracking-wide">
                          {cat}
                        </span>
                        <button
                          onClick={() => openAddCause(cat)}
                          className="p-1 text-blue-400 hover:bg-slate-700 rounded cursor-pointer"
                          title={`Adicionar causa em ${cat}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                        {catCauses.length === 0 ? (
                          <span className="text-[11px] text-slate-500 italic block">
                            Nenhuma causa nesta espinha
                          </span>
                        ) : (
                          catCauses.map((c) => (
                            <div
                              key={c.id}
                              className={`p-2 rounded-lg text-xs border transition-all ${
                                c.status === 'Confirmada'
                                  ? 'bg-rose-950/50 border-rose-800 text-rose-100'
                                  : 'bg-slate-900 border-slate-700 text-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-bold leading-snug">{c.cause}</span>
                                <button
                                  onClick={() => openEditCause(c)}
                                  className="text-slate-400 hover:text-blue-400 p-0.5 cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px]">
                                <StatusBadge status={c.status} size="sm" />
                                {c.status === 'Confirmada' && (
                                  <button
                                    onClick={() => convertIshikawaTo5W2H(c.id)}
                                    className="text-blue-400 hover:underline font-bold cursor-pointer"
                                    title="Gerar Ação 5W2H"
                                  >
                                    + 5W2H
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW: HIERARCHICAL TREE VIEW */
        <div className="space-y-4 text-slate-100">
          {allCategories
            .filter((cat) => selectedCategory === 'all' || selectedCategory === cat)
            .map((cat) => {
              const catCauses = causes.filter((c) => c.category === cat);
              return (
                <div
                  key={cat}
                  className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <h3 className="font-bold text-slate-100 text-sm">{cat}</h3>
                      <span className="text-xs text-slate-400">({catCauses.length} causas)</span>
                    </div>
                    <button
                      onClick={() => openAddCause(cat)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-400 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Causa em {cat}
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {catCauses.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        Nenhuma causa identificada na categoria {cat}.
                      </p>
                    ) : (
                      catCauses.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl border border-slate-750 bg-slate-800/50 hover:bg-slate-800 transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-100">{c.cause}</h4>
                                <PriorityBadge priority={c.relevance} size="sm" />
                                <StatusBadge status={c.status} size="sm" />
                              </div>
                              {c.evidence && (
                                <p className="text-xs text-slate-300 mt-1">
                                  <strong className="text-slate-200">Evidência:</strong> {c.evidence}
                                </p>
                              )}
                              {c.recommendedAction && (
                                <p className="text-xs text-blue-300 mt-1">
                                  <strong className="text-blue-200">Ação recomendada:</strong> {c.recommendedAction}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => convertIshikawaTo5W2H(c.id)}
                                className="px-2 py-1 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 rounded border border-emerald-800 flex items-center gap-1 cursor-pointer"
                                title="Converter em Ação 5W2H"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                Gerar 5W2H
                              </button>
                              <button
                                onClick={() => openEditCause(c)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(c.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Subcauses / 5 Whys */}
                          {c.subcauses && c.subcauses.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700/70 pl-3">
                              <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                                Subcausas (Por que ocorre?):
                              </p>
                              <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-300">
                                {c.subcauses.map((sub, sIdx) => (
                                  <li key={typeof sub === 'string' ? sIdx : sub.id || sIdx}>
                                    {typeof sub === 'string' ? sub : sub.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Modal: Edit Problem Statement */}
      {isHeaderEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100">Editar Efeito / Problema Central</h3>
              <button onClick={() => setIsHeaderEditOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveHeader} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Enunciado do Problema Central <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={problemHeader.problemStatement}
                  onChange={(e) => setProblemHeader({ ...problemHeader, problemStatement: e.target.value })}
                  placeholder="Ex: Tempo médio de faturamento 40% acima da meta"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição & Contexto
                </label>
                <textarea
                  rows={3}
                  value={problemHeader.description}
                  onChange={(e) => setProblemHeader({ ...problemHeader, description: e.target.value })}
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Responsável pela Análise
                  </label>
                  <input
                    type="text"
                    value={problemHeader.responsible}
                    onChange={(e) => setProblemHeader({ ...problemHeader, responsible: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Data de Identificação
                  </label>
                  <input
                    type="date"
                    value={problemHeader.identificationDate}
                    onChange={(e) =>
                      setProblemHeader({ ...problemHeader, identificationDate: e.target.value })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsHeaderEditOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Cause */}
      {isCauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100">
                {editingCause ? 'Editar Causa do Diagrama' : 'Adicionar Causa Raiz ao Diagrama'}
              </h3>
              <button onClick={() => setIsCauseModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCause} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Categoria da Espinha <span className="text-rose-400">*</span>
                </label>
                <select
                  value={causeForm.category}
                  onChange={(e) => setCauseForm({ ...causeForm, category: e.target.value })}
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Causa Principal <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={causeForm.cause}
                  onChange={(e) => setCauseForm({ ...causeForm, cause: e.target.value })}
                  placeholder="Ex: Falta de padronização nas regras de validação cadastral"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Subcausas / 5 Porquês (uma por linha)
                </label>
                <textarea
                  rows={2}
                  value={causeForm.subcausesText}
                  onChange={(e) => setCauseForm({ ...causeForm, subcausesText: e.target.value })}
                  placeholder="Ex: Não há manual de processos atualizado&#10;Treinamento de novos analistas é informal"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none font-mono placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Grau de Relevância
                  </label>
                  <select
                    value={causeForm.relevance}
                    onChange={(e) =>
                      setCauseForm({ ...causeForm, relevance: e.target.value as PriorityLevel })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status da Causa
                  </label>
                  <select
                    value={causeForm.status}
                    onChange={(e) =>
                      setCauseForm({ ...causeForm, status: e.target.value as IshikawaStatus })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Identificada">Identificada</option>
                    <option value="Em investigação">Em investigação</option>
                    <option value="Confirmada">Confirmada (Causa Raiz)</option>
                    <option value="Descartada">Descartada</option>
                    <option value="Em tratamento">Em tratamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Evidências / Dados Observados
                </label>
                <input
                  type="text"
                  value={causeForm.evidence}
                  onChange={(e) => setCauseForm({ ...causeForm, evidence: e.target.value })}
                  placeholder="Ex: 68% dos erros de lançamento ocorrem no passo 3"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Ação de Investigação / Contenção Recomendada
                </label>
                <input
                  type="text"
                  value={causeForm.recommendedAction}
                  onChange={(e) => setCauseForm({ ...causeForm, recommendedAction: e.target.value })}
                  placeholder="Ex: Redesenhar checklist operacional e integrar validação no ERP"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCauseModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  {editingCause ? 'Salvar Alterações' : 'Adicionar Causa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Custom Category */}
      {isCustomCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 rounded-xl shadow-2xl border border-slate-750 p-6 text-slate-100">
            <h3 className="text-base font-bold text-slate-100 mb-2">Adicionar Categoria de Espinha</h3>
            <p className="text-xs text-slate-400 mb-4">
              Crie uma categoria personalizada para o seu ramo de atuação (ex: Jurídico, Logística, Marketing).
            </p>
            <form onSubmit={handleAddCustomCategory} className="space-y-4">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomCategoryModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteIshikawaCause(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Remover Causa do Ishikawa?"
        message="Tem certeza que deseja remover esta causa do diagrama?"
        confirmText="Sim, Remover"
      />
    </div>
  );
};
