import React, { useState, useMemo } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { GanttTask, TaskStatus, PriorityLevel } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  CalendarRange,
  Calendar,
  Clock,
  User,
  Flag,
  Edit2,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const GanttView: React.FC = () => {
  const {
    currentProject,
    currentProjectTasks,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
  } = useConsulting();

  const [timeScale, setTimeScale] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    stage: string;
    responsible: string;
    startDate: string;
    endDate: string;
    progressPercent: number;
    status: TaskStatus;
    priority: PriorityLevel;
    dependencies: string;
    isMilestone: boolean;
  }>({
    name: '',
    description: '',
    stage: 'Diagnóstico & Mapeamento',
    responsible: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    progressPercent: 0,
    status: 'Não iniciado',
    priority: 'Média',
    dependencies: '',
    isMilestone: false,
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  // Calculate timeline bounding dates
  const { minDate, maxDate, totalTimelineDays, timelineHeaders } = useMemo(() => {
    if (currentProjectTasks.length === 0) {
      const now = new Date();
      const d1 = new Date(now.getFullYear(), now.getMonth(), 1);
      const d2 = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return {
        minDate: d1,
        maxDate: d2,
        totalTimelineDays: 60,
        timelineHeaders: [],
      };
    }

    let min = new Date(currentProjectTasks[0].startDate).getTime();
    let max = new Date(currentProjectTasks[0].endDate).getTime();

    currentProjectTasks.forEach((t) => {
      const s = new Date(t.startDate).getTime();
      const e = new Date(t.endDate).getTime();
      if (!isNaN(s) && s < min) min = s;
      if (!isNaN(e) && e > max) max = e;
    });

    // Add margin (3 days before and after)
    const minD = new Date(min - 3 * 86400000);
    const maxD = new Date(max + 7 * 86400000);
    const days = Math.max(1, Math.round((maxD.getTime() - minD.getTime()) / 86400000));

    // Generate column headers based on scale
    const headers: Array<{ label: string; widthPercent: number }> = [];
    if (timeScale === 'days') {
      const step = Math.max(1, Math.ceil(days / 15));
      for (let i = 0; i < days; i += step) {
        const d = new Date(minD.getTime() + i * 86400000);
        headers.push({
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          widthPercent: (step / days) * 100,
        });
      }
    } else if (timeScale === 'weeks') {
      const weeksCount = Math.max(1, Math.ceil(days / 7));
      for (let w = 0; w < weeksCount; w++) {
        const d = new Date(minD.getTime() + w * 7 * 86400000);
        headers.push({
          label: `Sem ${w + 1} (${d.getDate()}/${d.getMonth() + 1})`,
          widthPercent: 100 / weeksCount,
        });
      }
    } else {
      // months
      const monthsCount = Math.max(1, Math.ceil(days / 30));
      for (let m = 0; m < monthsCount; m++) {
        const d = new Date(minD.getTime() + m * 30 * 86400000);
        const monthName = d.toLocaleString('pt-BR', { month: 'short' });
        headers.push({
          label: `${monthName.toUpperCase()} ${d.getFullYear()}`,
          widthPercent: 100 / monthsCount,
        });
      }
    }

    return {
      minDate: minD,
      maxDate: maxD,
      totalTimelineDays: days,
      timelineHeaders: headers,
    };
  }, [currentProjectTasks, timeScale]);

  // Unique stages & responsibles for filters
  const stages = Array.from(new Set(currentProjectTasks.map((t) => t.stage))).filter(Boolean);
  const responsibles = Array.from(new Set(currentProjectTasks.map((t) => t.responsible))).filter(Boolean);

  const filteredTasks = currentProjectTasks.filter((t) => {
    const matchStage = stageFilter === 'all' || t.stage === stageFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchResp = responsibleFilter === 'all' || t.responsible === responsibleFilter;
    return matchStage && matchStatus && matchPriority && matchResp;
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      name: '',
      description: '',
      stage: stages[0] || 'Diagnóstico & Mapeamento',
      responsible: currentProject.leadConsultant,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      progressPercent: 0,
      status: 'Não iniciado',
      priority: 'Média',
      dependencies: '',
      isMilestone: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: GanttTask) => {
    setEditingTask(t);
    setFormData({
      name: t.name,
      description: t.description || '',
      stage: t.stage,
      responsible: t.responsible,
      startDate: t.startDate,
      endDate: t.endDate,
      progressPercent: t.progressPercent,
      status: t.status,
      priority: t.priority,
      dependencies: t.dependencies?.join(', ') || '',
      isMilestone: !!t.isMilestone,
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const start = new Date(formData.startDate).getTime();
    const end = new Date(formData.endDate).getTime();
    const calculatedDuration = Math.max(1, Math.round((end - start) / 86400000));

    const depArray = formData.dependencies
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    let status = formData.status;
    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.progressPercent === 100) {
      status = 'Concluído';
    } else if (formData.endDate < todayStr && formData.progressPercent < 100) {
      status = 'Atrasado';
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        name: formData.name,
        description: formData.description,
        stage: formData.stage,
        responsible: formData.responsible,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationDays: calculatedDuration,
        progressPercent: formData.progressPercent,
        status: status,
        priority: formData.priority,
        dependencies: depArray,
        isMilestone: formData.isMilestone,
      });
    } else {
      addTask({
        projectId: currentProject.id,
        name: formData.name,
        description: formData.description,
        stage: formData.stage,
        responsible: formData.responsible,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationDays: calculatedDuration,
        progressPercent: formData.progressPercent,
        status: status,
        priority: formData.priority,
        dependencies: depArray,
        isMilestone: formData.isMilestone,
      });
    }
    setIsModalOpen(false);
  };

  const handleInlineProgressChange = (taskId: string, newProgress: number) => {
    const task = currentProjectTasks.find((t) => t.id === taskId);
    if (!task) return;
    const p = Math.max(0, Math.min(100, newProgress));
    let newStatus = task.status;
    if (p === 100) newStatus = 'Concluído';
    else if (p > 0 && task.status === 'Não iniciado') newStatus = 'Em andamento';
    updateTask(taskId, { progressPercent: p, status: newStatus });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Diagrama de Gantt & Cronograma"
        subtitle="Linha do tempo visual de entregas, fases, marcos e responsáveis do projeto"
        actions={
          <>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setTimeScale('days')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeScale === 'days' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dias
              </button>
              <button
                onClick={() => setTimeScale('weeks')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeScale === 'weeks' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semanas
              </button>
              <button
                onClick={() => setTimeScale('months')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeScale === 'months' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Meses
              </button>
            </div>

            <button
              id="gantt-add-task-btn"
              onClick={openCreateModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Tarefa / Marco
            </button>
          </>
        }
      />

      {/* Filters Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs text-slate-100">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Fase / Etapa:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todas as Fases</option>
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              <option value="all">Todos os Status</option>
              <option value="Não iniciado">Não iniciado</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Em revisão">Em revisão</option>
              <option value="Concluído">Concluído</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Responsável:</span>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">Todos os Responsáveis</option>
              {responsibles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-medium">
          Exibindo {filteredTasks.length} de {currentProjectTasks.length} atividades
        </div>
      </div>

      {/* GANTT INTERACTIVE CHART CONTAINER */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden text-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <CalendarRange className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Nenhuma atividade no cronograma com os filtros aplicados</p>
            <button
              onClick={openCreateModal}
              className="mt-3 text-xs font-semibold text-blue-400 hover:underline cursor-pointer"
            >
              + Adicionar primeira atividade
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              {/* Timeline Header Row */}
              <div className="flex border-b border-slate-800 bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {/* Left Columns (Task Metadata) */}
                <div className="w-80 shrink-0 p-3 border-r border-slate-800">
                  Atividade & Fase
                </div>
                <div className="w-28 shrink-0 p-3 border-r border-slate-800 text-center">
                  Responsável
                </div>
                <div className="w-24 shrink-0 p-3 border-r border-slate-800 text-center">
                  Período
                </div>
                <div className="w-24 shrink-0 p-3 border-r border-slate-800 text-center">
                  Progresso
                </div>

                {/* Right Timeline Grid Header */}
                <div className="flex-1 flex overflow-hidden">
                  {timelineHeaders.map((hdr, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${hdr.widthPercent}%` }}
                      className="p-3 text-center border-r border-slate-800/80 truncate font-semibold text-slate-300"
                    >
                      {hdr.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Rows */}
              <div className="divide-y divide-slate-800">
                {filteredTasks.map((task) => {
                  const sTime = new Date(task.startDate).getTime();
                  const eTime = new Date(task.endDate).getTime();
                  const minTime = minDate.getTime();
                  const totalMs = maxDate.getTime() - minDate.getTime();

                  const leftPercent = Math.max(0, Math.min(100, ((sTime - minTime) / totalMs) * 100));
                  const rightPercent = Math.max(0, Math.min(100, ((eTime - minTime) / totalMs) * 100));
                  const widthPercent = Math.max(1.5, rightPercent - leftPercent);

                  const isOverdue = task.status === 'Atrasado' || (task.endDate < todayStr && task.progressPercent < 100);

                  return (
                    <div
                      key={task.id}
                      id={`gantt-task-row-${task.id}`}
                      className="flex items-center hover:bg-slate-800/50 transition-colors group text-xs"
                    >
                      {/* Task Info Left */}
                      <div className="w-80 shrink-0 p-3 border-r border-slate-800 flex items-start gap-2">
                        {task.isMilestone ? (
                          <div className="p-1 rounded bg-amber-950/60 border border-amber-800 text-amber-300 shrink-0 mt-0.5">
                            <Flag className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded bg-blue-950/60 border border-blue-800 text-blue-300 shrink-0 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-100 truncate">{task.name}</span>
                            {task.isMilestone && (
                              <span className="text-[9px] uppercase font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800">
                                Marco
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block truncate">
                            {task.stage}
                          </span>
                        </div>
                      </div>

                      {/* Responsible */}
                      <div className="w-28 shrink-0 p-3 border-r border-slate-800 text-center truncate text-slate-300">
                        {task.responsible}
                      </div>

                      {/* Dates & Duration */}
                      <div className="w-24 shrink-0 p-3 border-r border-slate-800 text-center text-slate-300 text-[11px]">
                        <span className="font-semibold text-slate-200">{task.durationDays}d</span>
                        <span className="block text-[10px] text-slate-500">{task.endDate}</span>
                      </div>

                      {/* Progress & Inline edit */}
                      <div className="w-24 shrink-0 p-3 border-r border-slate-800 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={task.progressPercent}
                            onChange={(e) =>
                              handleInlineProgressChange(task.id, Number(e.target.value))
                            }
                            className="w-12 text-center text-xs font-bold text-slate-100 bg-slate-800 border border-slate-700 rounded py-0.5 focus:outline-none"
                          />
                          <span className="text-slate-400 font-semibold">%</span>
                        </div>
                      </div>

                      {/* Timeline Bar Canvas Area */}
                      <div className="flex-1 relative h-12 flex items-center px-2">
                        {/* Timeline bar */}
                        <div
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          className={`absolute h-7 rounded-md transition-all shadow-xs flex items-center px-2 overflow-hidden ${
                            task.isMilestone
                              ? 'bg-amber-600 border border-amber-500 text-white'
                              : isOverdue
                              ? 'bg-rose-600 border border-rose-500 text-white'
                              : task.progressPercent === 100
                              ? 'bg-emerald-600 border border-emerald-500 text-white'
                              : 'bg-blue-600 border border-blue-500 text-white'
                          }`}
                          title={`${task.name}: ${task.progressPercent}% (${task.startDate} a ${task.endDate})`}
                        >
                          {/* Inner fill progress */}
                          <div
                            style={{ width: `${task.progressPercent}%` }}
                            className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-l-md pointer-events-none"
                          />

                          <span className="relative z-10 text-[10px] font-bold truncate">
                            {task.name} ({task.progressPercent}%)
                          </span>
                        </div>

                        {/* Quick actions hover */}
                        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-800 p-1 rounded-md shadow-sm border border-slate-700 z-20">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => duplicateTask(task.id)}
                            className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                            title="Duplicar"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Task */}
      {isModalOpen && (
        <div
          id="gantt-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            id="gantt-form-modal-card"
            className="w-full max-w-xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-blue-400" />
                {editingTask ? 'Editar Atividade do Cronograma' : 'Nova Atividade / Marco de Entrega'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome da Atividade ou Marco <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Entrevistas com lideranças e mapeamento AS-IS"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Fase / Etapa / Grupo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    placeholder="Ex: Diagnóstico, Planejamento, Execução..."
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Responsável <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Nome do consultor ou responsável"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Progresso ({formData.progressPercent}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.progressPercent}
                    onChange={(e) => setFormData({ ...formData, progressPercent: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Não iniciado">Não iniciado</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Em revisão">Em revisão</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Prioridade
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Dependências (IDs ou nomes separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.dependencies}
                  onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                  placeholder="Ex: Entrevistas iniciais, Aprovação do escopo"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="gantt-milestone-checkbox"
                  checked={formData.isMilestone}
                  onChange={(e) => setFormData({ ...formData, isMilestone: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-400 cursor-pointer w-4 h-4"
                />
                <label
                  htmlFor="gantt-milestone-checkbox"
                  className="text-xs font-semibold text-slate-300 cursor-pointer flex items-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  Marcar como Marco de Entrega (Milestone Principal)
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
                  {editingTask ? 'Salvar Alterações' : 'Adicionar Atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteTask(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Excluir Atividade do Cronograma?"
        message="Tem certeza que deseja excluir esta atividade do cronograma Gantt?"
        confirmText="Sim, Excluir"
      />
    </div>
  );
};
