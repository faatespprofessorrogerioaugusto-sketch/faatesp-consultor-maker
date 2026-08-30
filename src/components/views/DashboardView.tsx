import React from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { PriorityBadge, RiskBadge, StatusBadge } from '../common/Badge';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  CalendarRange,
  ShieldAlert,
  GitFork,
  CheckSquare2,
  ArrowRight,
  FileSpreadsheet,
  Users2,
  BarChart2,
  Grid2X2,
  HeartHandshake,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentProject,
    currentProjectSwot,
    currentProjectTasks,
    currentProjectActions,
    currentProjectRisks,
    currentProjectIshikawa,
    currentProjectClimateSurveys,
    setActiveModule,
    formatCurrency,
  } = useConsulting();

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
        <p className="text-slate-400">Nenhum projeto selecionado.</p>
      </div>
    );
  }

  // SWOT counters
  const strengthsCount = currentProjectSwot.filter((s) => s.category === 'Forças').length;
  const weaknessesCount = currentProjectSwot.filter((s) => s.category === 'Fraquezas').length;
  const opportunitiesCount = currentProjectSwot.filter((s) => s.category === 'Oportunidades').length;
  const threatsCount = currentProjectSwot.filter((s) => s.category === 'Ameaças').length;
  const totalSwot = currentProjectSwot.length;

  // 5W2H Action counters
  const totalActions = currentProjectActions.length;
  const completedActions = currentProjectActions.filter((a) => a.status === 'Concluída').length;
  const openActions = currentProjectActions.filter((a) => a.status !== 'Concluída' && a.status !== 'Cancelada').length;
  
  const today = new Date().toISOString().split('T')[0];
  const overdueActions = currentProjectActions.filter(
    (a) => a.status !== 'Concluída' && a.status !== 'Cancelada' && a.when < today
  ).length;

  // Average Project Execution %
  const avgGanttProgress =
    currentProjectTasks.length > 0
      ? Math.round(
          currentProjectTasks.reduce((acc, t) => acc + (t.progressPercent || 0), 0) /
            currentProjectTasks.length
        )
      : 0;

  const avgActionProgress =
    totalActions > 0
      ? Math.round(
          currentProjectActions.reduce((acc, a) => acc + (a.progressPercent || 0), 0) / totalActions
        )
      : 0;

  const overallProjectExecution =
    currentProjectTasks.length > 0 && totalActions > 0
      ? Math.round((avgGanttProgress + avgActionProgress) / 2)
      : avgGanttProgress || avgActionProgress || 0;

  // Critical and High Risks
  const highOrCriticalRisks = currentProjectRisks.filter(
    (r) =>
      (r.classification === 'Crítico' || r.classification === 'Alto') &&
      r.status !== 'Mitigado' &&
      r.status !== 'Encerrado'
  ).length;

  // Gantt tasks for next 7 days
  const next7DaysDate = new Date();
  next7DaysDate.setDate(next7DaysDate.getDate() + 7);
  const next7DaysStr = next7DaysDate.toISOString().split('T')[0];

  const tasksNext7Days = currentProjectTasks.filter(
    (t) => t.status !== 'Concluído' && t.status !== 'Cancelado' && t.endDate <= next7DaysStr
  );

  // Ishikawa problems count
  const ishikawaProblemsCount = currentProjectIshikawa?.causes.length || 0;

  // Actions by Status
  const actionsByStatus = {
    'Não iniciada': currentProjectActions.filter((a) => a.status === 'Não iniciada').length,
    'Em andamento': currentProjectActions.filter((a) => a.status === 'Em andamento').length,
    'Em revisão': currentProjectActions.filter((a) => a.status === 'Em revisão').length,
    Concluída: completedActions,
    Atrasada: overdueActions,
  };

  // Risks by Level
  const risksByLevel = {
    Crítico: currentProjectRisks.filter((r) => r.classification === 'Crítico').length,
    Alto: currentProjectRisks.filter((r) => r.classification === 'Alto').length,
    Moderado: currentProjectRisks.filter((r) => r.classification === 'Moderado').length,
    Baixo: currentProjectRisks.filter((r) => r.classification === 'Baixo').length,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Dashboard Executivo do Projeto"
        subtitle={`Visão geral dos diagnósticos, planos e indicadores de ${currentProject.name}`}
        actions={
          <>
            <button
              id="dash-quick-report-btn"
              onClick={() => setActiveModule('reports')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              Gerar Relatório Executivo
            </button>
            <button
              id="dash-quick-5w2h-btn"
              onClick={() => setActiveModule('5w2h')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckSquare2 className="w-4 h-4" />
              Ver Plano de Ação 5W2H
            </button>
          </>
        }
      />

      {/* Project Highlight Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/80 text-white rounded-xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/90 px-2.5 py-0.5 rounded-full border border-blue-800/80">
              {currentProject.segment}
            </span>
            <span className="text-xs text-slate-400">Cliente: <strong className="text-slate-200">{currentProject.clientName}</strong></span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold truncate tracking-tight text-white">{currentProject.name}</h2>
          <p className="text-xs text-slate-300 max-w-3xl line-clamp-2">{currentProject.mainObjective}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-900/80 p-3 rounded-lg border border-slate-800 backdrop-blur-xs">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Execução Geral</p>
            <p className="text-2xl font-black text-white">{overallProjectExecution}%</p>
          </div>
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProjectExecution}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Progress */}
        <div
          onClick={() => setActiveModule('gantt')}
          className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col justify-between hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Progresso do Projeto</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-light text-slate-100">{overallProjectExecution}%</span>
            <span className="text-green-400 text-xs font-medium">+4.2%</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallProjectExecution}%` }} />
          </div>
        </div>

        {/* Card 2: Open Actions */}
        <div
          onClick={() => setActiveModule('5w2h')}
          className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col justify-between hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ações 5W2H</span>
          <div className="mt-2 flex space-x-4">
            <div>
              <p className="text-2xl font-bold text-slate-100">{openActions}</p>
              <p className="text-[10px] text-slate-400 uppercase">Abertas</p>
            </div>
            <div className="border-l border-slate-700 pl-4">
              <p className="text-2xl font-bold text-rose-400">{overdueActions}</p>
              <p className="text-[10px] text-slate-400 uppercase">Atrasadas</p>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-emerald-400">{completedActions} concluídas</span>
            <span className="text-slate-500">Total: {totalActions}</span>
          </div>
        </div>

        {/* Card 3: Critical Risks */}
        <div
          onClick={() => setActiveModule('risks')}
          className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col justify-between hover:border-rose-500/50 transition-all cursor-pointer group"
        >
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Riscos Críticos</span>
          <div className="flex items-center space-x-3 mt-2">
            <span className="text-3xl font-light text-amber-400 font-bold">{highOrCriticalRisks}</span>
            <div className="text-[10px] leading-tight text-slate-400">
              Impacto no cronograma<br />& entregas-chave
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Matriz 5x5 Ativa</span>
            <span className="text-blue-400 font-medium">Ver planos &rarr;</span>
          </div>
        </div>

        {/* Card 4: SWOT Balance */}
        <div
          onClick={() => setActiveModule('swot')}
          className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col justify-between hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Análise SWOT</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-[11px] text-slate-300"><span className="text-emerald-400 font-bold">F:</span> {strengthsCount}</div>
            <div className="text-[11px] text-slate-300"><span className="text-rose-400 font-bold">Fr:</span> {weaknessesCount}</div>
            <div className="text-[11px] text-slate-300"><span className="text-blue-400 font-bold">O:</span> {opportunitiesCount}</div>
            <div className="text-[11px] text-slate-300"><span className="text-amber-400 font-bold">A:</span> {threatsCount}</div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total: {totalSwot} fatores</span>
            <span className="text-blue-400 font-medium">Ver Matriz &rarr;</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Charts (Actions status & SWOT balance) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Execution Status Breakdown */}
          <div className="p-6 bg-[#1e293b]/40 rounded-2xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Distribuição do Plano 5W2H</h3>
                <p className="text-xs text-slate-400">Progresso operacional e status das ações</p>
              </div>
              <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                {completedActions} / {totalActions} concluídas ({avgActionProgress}%)
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden flex shadow-inner border border-slate-700/50">
              {totalActions > 0 ? (
                <>
                  <div
                    style={{ width: `${(actionsByStatus['Concluída'] / totalActions) * 100}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                    title={`Concluídas: ${actionsByStatus['Concluída']}`}
                  />
                  <div
                    style={{ width: `${(actionsByStatus['Em andamento'] / totalActions) * 100}%` }}
                    className="bg-blue-500 transition-all duration-300"
                    title={`Em andamento: ${actionsByStatus['Em andamento']}`}
                  />
                  <div
                    style={{ width: `${(actionsByStatus['Em revisão'] / totalActions) * 100}%` }}
                    className="bg-amber-400 transition-all duration-300"
                    title={`Em revisão: ${actionsByStatus['Em revisão']}`}
                  />
                  <div
                    style={{ width: `${(actionsByStatus['Atrasada'] / totalActions) * 100}%` }}
                    className="bg-rose-500 transition-all duration-300"
                    title={`Atrasadas: ${actionsByStatus['Atrasada']}`}
                  />
                  <div
                    style={{ width: `${(actionsByStatus['Não iniciada'] / totalActions) * 100}%` }}
                    className="bg-slate-600 transition-all duration-300"
                    title={`Não iniciadas: ${actionsByStatus['Não iniciada']}`}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-800 text-[10px] text-center text-slate-500 py-0.5">
                  Nenhuma ação cadastrada
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Concluída ({actionsByStatus['Concluída']})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-300">Em andamento ({actionsByStatus['Em andamento']})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-300">Em revisão ({actionsByStatus['Em revisão']})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-300">Atrasada ({actionsByStatus['Atrasada']})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="text-slate-300">Não iniciada ({actionsByStatus['Não iniciada']})</span>
              </div>
            </div>
          </div>

          {/* SWOT 4-Quadrant Visual Summary */}
          <div className="p-6 bg-[#1e293b]/40 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Balanço Estratégico SWOT</h3>
                <p className="text-xs text-slate-400">Distribuição dos {totalSwot} fatores diagnosticados</p>
              </div>
              <button
                onClick={() => setActiveModule('swot')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                Abrir Matriz Completa <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">FORÇAS (Interno)</span>
                  <span className="text-xs font-black text-emerald-300 bg-slate-900 px-2 py-0.5 rounded border border-emerald-800/80">
                    {strengthsCount}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 mt-1">Diferenciais e capacidades internas chave</p>
              </div>

              <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400">FRAQUEZAS (Interno)</span>
                  <span className="text-xs font-black text-rose-300 bg-slate-900 px-2 py-0.5 rounded border border-rose-800/80">
                    {weaknessesCount}
                  </span>
                </div>
                <p className="text-[11px] text-rose-300/80 mt-1">Gargalos e vulnerabilidades operacionais</p>
              </div>

              <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">OPORTUNIDADES (Externo)</span>
                  <span className="text-xs font-black text-blue-300 bg-slate-900 px-2 py-0.5 rounded border border-blue-800/80">
                    {opportunitiesCount}
                  </span>
                </div>
                <p className="text-[11px] text-blue-300/80 mt-1">Tendências de mercado e crescimento</p>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">AMEAÇAS (Externo)</span>
                  <span className="text-xs font-black text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-800/80">
                    {threatsCount}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/80 mt-1">Riscos externos e concorrentes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Upcoming Deadlines & Risks */}
        <div className="space-y-6">
          {/* Upcoming Gantt Deliverables */}
          <div className="p-6 bg-[#1e293b]/40 rounded-2xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                Prazos Próximos (7 dias)
              </h3>
              <button
                onClick={() => setActiveModule('gantt')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Gantt &rarr;
              </button>
            </div>

            <div className="space-y-2.5 flex-1">
              {tasksNext7Days.length === 0 ? (
                <div className="py-6 text-center text-slate-400 bg-slate-900/60 rounded-lg border border-dashed border-slate-800">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <p className="text-xs font-medium text-slate-300">Nenhuma entrega urgente nos 7 dias</p>
                </div>
              ) : (
                tasksNext7Days.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-900/70 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-200 truncate">{t.name}</p>
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Resp: {t.responsible}</span>
                      <span className="font-semibold text-slate-300">Término: {t.endDate}</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${t.progressPercent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="p-6 bg-[#1e293b]/40 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100">Classificação de Riscos</h3>
              <button
                onClick={() => setActiveModule('risks')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Ver Matriz &rarr;
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs">
                <span className="font-semibold text-rose-300">Crítico (Score 16-25)</span>
                <span className="font-black text-rose-300 bg-slate-900 px-2 py-0.5 rounded border border-rose-800/80">{risksByLevel['Crítico']}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs">
                <span className="font-semibold text-amber-300">Alto (Score 12-15)</span>
                <span className="font-black text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-800/80">{risksByLevel['Alto']}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs">
                <span className="font-semibold text-blue-300">Moderado (Score 6-11)</span>
                <span className="font-black text-blue-300 bg-slate-900 px-2 py-0.5 rounded border border-blue-800/80">{risksByLevel['Moderado']}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs">
                <span className="font-semibold text-emerald-300">Baixo (Score 1-5)</span>
                <span className="font-black text-emerald-300 bg-slate-900 px-2 py-0.5 rounded border border-emerald-800/80">{risksByLevel['Baixo']}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation to Key Tools */}
      <div className="p-5 bg-slate-950 text-white rounded-xl border border-slate-800">
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-3">
          Acesso Rápido às Ferramentas Diagnósticas & Estratégicas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveModule('gantt')}
            className="p-3.5 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 rounded-lg text-left transition-colors border border-slate-800 cursor-pointer"
          >
            <CalendarRange className="w-5 h-5 text-blue-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-100">Diagrama de Gantt</p>
            <p className="text-[10px] text-slate-400">{currentProjectTasks.length} entregas / {avgGanttProgress}% concluído</p>
          </button>

          <button
            onClick={() => setActiveModule('pareto')}
            className="p-3.5 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 rounded-lg text-left transition-colors border border-slate-800 cursor-pointer"
          >
            <BarChart2 className="w-5 h-5 text-amber-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-100">Pareto (80/20)</p>
            <p className="text-[10px] text-slate-400">Curva de ofensores</p>
          </button>

          <button
            onClick={() => setActiveModule('swot')}
            className="p-3.5 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 rounded-lg text-left transition-colors border border-slate-800 cursor-pointer"
          >
            <Grid2X2 className="w-5 h-5 text-indigo-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-100">Matriz SWOT</p>
            <p className="text-[10px] text-slate-400">{totalSwot} fatores cadastrados</p>
          </button>

          <button
            onClick={() => setActiveModule('climate')}
            className="p-3.5 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 rounded-lg text-left transition-colors border border-slate-800 cursor-pointer"
          >
            <HeartHandshake className="w-5 h-5 text-rose-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-100">Clima Organizacional</p>
            <p className="text-[10px] text-slate-400">
              {currentProjectClimateSurveys.length > 0
                ? `eNPS ${currentProjectClimateSurveys[0].enpsScore > 0 ? '+' : ''}${currentProjectClimateSurveys[0].enpsScore}`
                : 'Diagnóstico de clima'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
