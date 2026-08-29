import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { BSCObjective, BSCPerspective } from '../../types';
import {
  Compass,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Users,
  Cpu,
  GraduationCap,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

const perspectiveConfig: Record<
  BSCPerspective,
  { label: string; icon: React.ReactNode; color: string; bgBadge: string; border: string; desc: string }
> = {
  financial: {
    label: '1. Perspectiva Financeira',
    icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
    color: 'text-emerald-400',
    bgBadge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
    border: 'border-emerald-900/50',
    desc: 'Como olhamos para os acionistas? Metas de lucratividade, ROI, margens e receita.',
  },
  customer: {
    label: '2. Perspectiva de Clientes & Mercado',
    icon: <Users className="w-5 h-5 text-blue-400" />,
    color: 'text-blue-400',
    bgBadge: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
    border: 'border-blue-900/50',
    desc: 'Como os clientes nos veem? NPS, satisfação, market share e retenção.',
  },
  internal: {
    label: '3. Perspectiva de Processos Internos',
    icon: <Cpu className="w-5 h-5 text-amber-400" />,
    color: 'text-amber-400',
    bgBadge: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
    border: 'border-amber-900/50',
    desc: 'Em quais processos devemos ser excelentes? Qualidade, agilidade e produtividade.',
  },
  learning: {
    label: '4. Perspectiva de Aprendizado & Crescimento',
    icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
    color: 'text-purple-400',
    bgBadge: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
    border: 'border-purple-900/50',
    desc: 'Como podemos continuar melhorando? Capacitação, cultura, liderança e tecnologia.',
  },
};

const statusConfig: Record<
  BSCObjective['status'],
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  achieved: {
    label: 'Alcançado',
    bg: 'bg-emerald-950/70 border-emerald-800/60',
    text: 'text-emerald-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  },
  on_track: {
    label: 'No Prazo',
    bg: 'bg-blue-950/70 border-blue-800/60',
    text: 'text-blue-300',
    icon: <TrendingUp className="w-3.5 h-3.5 text-blue-400" />,
  },
  warning: {
    label: 'Atenção',
    bg: 'bg-amber-950/70 border-amber-800/60',
    text: 'text-amber-300',
    icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  },
  critical: {
    label: 'Crítico',
    bg: 'bg-rose-950/70 border-rose-800/60',
    text: 'text-rose-300',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
  },
};

export const BSCView: React.FC = () => {
  const { currentProjectId, bscObjectives = [], addBscObjective, updateBscObjective, deleteBscObjective, currentProject } = useConsulting();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPerspectiveFilter, setSelectedPerspectiveFilter] = useState<string>('all');

  const [formData, setFormData] = useState<Omit<BSCObjective, 'id' | 'projectId'>>({
    perspective: 'financial',
    name: '',
    description: '',
    kpi: '',
    currentValue: 0,
    targetValue: 100,
    unit: '%',
    status: 'on_track',
    initiatives: '',
    responsible: '',
    deadline: '',
  });

  const projectObjectives = bscObjectives.filter(
    (item) => !item.projectId || item.projectId === currentProjectId
  );

  const filteredObjectives = selectedPerspectiveFilter === 'all'
    ? projectObjectives
    : projectObjectives.filter((item) => item.perspective === selectedPerspectiveFilter);

  const handleOpenModal = (item?: BSCObjective) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        perspective: item.perspective,
        name: item.name,
        description: item.description,
        kpi: item.kpi,
        currentValue: item.currentValue,
        targetValue: item.targetValue,
        unit: item.unit,
        status: item.status,
        initiatives: item.initiatives,
        responsible: item.responsible,
        deadline: item.deadline,
      });
    } else {
      setEditingId(null);
      setFormData({
        perspective: 'financial',
        name: '',
        description: '',
        kpi: '',
        currentValue: 0,
        targetValue: 100,
        unit: '%',
        status: 'on_track',
        initiatives: '',
        responsible: currentProject?.leadConsultant || '',
        deadline: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.kpi.trim()) return;

    if (editingId) {
      updateBscObjective(editingId, formData);
    } else {
      addBscObjective(formData);
    }
    setIsModalOpen(false);
  };

  // Metrics
  const totalCount = projectObjectives.length;
  const achievedCount = projectObjectives.filter((o) => o.status === 'achieved').length;
  const onTrackCount = projectObjectives.filter((o) => o.status === 'on_track').length;
  const criticalCount = projectObjectives.filter((o) => o.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Balanced Scorecard (BSC) & Mapa Estratégico
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Desdobre a visão e a estratégia do projeto nas 4 perspectivas fundamentais de Kaplan e Norton.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Objetivo BSC</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Objetivos</p>
          <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
          <span className="text-[11px] text-slate-400">Distribuídos no mapa</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Metas Atingidas</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{achievedCount}</p>
          <span className="text-[11px] text-emerald-500/80">{totalCount ? Math.round((achievedCount / totalCount) * 100) : 0}% de sucesso</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">No Prazo (On Track)</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{onTrackCount}</p>
          <span className="text-[11px] text-blue-400/80">Evolução esperada</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Pontos Críticos</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{criticalCount}</p>
          <span className="text-[11px] text-rose-400/80">Requer plano corretivo</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0 px-1">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        <button
          onClick={() => setSelectedPerspectiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedPerspectiveFilter === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas as Perspectivas ({projectObjectives.length})
        </button>
        {(['financial', 'customer', 'internal', 'learning'] as BSCPerspective[]).map((persp) => {
          const cfg = perspectiveConfig[persp];
          const count = projectObjectives.filter((o) => o.perspective === persp).length;
          return (
            <button
              key={persp}
              onClick={() => setSelectedPerspectiveFilter(persp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedPerspectiveFilter === persp
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cfg.label.split('.')[1]} ({count})
            </button>
          );
        })}
      </div>

      {/* 4 Perspectives Grid Layout */}
      <div className="space-y-6">
        {(['financial', 'customer', 'internal', 'learning'] as BSCPerspective[])
          .filter((persp) => selectedPerspectiveFilter === 'all' || selectedPerspectiveFilter === persp)
          .map((persp) => {
            const cfg = perspectiveConfig[persp];
            const items = projectObjectives.filter((o) => o.perspective === persp);

            return (
              <div
                key={persp}
                className={`p-5 rounded-2xl bg-slate-900/70 border ${cfg.border} transition-all`}
              >
                {/* Perspective Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800">{cfg.icon}</div>
                    <div>
                      <h2 className="text-base font-bold text-white">{cfg.label}</h2>
                      <p className="text-xs text-slate-400">{cfg.desc}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border self-start sm:self-auto ${cfg.bgBadge}`}>
                    {items.length} {items.length === 1 ? 'objetivo' : 'objetivos'}
                  </span>
                </div>

                {/* Items in Perspective */}
                {items.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                    <p className="text-xs text-slate-500">Nenhum objetivo cadastrado nesta perspectiva.</p>
                    <button
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, perspective: persp }));
                        handleOpenModal();
                      }}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      + Adicionar objetivo para esta perspectiva
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                      const st = statusConfig[item.status];
                      const progressPct = item.targetValue > 0
                        ? Math.min(100, Math.round((item.currentValue / item.targetValue) * 100))
                        : 0;

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm font-bold text-slate-100 flex-1 leading-snug">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${st.bg} ${st.text}`}>
                                  {st.icon}
                                  <span>{st.label}</span>
                                </span>
                                <button
                                  onClick={() => handleOpenModal(item)}
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteBscObjective(item.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* KPI & Target */}
                            <div className="mt-3.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5 text-blue-400" />
                                  {item.kpi}
                                </span>
                                <span className="font-bold text-white">
                                  {item.currentValue} {item.unit} / <span className="text-slate-400">{item.targetValue} {item.unit}</span>
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    item.status === 'achieved'
                                      ? 'bg-emerald-500'
                                      : item.status === 'critical'
                                      ? 'bg-rose-500'
                                      : item.status === 'warning'
                                      ? 'bg-amber-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>

                            {item.initiatives && (
                              <div className="mt-3 text-xs text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2 rounded-md">
                                <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                <p className="leading-snug">
                                  <strong className="text-slate-400">Iniciativas:</strong> {item.initiatives}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Resp: <strong className="text-slate-300">{item.responsible || 'Não definido'}</strong></span>
                            <span>Prazo: <strong className="text-slate-300">{item.deadline || 'A definir'}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Modal Criar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                {editingId ? 'Editar Objetivo BSC' : 'Novo Objetivo BSC'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Perspectiva BSC *
                  </label>
                  <select
                    value={formData.perspective}
                    onChange={(e) => setFormData({ ...formData, perspective: e.target.value as BSCPerspective })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="financial">1. Perspectiva Financeira</option>
                    <option value="customer">2. Perspectiva de Clientes & Mercado</option>
                    <option value="internal">3. Perspectiva de Processos Internos</option>
                    <option value="learning">4. Perspectiva de Aprendizado & Crescimento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Status do Indicador
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BSCObjective['status'] })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="on_track">No Prazo (On Track)</option>
                    <option value="achieved">Alcançado (Sucesso)</option>
                    <option value="warning">Atenção (Em Risco)</option>
                    <option value="critical">Crítico (Abaixo da Meta)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nome do Objetivo Estratégico *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Aumentar Margem Operacional EBITDA"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Descrição / Contexto
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explique como esse objetivo agrega valor para a organização..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Indicador Chave (KPI) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kpi}
                    onChange={(e) => setFormData({ ...formData, kpi: e.target.value })}
                    placeholder="Ex: Margem EBITDA"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Valor Atual
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Meta / Target & Unidade
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="%, R$, pts"
                      className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Iniciativas / Projetos Vinculados (5W2H)
                </label>
                <input
                  type="text"
                  value={formData.initiatives}
                  onChange={(e) => setFormData({ ...formData, initiatives: e.target.value })}
                  placeholder="Ex: Auditoria de estoque em tempo real e novo módulo ERP..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Nome do consultor ou líder do cliente"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Prazo Limite
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  {editingId ? 'Salvar Alterações' : 'Criar Objetivo BSC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
