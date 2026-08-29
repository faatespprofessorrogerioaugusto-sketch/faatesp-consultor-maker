import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { PestelItem, PestelDimension, PestelTrend, PestelImpact, PestelHorizon } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Globe,
  Plus,
  Landmark,
  TrendingUp,
  Users,
  Cpu,
  Leaf,
  Scale,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';

export const PestelView: React.FC = () => {
  const {
    currentProject,
    currentProjectPestel,
    addPestelItem,
    updatePestelItem,
    deletePestelItem,
    addSwotItem,
  } = useConsulting();

  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [filterDimension, setFilterDimension] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PestelItem | null>(null);

  const [formData, setFormData] = useState<{
    dimension: PestelDimension;
    factor: string;
    trend: PestelTrend;
    impact: PestelImpact;
    horizon: PestelHorizon;
    uncertainty: 'Baixo' | 'Médio' | 'Alto';
    implication: string;
    strategicResponse: string;
  }>({
    dimension: 'Político',
    factor: '',
    trend: 'Neutro',
    impact: 'Misto',
    horizon: 'Médio prazo',
    uncertainty: 'Médio',
    implication: '',
    strategicResponse: '',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  const dimensions: {
    key: PestelDimension;
    name: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    borderColor: string;
  }[] = [
    {
      key: 'Político',
      name: 'Político',
      icon: <Landmark className="w-4 h-4 text-rose-400" />,
      color: 'text-rose-400',
      bg: 'bg-rose-950/40',
      borderColor: 'border-rose-900/60',
    },
    {
      key: 'Econômico',
      name: 'Econômico',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      borderColor: 'border-emerald-900/60',
    },
    {
      key: 'Social',
      name: 'Social / Cultural',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      color: 'text-blue-400',
      bg: 'bg-blue-950/40',
      borderColor: 'border-blue-900/60',
    },
    {
      key: 'Tecnológico',
      name: 'Tecnológico',
      icon: <Cpu className="w-4 h-4 text-indigo-400" />,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40',
      borderColor: 'border-indigo-900/60',
    },
    {
      key: 'Ambiental',
      name: 'Ambiental / Ecológico',
      icon: <Leaf className="w-4 h-4 text-teal-400" />,
      color: 'text-teal-400',
      bg: 'bg-teal-950/40',
      borderColor: 'border-teal-900/60',
    },
    {
      key: 'Legal',
      name: 'Legal / Regulatório',
      icon: <Scale className="w-4 h-4 text-purple-400" />,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40',
      borderColor: 'border-purple-900/60',
    },
  ];

  const openCreateModal = (dim: PestelDimension = 'Político') => {
    setEditingItem(null);
    setFormData({
      dimension: dim,
      factor: '',
      trend: 'Neutro',
      impact: 'Misto',
      horizon: 'Médio prazo',
      uncertainty: 'Médio',
      implication: '',
      strategicResponse: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PestelItem) => {
    setEditingItem(item);
    setFormData({
      dimension: item.dimension,
      factor: item.factor,
      trend: item.trend,
      impact: item.impact,
      horizon: item.horizon,
      uncertainty: item.uncertainty,
      implication: item.implication || '',
      strategicResponse: item.strategicResponse || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.factor.trim()) return;

    if (editingItem) {
      updatePestelItem(editingItem.id, {
        dimension: formData.dimension,
        factor: formData.factor,
        trend: formData.trend,
        impact: formData.impact,
        horizon: formData.horizon,
        uncertainty: formData.uncertainty,
        implication: formData.implication,
        strategicResponse: formData.strategicResponse,
      });
    } else {
      addPestelItem({
        projectId: currentProject.id,
        dimension: formData.dimension,
        factor: formData.factor,
        trend: formData.trend,
        impact: formData.impact,
        horizon: formData.horizon,
        uncertainty: formData.uncertainty,
        implication: formData.implication,
        strategicResponse: formData.strategicResponse,
      });
    }
    setIsModalOpen(false);
  };

  const exportToSwot = (item: PestelItem) => {
    const isPositive =
      item.impact === 'Positivo' ||
      item.type === 'Oportunidade' ||
      item.trend === 'Favorável' ||
      item.trend === 'Positiva';
    const swotCategory = isPositive ? 'opportunities' : 'threats';
    addSwotItem({
      category: swotCategory,
      text: `[PESTEL ${item.dimension || item.category}] ${item.factor}`,
      impact: 'Alto',
      priority: 'Alta',
    });
  };

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Análise Macroambiental (PESTEL)"
        subtitle="Mapeamento dos fatores Políticos, Econômicos, Sociais, Tecnológicos, Ambientais e Legais"
        actions={
          <>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                6 Dimensões
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Matriz de Impacto
              </button>
            </div>

            <button
              onClick={() => openCreateModal('Político')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Fator PESTEL
            </button>
          </>
        }
      />

      {/* VIEW: 6 DIMENSION PANELS */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dimensions.map((dim) => {
            const items = currentProjectPestel.filter((i) => i.dimension === dim.key);

            return (
              <div
                key={dim.key}
                className={`rounded-xl border ${dim.borderColor} bg-slate-900 shadow-sm flex flex-col justify-between overflow-hidden`}
              >
                <div className={`p-4 ${dim.bg} border-b ${dim.borderColor} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {dim.icon}
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${dim.color}`}>
                      {dim.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => openCreateModal(dim.key)}
                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
                    title={`Adicionar fator ${dim.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-80">
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center italic">
                      Nenhum fator mapeado nesta dimensão.
                    </p>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-800 transition-all space-y-1.5 text-slate-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-100 leading-snug">{item.factor}</h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-0.5 text-slate-400 hover:text-blue-400 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold border ${
                              item.trend === 'Favorável'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : item.trend === 'Desfavorável'
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            Tendência: {item.trend}
                          </span>
                          <span className="bg-slate-900 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                            {item.horizon}
                          </span>
                        </div>

                        {item.implication && (
                          <p className="text-[11px] text-slate-300">
                            <strong className="text-slate-400">Impacto:</strong> {item.implication}
                          </p>
                        )}

                        {item.strategicResponse && (
                          <p className="text-[11px] text-blue-400 font-medium">
                            <strong className="text-blue-300">Resposta:</strong> {item.strategicResponse}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-700/60 flex justify-end">
                          <button
                            onClick={() => exportToSwot(item)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            title="Enviar para a Matriz SWOT"
                          >
                            <span>+ Enviar para SWOT</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
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
        /* SYNTHESIS TABLE */
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden text-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                <tr>
                  <th className="py-3 px-4">Dimensão</th>
                  <th className="py-3 px-4">Fator Macroambiental</th>
                  <th className="py-3 px-3">Tendência</th>
                  <th className="py-3 px-3">Impacto</th>
                  <th className="py-3 px-3">Horizonte</th>
                  <th className="py-3 px-4">Resposta Estratégica</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentProjectPestel.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">{item.dimension}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{item.factor}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.trend === 'Favorável'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : item.trend === 'Desfavorável'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.trend}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.impact}</td>
                    <td className="py-3 px-3 text-slate-400">{item.horizon}</td>
                    <td className="py-3 px-4 text-blue-400">{item.strategicResponse || '-'}</td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Pestel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100">
                {editingItem ? 'Editar Fator PESTEL' : 'Novo Fator Macroambiental (PESTEL)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Dimensão PESTEL <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.dimension}
                    onChange={(e) =>
                      setFormData({ ...formData, dimension: e.target.value as PestelDimension })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    {dimensions.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Tendência
                  </label>
                  <select
                    value={formData.trend}
                    onChange={(e) =>
                      setFormData({ ...formData, trend: e.target.value as PestelTrend })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Favorável">Favorável</option>
                    <option value="Neutro">Neutro</option>
                    <option value="Desfavorável">Desfavorável</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Fator Externo Observado <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.factor}
                  onChange={(e) => setFormData({ ...formData, factor: e.target.value })}
                  placeholder="Ex: Reforma tributária e simplificação do regime de créditos"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Impacto no Negócio
                  </label>
                  <select
                    value={formData.impact}
                    onChange={(e) =>
                      setFormData({ ...formData, impact: e.target.value as PestelImpact })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Positivo">Positivo (Gera Oportunidade)</option>
                    <option value="Negativo">Negativo (Gera Ameaça)</option>
                    <option value="Misto">Misto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Horizonte Temporal
                  </label>
                  <select
                    value={formData.horizon}
                    onChange={(e) =>
                      setFormData({ ...formData, horizon: e.target.value as PestelHorizon })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Curto prazo">Curto prazo (até 6 meses)</option>
                    <option value="Médio prazo">Médio prazo (6 a 24 meses)</option>
                    <option value="Longo prazo">Longo prazo (2+ anos)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Implicações e Riscos/Oportunidades
                </label>
                <textarea
                  rows={2}
                  value={formData.implication}
                  onChange={(e) => setFormData({ ...formData, implication: e.target.value })}
                  placeholder="O que isso afeta concretamente no cliente?"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Resposta Estratégica Recomendada
                </label>
                <textarea
                  rows={2}
                  value={formData.strategicResponse}
                  onChange={(e) => setFormData({ ...formData, strategicResponse: e.target.value })}
                  placeholder="Como o cliente deve se posicionar?"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
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
                  Salvar Fator PESTEL
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
            deletePestelItem(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Remover Fator PESTEL?"
        message="Tem certeza que deseja remover este fator macroambiental?"
        confirmText="Sim, Remover"
      />
    </div>
  );
};
