import React, { useState, useMemo } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { ParetoItem } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  TrendingUp,
  Plus,
  BarChart3,
  Edit2,
  Trash2,
  Copy,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const ParetoView: React.FC = () => {
  const {
    currentProject,
    currentProjectPareto,
    addParetoItem,
    updateParetoItem,
    duplicateParetoItem,
    deleteParetoItem,
    formatCurrency,
  } = useConsulting();

  const [metricMode, setMetricMode] = useState<'count' | 'cost' | 'impact'>('count');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ParetoItem | null>(null);

  const [formData, setFormData] = useState<{
    category: string;
    description: string;
    count: number;
    estimatedCost: number;
    impactScore: number;
    period: string;
  }>({
    category: '',
    description: '',
    count: 10,
    estimatedCost: 0,
    impactScore: 5,
    period: 'Últimos 30 dias',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  // Calculate Sorted Pareto & Cumulative %
  const paretoCalculated = useMemo(() => {
    // Determine sort value by metric
    const items = [...currentProjectPareto].map((item) => {
      let value = item.count;
      if (metricMode === 'cost') value = item.estimatedCost || 0;
      if (metricMode === 'impact') value = (item.impactScore || 1) * item.count;
      return { ...item, metricValue: value };
    });

    items.sort((a, b) => b.metricValue - a.metricValue);

    const total = items.reduce((acc, curr) => acc + curr.metricValue, 0);

    let cumulativeSum = 0;
    return items.map((item) => {
      cumulativeSum += item.metricValue;
      const percentage = total > 0 ? (item.metricValue / total) * 100 : 0;
      const cumulativePercentage = total > 0 ? (cumulativeSum / total) * 100 : 0;
      const isVitalFew = cumulativePercentage - percentage < 80; // part of the 80% effect

      return {
        ...item,
        percentage: Number(percentage.toFixed(1)),
        cumulativePercentage: Number(cumulativePercentage.toFixed(1)),
        isVitalFew,
      };
    });
  }, [currentProjectPareto, metricMode]);

  const totalOccurrences = currentProjectPareto.reduce((acc, i) => acc + (i.count || 0), 0);
  const totalCost = currentProjectPareto.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
  const vitalFewItems = paretoCalculated.filter((i) => i.isVitalFew);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      category: '',
      description: '',
      count: 10,
      estimatedCost: 0,
      impactScore: 5,
      period: 'Últimos 30 dias',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ParetoItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      description: item.description || '',
      count: item.count,
      estimatedCost: item.estimatedCost || 0,
      impactScore: item.impactScore || 5,
      period: item.period || 'Últimos 30 dias',
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category.trim()) return;

    if (editingItem) {
      updateParetoItem(editingItem.id, {
        category: formData.category,
        description: formData.description,
        count: Number(formData.count),
        estimatedCost: Number(formData.estimatedCost),
        impactScore: Number(formData.impactScore),
        period: formData.period,
      });
    } else {
      addParetoItem({
        projectId: currentProject.id,
        category: formData.category,
        description: formData.description,
        count: Number(formData.count),
        estimatedCost: Number(formData.estimatedCost),
        impactScore: Number(formData.impactScore),
        period: formData.period,
      });
    }
    setIsModalOpen(false);
  };

  const maxVal = Math.max(...paretoCalculated.map((i) => i.metricValue), 1);

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Análise de Pareto (Princípio 80/20)"
        subtitle="Identificação dos 'poucos vitais' que concentram a maior parte dos problemas e custos"
        actions={
          <>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setMetricMode('count')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  metricMode === 'count' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Frequência / Qtd
              </button>
              <button
                onClick={() => setMetricMode('cost')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  metricMode === 'cost' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custo Financeiro
              </button>
              <button
                onClick={() => setMetricMode('impact')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  metricMode === 'impact' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Impacto Ponderado
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Ocorrência
            </button>
          </>
        }
      />

      {/* Vital Few Diagnostic Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 text-white rounded-xl shadow-sm border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-700">
              Diagnóstico 80/20
            </span>
            <span className="text-xs text-slate-400">
              Base: {paretoCalculated.length} categorias mapeadas
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100">
            {vitalFewItems.length} categorias concentram 80% do impacto sob a métrica selecionada
          </h3>
          <p className="text-xs text-slate-300">
            Focar nas causas vitais: {vitalFewItems.map((v) => `"${v.category}"`).join(', ')}.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Ocorrências</p>
            <p className="text-xl font-bold text-slate-100">{totalOccurrences}</p>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Custo Estimado</p>
            <p className="text-xl font-bold text-amber-400">{formatCurrency(totalCost)}</p>
          </div>
        </div>
      </div>

      {/* VISUAL PARETO COMBINED CHART (Bars + Cumulative Line + 80% Benchmark) */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Gráfico de Pareto & Curva Acumulada</h3>
            <p className="text-xs text-slate-400">
              Barras ordenadas com linha de corte dos 80% do efeito
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-blue-400 font-semibold">
              <span className="w-3 h-3 rounded bg-blue-500" /> Frequência / Valor
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <span className="w-3 h-0.5 bg-amber-400" /> Curva Acumulada (%)
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <span className="w-3 h-0.5 border-b border-dashed border-rose-400" /> Linha 80%
            </span>
          </div>
        </div>

        {paretoCalculated.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Nenhum dado cadastrado para o gráfico de Pareto</p>
          </div>
        ) : (
          <div className="relative pt-6 pb-2">
            {/* 80% Benchmark Reference Line */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-rose-500/80 z-20 pointer-events-none flex items-center justify-end pr-2"
              style={{ top: '20%' }}
            >
              <span className="text-[10px] font-bold text-rose-300 bg-rose-950/90 px-1.5 py-0.2 rounded border border-rose-800 shadow-sm">
                Corte 80%
              </span>
            </div>

            {/* Bars container */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 items-end h-64 border-b border-l border-slate-750 px-3 pb-2">
              {paretoCalculated.map((item) => {
                const heightPercent = Math.max(10, Math.round((item.metricValue / maxVal) * 100));

                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-white text-[10px] py-1 px-2 rounded pointer-events-none z-30 whitespace-nowrap shadow-lg">
                      {item.category}: {item.metricValue} ({item.percentage}%) • Acum: {item.cumulativePercentage}%
                    </div>

                    {/* Cumulative % Badge above bar */}
                    <span className="text-[10px] font-bold text-amber-400 mb-1">
                      {item.cumulativePercentage}%
                    </span>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all flex flex-col justify-between p-1.5 ${
                        item.isVitalFew
                          ? 'bg-blue-600 group-hover:bg-blue-500 shadow-sm'
                          : 'bg-slate-700 group-hover:bg-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white text-center truncate">
                        {item.metricValue}
                      </span>
                    </div>

                    {/* Category Label below */}
                    <div className="mt-2 text-center w-full">
                      <p
                        className={`text-[11px] font-bold truncate leading-tight ${
                          item.isVitalFew ? 'text-slate-100' : 'text-slate-400'
                        }`}
                        title={item.category}
                      >
                        {item.category}
                      </p>
                      <span className="text-[9px] text-slate-500 block">{item.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sorted Ranked Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden text-slate-100">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
            Tabela Ordenada de Ocorrências & Percentuais Acumulados
          </h3>
          <span className="text-xs text-slate-400">{paretoCalculated.length} itens registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-800">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Categoria / Tipo de Problema</th>
                <th className="py-3 px-4">Descrição & Período</th>
                <th className="py-3 px-3 text-right">Qtd (Frequência)</th>
                <th className="py-3 px-3 text-right">Custo Estimado</th>
                <th className="py-3 px-3 text-right">% Individual</th>
                <th className="py-3 px-3 text-right">% Acumulado</th>
                <th className="py-3 px-3 text-center">Classificação</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paretoCalculated.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-800/60 transition-colors ${
                    item.isVitalFew ? 'bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">{item.category}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="block truncate max-w-xs">{item.description}</span>
                    <span className="text-[10px] text-slate-500">{item.period}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                    {item.count}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {formatCurrency(item.estimatedCost || 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-200">
                    {item.percentage}%
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-400">
                    {item.cumulativePercentage}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.isVitalFew ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 bg-amber-950 border border-amber-800">
                        Pouco Vital (80%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-800 border border-slate-700">
                        Muitos Triviais
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right space-x-1">
                    <button
                      onClick={() => duplicateParetoItem(item.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Pareto Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100">
                {editingItem ? 'Editar Ocorrência de Pareto' : 'Nova Ocorrência / Causa para Pareto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Categoria / Tipo de Problema <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Divergência de preços no checkout"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição do Problema
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contexto ou detalhamento da não conformidade."
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Quantidade / Frequência <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.count}
                    onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Custo Financeiro Estimado (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedCost: Number(e.target.value) })
                    }
                    placeholder="0.00"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Grau de Impacto (1 a 5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.impactScore}
                    onChange={(e) =>
                      setFormData({ ...formData, impactScore: Number(e.target.value) })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Período de Apuração
                  </label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="Ex: Q1 2025 / Últimos 30 dias"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 cursor-pointer shadow-sm"
                >
                  {editingItem ? 'Salvar Alterações' : 'Adicionar Ocorrência'}
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
            deleteParetoItem(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Remover Item de Pareto?"
        message="Tem certeza que deseja remover este item da análise de Pareto?"
        confirmText="Sim, Remover"
      />
    </div>
  );
};
