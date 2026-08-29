import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { SwotCategory, SwotItem, PriorityLevel } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Grid2X2,
  List,
  Edit2,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Star,
  SlidersHorizontal,
} from 'lucide-react';

export const SwotView: React.FC = () => {
  const {
    currentProject,
    currentProjectSwot,
    addSwotItem,
    updateSwotItem,
    deleteSwotItem,
    duplicateSwotItem,
    toggleSwotSelection,
    settings,
  } = useConsulting();

  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [detailMode, setDetailMode] = useState<'detailed' | 'compact'>('detailed');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [onlySelectedFilter, setOnlySelectedFilter] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SwotItem | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<SwotCategory>('Forças');

  const [formData, setFormData] = useState<{
    category: SwotCategory;
    factor: string;
    description: string;
    priority: PriorityLevel;
    impact: number;
    isSelected: boolean;
  }>({
    category: 'Forças',
    factor: '',
    description: '',
    priority: 'Alta',
    impact: 4,
    isSelected: false,
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  const openAddModal = (cat: SwotCategory = 'Forças') => {
    setEditingItem(null);
    setDefaultCategory(cat);
    setFormData({
      category: cat,
      factor: '',
      description: '',
      priority: 'Alta',
      impact: 4,
      isSelected: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: SwotItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      factor: item.factor,
      description: item.description,
      priority: item.priority,
      impact: item.impact,
      isSelected: item.isSelected,
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.factor.trim()) return;

    if (editingItem) {
      updateSwotItem(editingItem.id, formData);
    } else {
      addSwotItem({
        ...formData,
        projectId: currentProject.id,
      });
    }
    setIsModalOpen(false);
  };

  const categories: SwotCategory[] = ['Forças', 'Fraquezas', 'Oportunidades', 'Ameaças'];

  const quadrantStyles: Record<
    SwotCategory,
    {
      bg: string;
      border: string;
      headerBg: string;
      textColor: string;
      accentBadge: string;
      type: string;
      desc: string;
    }
  > = {
    Forças: {
      bg: 'bg-emerald-950/15',
      border: 'border-emerald-900/60',
      headerBg: 'bg-emerald-950/40 text-emerald-300',
      textColor: 'text-emerald-400',
      accentBadge: 'bg-emerald-600 text-white',
      type: 'Interno / Positivo',
      desc: 'Capacidades, recursos e diferenciais competitivos.',
    },
    Fraquezas: {
      bg: 'bg-rose-950/15',
      border: 'border-rose-900/60',
      headerBg: 'bg-rose-950/40 text-rose-300',
      textColor: 'text-rose-400',
      accentBadge: 'bg-rose-600 text-white',
      type: 'Interno / Negativo',
      desc: 'Gargalos, deficiências e vulnerabilidades internas.',
    },
    Oportunidades: {
      bg: 'bg-blue-950/15',
      border: 'border-blue-900/60',
      headerBg: 'bg-blue-950/40 text-blue-300',
      textColor: 'text-blue-400',
      accentBadge: 'bg-blue-600 text-white',
      type: 'Externo / Positivo',
      desc: 'Tendências de mercado, novos canais e parcerias.',
    },
    Ameaças: {
      bg: 'bg-amber-950/15',
      border: 'border-amber-900/60',
      headerBg: 'bg-amber-950/40 text-amber-300',
      textColor: 'text-amber-400',
      accentBadge: 'bg-amber-600 text-white',
      type: 'Externo / Negativo',
      desc: 'Riscos regulatórios, concorrência e mudanças de cenário.',
    },
  };

  const filteredItems = currentProjectSwot.filter((item) => {
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesSelected = onlySelectedFilter ? item.isSelected : true;
    return matchesPriority && matchesSelected;
  });

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Análise SWOT (Matriz FOFA)"
        subtitle="Mapeamento de Forças, Fraquezas, Oportunidades e Ameaças do diagnóstico"
        actions={
          <>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                id="swot-view-matrix-btn"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                Matriz 2x2
              </button>
              <button
                id="swot-view-table-btn"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista / Tabela
              </button>
            </div>

            <button
              id="swot-add-factor-btn"
              onClick={() => openAddModal('Forças')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Fator
            </button>
          </>
        }
      />

      {/* Filter and View Controls Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-100">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todas as prioridades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={onlySelectedFilter}
              onChange={(e) => setOnlySelectedFilter(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Apenas Priorizados
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Exibição:</span>
          <button
            onClick={() => setDetailMode(detailMode === 'detailed' ? 'compact' : 'detailed')}
            className="text-xs font-semibold text-blue-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            {detailMode === 'detailed' ? 'Modo Resumido' : 'Modo Detalhado'}
          </button>
        </div>
      </div>

      {/* MATRIX VIEW (2x2) */}
      {viewMode === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((category) => {
            const style = quadrantStyles[category];
            const items = filteredItems.filter((i) => i.category === category);
            const totalInCat = currentProjectSwot.filter((i) => i.category === category).length;
            const selectedInCat = currentProjectSwot.filter(
              (i) => i.category === category && i.isSelected
            ).length;
            const limit = settings.swotQuadrantItemLimit || 5;
            const isOverLimit = selectedInCat > limit;

            return (
              <div
                key={category}
                id={`swot-quadrant-${category.toLowerCase()}`}
                className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden shadow-sm flex flex-col`}
              >
                {/* Quadrant Header */}
                <div className={`p-4 border-b ${style.border} bg-slate-900/80 flex items-center justify-between gap-2`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-bold ${style.textColor}`}>{category.toUpperCase()}</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {style.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{style.desc}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                      {items.length} {items.length === 1 ? 'fator' : 'fatores'}
                    </span>
                    <button
                      id={`add-swot-${category.toLowerCase()}-btn`}
                      onClick={() => openAddModal(category)}
                      className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shadow-xs cursor-pointer"
                      title={`Adicionar ${category}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Limit Warning */}
                {isOverLimit && (
                  <div className="px-4 py-2 bg-amber-950/60 border-b border-amber-800 text-amber-300 text-xs flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Atenção: {selectedInCat} itens priorizados. O recomendado é priorizar até {limit} itens chave
                      por quadrante.
                    </span>
                  </div>
                )}

                {/* Items List */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                  {items.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 bg-slate-900/60 rounded-lg border border-dashed border-slate-800">
                      <p className="text-xs font-medium">Nenhum fator registrado neste quadrante</p>
                      <button
                        onClick={() => openAddModal(category)}
                        className="mt-2 text-xs font-semibold text-blue-400 hover:underline cursor-pointer"
                      >
                        + Adicionar primeiro item
                      </button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        id={`swot-item-${item.id}`}
                        className={`p-3.5 bg-slate-900 rounded-lg border transition-all shadow-sm hover:shadow-md flex flex-col gap-2 ${
                          item.isSelected ? 'border-amber-500/80 ring-1 ring-amber-500/40' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <button
                              id={`toggle-swot-selection-${item.id}`}
                              onClick={() => toggleSwotSelection(item.id)}
                              className="mt-0.5 text-slate-600 hover:text-amber-400 transition-colors cursor-pointer"
                              title={item.isSelected ? 'Remover da priorização' : 'Marcar como prioridade estratégica'}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  item.isSelected ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                                }`}
                              />
                            </button>
                            <h4 className="text-xs font-bold text-slate-100 leading-snug">{item.factor}</h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => duplicateSwotItem(item.id)}
                              className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                              title="Duplicar Item"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {detailMode === 'detailed' && item.description && (
                          <p className="text-xs text-slate-400 leading-relaxed pl-6">{item.description}</p>
                        )}

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 pl-6">
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={item.priority} size="sm" />
                            <span className="font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-750">
                              Impacto: {item.impact}/5
                            </span>
                          </div>
                          {item.isSelected && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                              Prioridade Estratégica
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-x-auto text-slate-100">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Foco</th>
                <th className="py-3 px-4">Quadrante</th>
                <th className="py-3 px-4">Fator / Item</th>
                <th className="py-3 px-4">Descrição Detalhada</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Impacto</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum fator correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleSwotSelection(item.id)}
                        className="cursor-pointer"
                        title="Priorizar"
                      >
                        <Star
                          className={`w-4 h-4 inline-block ${
                            item.isSelected ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          quadrantStyles[item.category].headerBg
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">{item.factor}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{item.description}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{item.impact} / 5</td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => duplicateSwotItem(item.id)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                        title="Duplicar Item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                        title="Editar Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                        title="Excluir Item"
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

      {/* Create / Edit SWOT Modal */}
      {isModalOpen && (
        <div
          id="swot-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            id="swot-form-modal-card"
            className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Grid2X2 className="w-5 h-5 text-blue-400" />
                {editingItem ? 'Editar Fator SWOT' : 'Adicionar Fator à Matriz SWOT'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Quadrante SWOT <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as SwotCategory })}
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                >
                  <option value="Forças">Forças (Forças Internas)</option>
                  <option value="Fraquezas">Fraquezas (Fragilidades Internas)</option>
                  <option value="Oportunidades">Oportunidades (Tendências Externas)</option>
                  <option value="Ameaças">Ameaças (Riscos Externos)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Fator ou Item Sintético <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.factor}
                  onChange={(e) => setFormData({ ...formData, factor: e.target.value })}
                  placeholder="Ex: Alta reputação da marca e fidelidade do cliente"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição Detalhada e Evidências
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contexto diagnóstico, métricas observadas ou justificativa do fator."
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Relevância / Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
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
                    Nível de Impacto Estimado (1 a 5)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={formData.impact}
                      onChange={(e) => setFormData({ ...formData, impact: Number(e.target.value) })}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <span className="font-bold text-sm text-slate-100 w-8 text-center bg-slate-800 border border-slate-700 py-1 rounded">
                      {formData.impact}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="swot-modal-select-checkbox"
                  checked={formData.isSelected}
                  onChange={(e) => setFormData({ ...formData, isSelected: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-400 cursor-pointer w-4 h-4"
                />
                <label
                  htmlFor="swot-modal-select-checkbox"
                  className="text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Marcar como item de Priorização Estratégica (Destaque nos relatórios)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
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
                  {editingItem ? 'Salvar Alterações' : 'Adicionar Fator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteSwotItem(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Remover Fator SWOT?"
        message="Tem certeza que deseja remover este fator da análise SWOT?"
        confirmText="Sim, Remover"
      />
    </div>
  );
};
