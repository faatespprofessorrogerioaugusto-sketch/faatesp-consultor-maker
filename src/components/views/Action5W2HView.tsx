import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { Action5W2H, ActionStatus, PriorityLevel } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  CheckSquare2,
  Plus,
  Search,
  Filter,
  Download,
  Copy,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowUpDown,
  DollarSign,
  Calendar,
  User,
} from 'lucide-react';

export const Action5W2HView: React.FC = () => {
  const {
    currentProject,
    currentProjectActions,
    addAction,
    updateAction,
    deleteAction,
    duplicateAction,
    formatCurrency,
    settings,
  } = useConsulting();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action5W2H | null>(null);

  const [formData, setFormData] = useState<{
    what: string;
    why: string;
    where: string;
    when: string;
    who: string;
    how: string;
    howMuch: number;
    priority: PriorityLevel;
    status: ActionStatus;
    progressPercent: number;
    deliverableEvidence: string;
    relatedTool: string;
  }>({
    what: '',
    why: '',
    where: 'Geral / Matriz',
    when: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    who: currentProject?.leadConsultant || '',
    how: '',
    howMuch: 0,
    priority: 'Alta',
    status: 'Não iniciada',
    progressPercent: 0,
    deliverableEvidence: '',
    relatedTool: 'Diagnóstico Geral',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  const responsibles = Array.from(new Set(currentProjectActions.map((a) => a.who))).filter(Boolean);
  const today = new Date().toISOString().split('T')[0];

  const filteredActions = currentProjectActions.filter((a) => {
    const matchesSearch =
      a.what.toLowerCase().includes(search.toLowerCase()) ||
      a.why.toLowerCase().includes(search.toLowerCase()) ||
      a.who.toLowerCase().includes(search.toLowerCase()) ||
      a.how.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || a.priority === priorityFilter;
    const matchesResp = responsibleFilter === 'all' || a.who === responsibleFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesResp;
  });

  const openCreateModal = () => {
    setEditingAction(null);
    setFormData({
      what: '',
      why: '',
      where: 'Geral / Matriz',
      when: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      who: currentProject.leadConsultant,
      how: '',
      howMuch: 0,
      priority: 'Alta',
      status: 'Não iniciada',
      progressPercent: 0,
      deliverableEvidence: '',
      relatedTool: 'Diagnóstico Geral',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (a: Action5W2H) => {
    setEditingAction(a);
    setFormData({
      what: a.what,
      why: a.why,
      where: a.where,
      when: a.when,
      who: a.who,
      how: a.how,
      howMuch: a.howMuch,
      priority: a.priority,
      status: a.status,
      progressPercent: a.progressPercent,
      deliverableEvidence: a.deliverableEvidence || '',
      relatedTool: a.relatedTool || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.what.trim() || !formData.who.trim()) return;

    let status = formData.status;
    if (formData.progressPercent === 100) {
      status = 'Concluída';
    }

    if (editingAction) {
      updateAction(editingAction.id, {
        what: formData.what,
        why: formData.why,
        where: formData.where,
        when: formData.when,
        who: formData.who,
        how: formData.how,
        howMuch: Number(formData.howMuch),
        priority: formData.priority,
        status: status,
        progressPercent: Number(formData.progressPercent),
        deliverableEvidence: formData.deliverableEvidence,
        relatedTool: formData.relatedTool,
      });
    } else {
      addAction({
        projectId: currentProject.id,
        what: formData.what,
        why: formData.why,
        where: formData.where,
        when: formData.when,
        who: formData.who,
        how: formData.how,
        howMuch: Number(formData.howMuch),
        priority: formData.priority,
        status: status,
        progressPercent: Number(formData.progressPercent),
        deliverableEvidence: formData.deliverableEvidence,
        relatedTool: formData.relatedTool,
      });
    }
    setIsModalOpen(false);
  };

  const handleQuickStatusChange = (id: string, newStatus: ActionStatus) => {
    const action = currentProjectActions.find((a) => a.id === id);
    if (!action) return;
    const p = newStatus === 'Concluída' ? 100 : action.progressPercent;
    updateAction(id, { status: newStatus, progressPercent: p });
  };

  const exportCSV = () => {
    const headers = [
      'What (O que)',
      'Why (Por que)',
      'Where (Onde)',
      'When (Quando)',
      'Who (Quem)',
      'How (Como)',
      'How Much (Custo)',
      'Prioridade',
      'Status',
      'Progresso (%)',
      'Evidência',
      'Vínculo',
    ];

    const rows = filteredActions.map((a) => [
      `"${a.what.replace(/"/g, '""')}"`,
      `"${a.why.replace(/"/g, '""')}"`,
      `"${a.where.replace(/"/g, '""')}"`,
      `"${a.when}"`,
      `"${a.who}"`,
      `"${a.how.replace(/"/g, '""')}"`,
      `"${a.howMuch}"`,
      `"${a.priority}"`,
      `"${a.status}"`,
      `"${a.progressPercent}%"`,
      `"${(a.deliverableEvidence || '').replace(/"/g, '""')}"`,
      `"${(a.relatedTool || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `5W2H_${currentProject.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCost = filteredActions.reduce((acc, a) => acc + (a.howMuch || 0), 0);
  const completedCount = filteredActions.filter((a) => a.status === 'Concluída').length;
  const overdueCount = filteredActions.filter(
    (a) => a.status !== 'Concluída' && a.status !== 'Cancelada' && a.when < today
  ).length;

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Plano de Ação 5W2H"
        subtitle="Quadro de execução tática: O que, Por que, Onde, Quando, Quem, Como e Quanto Custa"
        actions={
          <>
            <button
              onClick={exportCSV}
              className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Exportar plano para CSV"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Exportar CSV
            </button>
            <button
              id="add-5w2h-top-btn"
              onClick={openCreateModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Ação 5W2H
            </button>
          </>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm text-xs">
        <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700">
          <span className="text-slate-400 font-medium">Total de Ações</span>
          <p className="text-xl font-bold text-slate-100 mt-1">{filteredActions.length}</p>
        </div>
        <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-900/60">
          <span className="text-emerald-400 font-medium">Concluídas</span>
          <p className="text-xl font-bold text-emerald-300 mt-1">{completedCount}</p>
        </div>
        <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-900/60">
          <span className="text-rose-400 font-medium">Ações Atrasadas</span>
          <p className="text-xl font-bold text-rose-300 mt-1">{overdueCount}</p>
        </div>
        <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-900/60">
          <span className="text-blue-400 font-medium">Investimento Total</span>
          <p className="text-xl font-bold text-blue-300 mt-1">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por O que, Por que, Quem ou Como..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="Não iniciada">Não iniciada</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Em revisão">Em revisão</option>
              <option value="Concluída">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todas</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Responsável:</span>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todos</option>
              {responsibles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5W2H Full Interactive Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden text-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-800 min-w-[1200px]">
            <thead className="bg-slate-950 text-slate-300 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 w-72">What (O que)</th>
                <th className="py-3 px-3 w-48">Why (Por que)</th>
                <th className="py-3 px-3 w-32">Where (Onde)</th>
                <th className="py-3 px-3 w-36">When (Quando)</th>
                <th className="py-3 px-3 w-36">Who (Quem)</th>
                <th className="py-3 px-3 w-56">How (Como)</th>
                <th className="py-3 px-3 w-28 text-right">How Much (R$)</th>
                <th className="py-3 px-3 w-32">Status & Avanço</th>
                <th className="py-3 px-3 text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <CheckSquare2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Nenhuma ação encontrada para os filtros selecionados</p>
                  </td>
                </tr>
              ) : (
                filteredActions.map((action) => {
                  const isOverdue =
                    action.status !== 'Concluída' &&
                    action.status !== 'Cancelada' &&
                    action.when < today;

                  return (
                    <tr
                      key={action.id}
                      id={`action-row-${action.id}`}
                      className={`hover:bg-slate-800/60 transition-colors ${
                        isOverdue ? 'bg-rose-950/25' : ''
                      }`}
                    >
                      {/* WHAT */}
                      <td className="py-3 px-4 font-bold text-slate-100 align-top">
                        <div className="flex items-start gap-2">
                          {isOverdue && (
                            <span title="Ação atrasada!">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            </span>
                          )}
                          <div>
                            <span className="block leading-snug">{action.what}</span>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <PriorityBadge priority={action.priority} size="sm" />
                              {action.relatedTool && (
                                <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded">
                                  Ref: {action.relatedTool}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* WHY */}
                      <td className="py-3 px-3 text-slate-400 align-top leading-snug">
                        {action.why}
                      </td>

                      {/* WHERE */}
                      <td className="py-3 px-3 text-slate-300 align-top">
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {action.where}
                        </span>
                      </td>

                      {/* WHEN */}
                      <td className="py-3 px-3 align-top font-medium">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                            isOverdue
                              ? 'bg-rose-950/70 text-rose-300 font-bold border border-rose-800'
                              : action.status === 'Concluída'
                              ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800'
                              : 'text-slate-300 bg-slate-800 border border-slate-700'
                          }`}
                        >
                          {action.when}
                        </span>
                      </td>

                      {/* WHO */}
                      <td className="py-3 px-3 align-top font-semibold text-slate-200">
                        {action.who}
                      </td>

                      {/* HOW */}
                      <td className="py-3 px-3 text-slate-400 align-top text-[11px] leading-relaxed">
                        <p>{action.how}</p>
                        {action.deliverableEvidence && (
                          <p className="text-[10px] text-blue-300 mt-1 font-medium">
                            Entregável: {action.deliverableEvidence}
                          </p>
                        )}
                      </td>

                      {/* HOW MUCH */}
                      <td className="py-3 px-3 align-top text-right font-mono font-bold text-slate-200">
                        {formatCurrency(action.howMuch)}
                      </td>

                      {/* STATUS & PROGRESS */}
                      <td className="py-3 px-3 align-top">
                        <select
                          value={action.status}
                          onChange={(e) =>
                            handleQuickStatusChange(action.id, e.target.value as ActionStatus)
                          }
                          className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 rounded px-1.5 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="Não iniciada">Não iniciada</option>
                          <option value="Em andamento">Em andamento</option>
                          <option value="Em revisão">Em revisão</option>
                          <option value="Concluída">Concluída</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <div className="flex-1 bg-slate-750 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${action.progressPercent}%` }}
                            />
                          </div>
                          <span>{action.progressPercent}%</span>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-3 align-top text-right space-x-1">
                        <button
                          onClick={() => openEditModal(action)}
                          className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                          title="Editar ação"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateAction(action.id)}
                          className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                          title="Duplicar ação"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(action.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                          title="Excluir ação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit 5W2H */}
      {isModalOpen && (
        <div
          id="action-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            id="action-form-modal-card"
            className="w-full max-w-2xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckSquare2 className="w-5 h-5 text-blue-400" />
                {editingAction ? 'Editar Ação 5W2H' : 'Nova Ação 5W2H (Plano de Ação)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* WHAT */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  What (O que será feito?) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.what}
                  onChange={(e) => setFormData({ ...formData, what: e.target.value })}
                  placeholder="Ex: Redesenhar o fluxo de onboarding e formalizar SLA operacional"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* WHY */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Why (Por que será feito? / Justificativa e Resultado Esperado)
                </label>
                <textarea
                  rows={2}
                  value={formData.why}
                  onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                  placeholder="Ex: Eliminar gargalos no atendimento e reduzir turnover em 15%"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* WHERE, WHEN, WHO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Where (Onde?)
                  </label>
                  <input
                    type="text"
                    value={formData.where}
                    onChange={(e) => setFormData({ ...formData, where: e.target.value })}
                    placeholder="Ex: Operações / Filial SP"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    When (Quando / Prazo) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.when}
                    onChange={(e) => setFormData({ ...formData, when: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Who (Quem / Responsável) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.who}
                    onChange={(e) => setFormData({ ...formData, who: e.target.value })}
                    placeholder="Nome do responsável"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* HOW */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  How (Como será executado? / Método ou Procedimento)
                </label>
                <textarea
                  rows={2}
                  value={formData.how}
                  onChange={(e) => setFormData({ ...formData, how: e.target.value })}
                  placeholder="Ex: Realizar workshops com analistas, montar manual de processos e treinar equipe."
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* HOW MUCH, PRIORITY, STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    How Much (Quanto custará em {settings.currency})
                  </label>
                  <input
                    type="number"
                    value={formData.howMuch}
                    onChange={(e) => setFormData({ ...formData, howMuch: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as PriorityLevel })
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
                    Status da Ação
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ActionStatus })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Não iniciada">Não iniciada</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Em revisão">Em revisão</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* PROGRESS & DELIVERABLE EVIDENCE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Avanço Operacional ({formData.progressPercent}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.progressPercent}
                    onChange={(e) => setFormData({ ...formData, progressPercent: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Entregável ou Evidência de Conclusão
                  </label>
                  <input
                    type="text"
                    value={formData.deliverableEvidence}
                    onChange={(e) => setFormData({ ...formData, deliverableEvidence: e.target.value })}
                    placeholder="Ex: Documento homologado / Ata de reunião"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Vínculo com Diagnóstico (SWOT, Riscos, Ishikawa, etc.)
                </label>
                <input
                  type="text"
                  value={formData.relatedTool}
                  onChange={(e) => setFormData({ ...formData, relatedTool: e.target.value })}
                  placeholder="Ex: Causa raiz Ishikawa 'Falta de padronização' / Risco Crítico R1"
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
                  {editingAction ? 'Salvar Alterações' : 'Criar Ação 5W2H'}
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
            deleteAction(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Excluir Ação 5W2H?"
        message="Tem certeza que deseja excluir esta ação do plano de trabalho?"
        confirmText="Sim, Excluir"
      />
    </div>
  );
};
