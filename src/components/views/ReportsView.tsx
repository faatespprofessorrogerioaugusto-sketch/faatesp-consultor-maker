import React, { useState, useMemo } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  Award,
  CheckSquare,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Users2,
  FileSignature,
  Presentation,
  Target,
  Grid2X2,
  GitPullRequest,
  HeartHandshake,
  DollarSign,
  AlertTriangle,
  Clock,
  Briefcase,
  Check,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    projects,
    clients,
    currentProjectSwot,
    currentProjectTasks,
    ishikawaAnalyses,
    currentProjectActions,
    currentProjectRisks,
    currentProjectPareto,
    currentProjectClimateSurveys,
    currentProjectOkrs,
    bscObjectives = [],
    contracts = [],
    meetings = [],
    settings,
    formatCurrency,
    showToast,
  } = useConsulting();

  // Derived client for current project
  const currentProjectClient = useMemo(() => {
    if (!currentProject) return null;
    return clients.find((c) => c.id === currentProject.clientId) || null;
  }, [currentProject, clients]);

  // Derived SWOT categories
  const swotGrouped = useMemo(() => {
    const list = Array.isArray(currentProjectSwot) ? currentProjectSwot : [];
    return {
      strengths: list.filter((i) => i.type === 'strength'),
      weaknesses: list.filter((i) => i.type === 'weakness'),
      opportunities: list.filter((i) => i.type === 'opportunity'),
      threats: list.filter((i) => i.type === 'threat'),
    };
  }, [currentProjectSwot]);

  // Derived OKRs for this project
  const projectOkrs = useMemo(() => {
    return currentProjectOkrs || [];
  }, [currentProjectOkrs]);

  // Derived Contract for this project
  const projectContract = useMemo(() => {
    return (
      (contracts || []).find((c) => !c.projectId || c.projectId === currentProjectId) ||
      (contracts || [])[0] ||
      null
    );
  }, [contracts, currentProjectId]);

  // Derived Meetings for this project
  const projectMeetings = useMemo(() => {
    return (meetings || []).filter(
      (m) => !m.projectId || m.projectId === currentProjectId
    );
  }, [meetings, currentProjectId]);

  // Derived Ishikawa analyses
  const projectIshikawas = useMemo(() => {
    return (ishikawaAnalyses || []).filter((i) => i.projectId === currentProjectId);
  }, [ishikawaAnalyses, currentProjectId]);

  // Selection of included modules in the executive report
  const [includedModules, setIncludedModules] = useState({
    executiveSummary: true,
    contract: true,
    meetings: true,
    okrs: true,
    swot: true,
    ishikawa: true,
    actions5w2h: true,
    gantt: true,
    risks: true,
    pareto: true,
    climateSurvey: true,
  });

  const [consultantNotes, setConsultantNotes] = useState(
    `Com base no diagnóstico aprofundado e na consolidação das ferramentas de análise estratégica, constatou-se que o projeto apresenta alto potencial de ganho de eficiência com a mitigação dos gargalos mapeados nas operações e tecnologia. Recomenda-se a imediata execução das ações prioritárias do 5W2H e o monitoramento quinzenal dos riscos críticos classificados.`
  );

  const [recommendations, setRecommendations] = useState(
    `1. Priorizar as ações críticas no plano 5W2H com foco em aumento de produtividade.\n2. Instituir comitê semanal de governança com os líderes e stakeholders-chave.\n3. Acompanhar as metas dos Objetivos e Resultados-Chave (OKRs) nos rituais de check-in quinzenais.`
  );

  const [copiedSummary, setCopiedSummary] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!currentProject) {
      showToast('Selecione um projeto para exportar os dados.', 'warning');
      return;
    }

    const projectData = {
      project: currentProject,
      client: currentProjectClient,
      contract: projectContract,
      meetings: projectMeetings,
      okrs: projectOkrs,
      swot: swotGrouped,
      gantt: currentProjectTasks,
      ishikawa: projectIshikawas,
      actions5w2h: currentProjectActions,
      risks: currentProjectRisks,
      pareto: currentProjectPareto,
      climateSurveys: currentProjectClimateSurveys,
      consultantNotes,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Relatorio_Executivo_${currentProject.name.replace(/\s+/g, '_')}_${
        new Date().toISOString().split('T')[0]
      }.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Dossiê completo do projeto exportado em JSON com sucesso!', 'success');
  };

  const handleExportCSV = () => {
    if (!currentProject) {
      showToast('Selecione um projeto para exportar a planilha.', 'warning');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `PROJETO:;${currentProject.name}\n`;
    csvContent += `CLIENTE:;${currentProject.clientName}\n`;
    csvContent += `CONSULTOR LIDER:;${currentProject.leadConsultant}\n`;
    csvContent += `ORCAMENTO:;${formatCurrency(currentProject.budget)}\n`;
    csvContent += `DATA GERACAO:;${new Date().toLocaleDateString('pt-BR')}\n\n`;

    // 5W2H
    csvContent += `--- PLANO DE ACAO 5W2H ---\n`;
    csvContent += `O que (What);Quem (Who);Quando (When);Onde (Where);Por que (Why);Como (How);Custo (How Much);Status;Prioridade\n`;
    currentProjectActions.forEach((a) => {
      csvContent += `"${a.what}";"${a.who}";"${a.when}";"${a.where || ''}";"${a.why || ''}";"${a.how || ''}";"${a.howMuch || 0}";"${a.status}";"${a.priority}"\n`;
    });

    // SWOT
    csvContent += `\n--- MATRIZ SWOT ---\n`;
    csvContent += `Tipo;Descricao;Impacto\n`;
    swotGrouped.strengths.forEach((s) => csvContent += `"Forca";"${s.text}";"${s.impact || 'Alto'}"\n`);
    swotGrouped.weaknesses.forEach((w) => csvContent += `"Fraqueza";"${w.text}";"${w.impact || 'Alto'}"\n`);
    swotGrouped.opportunities.forEach((o) => csvContent += `"Oportunidade";"${o.text}";"${o.impact || 'Alto'}"\n`);
    swotGrouped.threats.forEach((t) => csvContent += `"Ameaca";"${t.text}";"${t.impact || 'Alto'}"\n`);

    // Risks
    csvContent += `\n--- MATRIZ DE RISCOS ---\n`;
    csvContent += `Risco;Categoria;Score;Classificacao;Acao Preventiva\n`;
    currentProjectRisks.forEach((r) => {
      csvContent += `"${r.risk}";"${r.category}";"${r.riskScore}";"${r.classification}";"${r.preventiveAction || ''}"\n`;
    });

    // OKRs & Metas
    csvContent += `\n--- OBJETIVOS E METAS (OKRs) ---\n`;
    csvContent += `Objetivo;Categoria;Ciclo;Responsavel;Key Result;Baseline;Realizado;Meta;Progresso;Status\n`;
    projectOkrs.forEach((o) => {
      if (o.keyResults.length === 0) {
        csvContent += `"${o.title}";"${o.category}";"${o.cycle}";"${o.owner}";"-";"-";"-";"-";"0%";"-"\n`;
      } else {
        o.keyResults.forEach((kr) => {
          csvContent += `"${o.title}";"${o.category}";"${o.cycle}";"${o.owner}";"${kr.title}";"${kr.initialValue} ${kr.unit}";"${kr.currentValue} ${kr.unit}";"${kr.targetValue} ${kr.unit}";"${kr.progressPercent}%";"${kr.status}"\n`;
        });
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Planilha_Consolidada_${currentProject.name.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Planilha CSV gerada e baixada com sucesso!', 'success');
  };

  const handleCopySummary = () => {
    if (!currentProject) return;
    const summaryText = `*RELATÓRIO EXECUTIVO DE CONSULTORIA*
Projeto: ${currentProject.name}
Cliente: ${currentProject.clientName}
Consultor Líder: ${currentProject.leadConsultant}
Status: ${currentProject.status} | Orçamento: ${formatCurrency(currentProject.budget)}
Data: ${new Date().toLocaleDateString('pt-BR')}

*PARECER DO CONSULTOR:*
${consultantNotes}

*RECOMENDAÇÕES ESTRATÉGICAS:*
${recommendations}

*INDICADORES GERAIS:*
• Ações 5W2H Mapeadas: ${currentProjectActions.length} (${currentProjectActions.filter((a) => a.status === 'Concluída').length} concluídas)
• Riscos Identificados: ${currentProjectRisks.length} (${currentProjectRisks.filter((r) => r.classification === 'Crítico' || r.classification === 'Alto').length} de alta prioridade)
• Objetivos Estratégicos (OKRs): ${projectOkrs.length} (${projectOkrs.reduce((acc, o) => acc + o.keyResults.length, 0)} KRs)
• Itens SWOT: ${currentProjectSwot.length}
• Pesquisas de Clima: ${currentProjectClimateSurveys.length}`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedSummary(true);
      showToast('Resumo executivo copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedSummary(false), 3000);
    });
  };

  if (!currentProject) {
    return (
      <div className="space-y-6 text-slate-100">
        <Breadcrumbs
          title="Relatórios & Dossiê Executivo"
          subtitle="Geração de relatórios gerenciais, exportação de dados e impressão em PDF"
        />
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Nenhum projeto selecionado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-4">
            Por favor, selecione um projeto de consultoria ativo para gerar o relatório executivo completo.
          </p>
          {projects.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <select
                value={currentProjectId}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header - Hidden when printing */}
      <div className="print:hidden">
        <Breadcrumbs
          title="Relatório Executivo de Consultoria & Exportação"
          subtitle="Geração de dossiê profissional para o cliente, impressão em PDF, planilha CSV e backup estruturado"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="btn-copy-summary"
                onClick={handleCopySummary}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Copiar texto do sumário executivo"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copiar Resumo</span>
                  </>
                )}
              </button>

              <button
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Exportar dados em formato CSV para Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Planilha (CSV)</span>
              </button>

              <button
                id="btn-export-json"
                onClick={handleExportJSON}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Exportar backup completo em JSON"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Exportar JSON</span>
              </button>

              <button
                id="btn-print-report"
                onClick={handlePrint}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Imprimir ou Salvar PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Module Selector & Notes Customizer (Hidden during Print) */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Painel de Configuração do Dossiê do Cliente
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Selecione quais módulos devem ser incluídos na visualização e impressão do relatório.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Projeto Ativo:</span>
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.clientName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modules Checkboxes */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            {[
              { key: 'executiveSummary', label: 'Sumário Executivo' },
              { key: 'contract', label: 'Contrato de Serviço' },
              { key: 'meetings', label: 'Simulador de Reunião' },
              { key: 'okrs', label: 'OKRs & Metas' },
              { key: 'swot', label: 'Análise SWOT' },
              { key: 'ishikawa', label: 'Diagrama Ishikawa' },
              { key: 'actions5w2h', label: 'Plano 5W2H' },
              { key: 'gantt', label: 'Cronograma Gantt' },
              { key: 'risks', label: 'Matriz de Riscos' },
              { key: 'pareto', label: 'Análise de Pareto' },
              { key: 'climateSurvey', label: 'Pesquisa de Clima' },
            ].map((mod) => (
              <label
                key={mod.key}
                className="flex items-center gap-2 p-2 bg-slate-800/70 border border-slate-750 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={includedModules[mod.key as keyof typeof includedModules]}
                  onChange={(e) =>
                    setIncludedModules({
                      ...includedModules,
                      [mod.key]: e.target.checked,
                    })
                  }
                  className="rounded text-blue-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-slate-200 truncate">{mod.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Parecer Geral do Consultor Líder
            </label>
            <textarea
              rows={3}
              value={consultantNotes}
              onChange={(e) => setConsultantNotes(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Recomendações Estratégicas Prioritárias
            </label>
            <textarea
              rows={3}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* PRINTABLE EXECUTIVE REPORT PREVIEW CONTAINER */}
      <div className="bg-slate-900 p-6 sm:p-10 rounded-xl border border-slate-800 shadow-xl text-slate-100 max-w-5xl mx-auto print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
        {/* Formal Header */}
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm print:bg-slate-900">
                CH
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-100 uppercase print:text-slate-900">
                {settings.consultingFirmName || 'Consultor Prime Assessoria Empresarial'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-2 print:text-slate-900">
              Relatório Executivo & Diagnóstico Estratégico
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 print:text-slate-600">
              Projeto: <strong className="text-slate-100 print:text-slate-900">{currentProject.name}</strong> • Cliente:{' '}
              <strong className="text-slate-100 print:text-slate-900">{currentProject.clientName}</strong> • Segmento:{' '}
              <strong className="text-slate-100 print:text-slate-900">{currentProject.segment}</strong>
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 space-y-0.5 border-t border-slate-800 sm:border-t-0 pt-2 sm:pt-0 print:text-slate-600 print:border-none">
            <p>
              Emissão: <strong className="text-slate-200 print:text-slate-900">{new Date().toLocaleDateString('pt-BR')}</strong>
            </p>
            <p>
              Consultor Líder: <strong className="text-slate-200 print:text-slate-900">{currentProject.leadConsultant}</strong>
            </p>
            <p>
              Status: <strong className="text-blue-400 print:text-blue-700">{currentProject.status}</strong>
            </p>
            <p>
              Orçamento: <strong className="text-slate-200 print:text-slate-900">{formatCurrency(currentProject.budget)}</strong>
            </p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        {includedModules.executiveSummary && (
          <div className="mb-8 space-y-4">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400 print:text-slate-800" />
              1. Sumário Executivo & Diagnóstico
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-300 print:text-slate-700">
              <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-750 print:bg-slate-50 print:border-slate-200">
                <p className="font-bold text-slate-100 mb-1 print:text-slate-900">Parecer Geral da Consultoria:</p>
                <p className="whitespace-pre-line text-slate-300 print:text-slate-700">{consultantNotes}</p>
              </div>
              <div className="p-4 bg-blue-950/40 rounded-lg border border-blue-800/60 print:bg-blue-50/50 print:border-blue-200">
                <p className="font-bold text-blue-300 mb-1 print:text-blue-900">Recomendações Estratégicas:</p>
                <p className="whitespace-pre-line text-blue-100 print:text-blue-950">{recommendations}</p>
              </div>
            </div>

            {/* Quick KPI Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-750 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Ações 5W2H</span>
                <strong className="text-sm font-bold text-slate-100 print:text-slate-900">{currentProjectActions.length}</strong>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-750 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Riscos Mapeados</span>
                <strong className="text-sm font-bold text-slate-100 print:text-slate-900">{currentProjectRisks.length}</strong>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-750 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">OKRs & Metas</span>
                <strong className="text-sm font-bold text-slate-100 print:text-slate-900">{projectOkrs.length}</strong>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-750 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Diagnósticos de Clima</span>
                <strong className="text-sm font-bold text-slate-100 print:text-slate-900">{currentProjectClimateSurveys.length}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Contrato de Prestação de Serviço */}
        {includedModules.contract && projectContract && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <FileSignature className="w-4 h-4 text-blue-400 print:text-slate-800" />
              2. Contrato de Prestação de Serviço (Síntese)
            </h2>
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-750 text-xs space-y-2.5 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between font-bold text-slate-100 print:text-slate-900">
                <span>{projectContract.title} ({projectContract.contractNumber})</span>
                <span className="text-blue-400 print:text-blue-700 font-mono">
                  {formatCurrency(projectContract.totalValue)} • {projectContract.durationMonths} meses
                </span>
              </div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                <strong>Escopo Acordado:</strong> {projectContract.scope}
              </p>
              {projectContract.deliverables && projectContract.deliverables.length > 0 && (
                <div>
                  <strong className="text-slate-200 print:text-slate-800 block mb-1">Entregáveis Contratuais:</strong>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                    {projectContract.deliverables.map((deliv, idx) => (
                      <li key={idx}>{deliv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Simulador de Reunião & Alinhamento */}
        {includedModules.meetings && projectMeetings.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <Presentation className="w-4 h-4 text-blue-400 print:text-slate-800" />
              3. Alinhamento com Stakeholders & Reuniões Simuladas ({projectMeetings.length})
            </h2>
            <div className="space-y-2 text-xs">
              {projectMeetings.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-800/60 rounded-lg border border-slate-750 print:bg-slate-50 print:border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-100 print:text-slate-900">
                    <span>{m.title}</span>
                    <span className="text-slate-400 print:text-slate-600 font-normal">{m.date} • {m.durationMinutes} min</span>
                  </div>
                  <p className="text-slate-300 print:text-slate-700">
                    <strong>Pauta:</strong> {m.agenda}
                  </p>
                  {m.clientFeedback && (
                    <p className="text-slate-400 print:text-slate-600 italic">
                      "Feedback: {m.clientFeedback}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Objetivos e Resultados-Chave (OKRs & Metas) */}
        {(includedModules.okrs || (includedModules as any).bsc) && projectOkrs.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-400 print:text-slate-800" />
              4. Objetivos e Resultados-Chave (OKRs & Metas) — Desdobramento Estratégico ({projectOkrs.length})
            </h2>
            <div className="space-y-4 text-xs">
              {projectOkrs.map((obj) => (
                <div
                  key={obj.id}
                  className="p-4 bg-slate-800/60 rounded-lg border border-slate-750 print:bg-slate-50 print:border-slate-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-750 pb-2 print:border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mr-2 print:text-blue-700">
                        [{obj.category}]
                      </span>
                      <strong className="text-slate-100 print:text-slate-900 text-sm">{obj.title}</strong>
                    </div>
                    <div className="text-slate-400 print:text-slate-600 text-[11px] flex items-center gap-2 shrink-0">
                      <span>Ciclo: <strong>{obj.cycle}</strong></span>
                      <span>•</span>
                      <span>Líder: <strong>{obj.owner}</strong></span>
                    </div>
                  </div>

                  {obj.keyResults.length > 0 ? (
                    <table className="w-full text-left text-xs border border-slate-800 divide-y divide-slate-800 print:border-slate-200 print:divide-slate-200 mt-2">
                      <thead className="bg-slate-800 text-[10px] font-bold text-slate-300 uppercase print:bg-slate-100 print:text-slate-700">
                        <tr>
                          <th className="p-2">Resultado-Chave (KR)</th>
                          <th className="p-2 text-right">Baseline</th>
                          <th className="p-2 text-right">Realizado</th>
                          <th className="p-2 text-right">Meta</th>
                          <th className="p-2 text-center">Progresso</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 print:divide-slate-100">
                        {obj.keyResults.map((kr) => (
                          <tr key={kr.id}>
                            <td className="p-2 font-medium text-slate-200 print:text-slate-800">{kr.title}</td>
                            <td className="p-2 text-right font-mono text-slate-400 print:text-slate-600">
                              {kr.initialValue} {kr.unit}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-slate-100 print:text-slate-900">
                              {kr.currentValue} {kr.unit}
                            </td>
                            <td className="p-2 text-right font-mono text-slate-300 print:text-slate-700 font-semibold">
                              {kr.targetValue} {kr.unit}
                            </td>
                            <td className="p-2 text-center">
                              <span className="font-bold text-slate-100 print:text-slate-900">{kr.progressPercent}%</span>
                            </td>
                            <td className="p-2 font-bold text-blue-400 print:text-blue-700">{kr.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-slate-400 print:text-slate-500 italic text-[11px]">Nenhum Key Result cadastrado.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: SWOT */}
        {includedModules.swot && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <Grid2X2 className="w-4 h-4 text-blue-400 print:text-slate-800" />
              5. Matriz SWOT (Forças, Fraquezas, Oportunidades e Ameaças)
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg print:bg-emerald-50/60 print:border-emerald-200">
                <p className="font-bold text-emerald-300 mb-1 print:text-emerald-900">
                  Forças ({swotGrouped.strengths.length})
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {swotGrouped.strengths.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg print:bg-rose-50/60 print:border-rose-200">
                <p className="font-bold text-rose-300 mb-1 print:text-rose-900">
                  Fraquezas ({swotGrouped.weaknesses.length})
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {swotGrouped.weaknesses.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg print:bg-blue-50/60 print:border-blue-200">
                <p className="font-bold text-blue-300 mb-1 print:text-blue-900">
                  Oportunidades ({swotGrouped.opportunities.length})
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {swotGrouped.opportunities.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg print:bg-amber-50/60 print:border-amber-200">
                <p className="font-bold text-amber-300 mb-1 print:text-amber-900">
                  Ameaças ({swotGrouped.threats.length})
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {swotGrouped.threats.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Ishikawa (Causa & Efeito) */}
        {includedModules.ishikawa && projectIshikawas.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <GitPullRequest className="w-4 h-4 text-blue-400 print:text-slate-800" />
              6. Análise de Causa & Efeito (Diagrama de Ishikawa)
            </h2>
            <div className="space-y-3 text-xs">
              {projectIshikawas.map((ish) => (
                <div
                  key={ish.id}
                  className="p-4 bg-slate-800/60 rounded-lg border border-slate-750 space-y-2 print:bg-slate-50 print:border-slate-200"
                >
                  <p className="font-bold text-slate-100 print:text-slate-900">
                    Problema Central: <span className="text-rose-400 print:text-rose-700">{ish.effect}</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {Object.entries(ish.categories || {}).map(([cat, causes]) => (
                      <div key={cat} className="p-2 bg-slate-900/50 rounded border border-slate-800 print:bg-white print:border-slate-200">
                        <strong className="text-[11px] text-slate-300 print:text-slate-800 capitalize block mb-0.5">
                          {cat}
                        </strong>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400 print:text-slate-600">
                          {Array.isArray(causes) && causes.length > 0 ? (
                            causes.map((c, i) => <li key={i}>{typeof c === 'string' ? c : (c as any).text}</li>)
                          ) : (
                            <li className="italic text-slate-500">Sem causas</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 7: 5W2H Action Plan */}
        {includedModules.actions5w2h && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-blue-400 print:text-slate-800" />
              7. Plano de Ação 5W2H ({currentProjectActions.length} ações)
            </h2>
            <table className="w-full text-left text-xs border border-slate-800 divide-y divide-slate-800 print:border-slate-200 print:divide-slate-200">
              <thead className="bg-slate-800 text-[10px] font-bold text-slate-300 uppercase print:bg-slate-100 print:text-slate-700">
                <tr>
                  <th className="p-2">What (O que)</th>
                  <th className="p-2">Who (Quem)</th>
                  <th className="p-2">When (Prazo)</th>
                  <th className="p-2">How (Como)</th>
                  <th className="p-2 text-right">Custo</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 print:divide-slate-100">
                {currentProjectActions.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2 font-bold text-slate-200 print:text-slate-900">{a.what}</td>
                    <td className="p-2 text-slate-300 print:text-slate-800">{a.who}</td>
                    <td className="p-2 font-mono text-slate-400 print:text-slate-700">{a.when}</td>
                    <td className="p-2 text-[11px] text-slate-400 print:text-slate-600">{a.how}</td>
                    <td className="p-2 text-right font-mono text-slate-300 print:text-slate-900">
                      {formatCurrency(a.howMuch)}
                    </td>
                    <td className="p-2 font-semibold text-[11px] text-slate-200 print:text-slate-800">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 8: Gantt Timeline */}
        {includedModules.gantt && currentProjectTasks.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-400 print:text-slate-800" />
              8. Cronograma de Entregas & Gantt ({currentProjectTasks.length} tarefas)
            </h2>
            <table className="w-full text-left text-xs border border-slate-800 divide-y divide-slate-800 print:border-slate-200 print:divide-slate-200">
              <thead className="bg-slate-800 text-[10px] font-bold text-slate-300 uppercase print:bg-slate-100 print:text-slate-700">
                <tr>
                  <th className="p-2">Tarefa</th>
                  <th className="p-2">Início</th>
                  <th className="p-2">Término</th>
                  <th className="p-2">Responsável</th>
                  <th className="p-2">Progresso</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 print:divide-slate-100">
                {currentProjectTasks.map((t) => (
                  <tr key={t.id}>
                    <td className="p-2 font-bold text-slate-200 print:text-slate-900">{t.title}</td>
                    <td className="p-2 text-slate-400 print:text-slate-700 font-mono">{t.startDate}</td>
                    <td className="p-2 text-slate-400 print:text-slate-700 font-mono">{t.endDate}</td>
                    <td className="p-2 text-slate-300 print:text-slate-800">{t.assignee || 'Consultor'}</td>
                    <td className="p-2 font-mono text-slate-300 print:text-slate-900">{t.progress}%</td>
                    <td className="p-2 text-slate-300 print:text-slate-800">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 9: Risk Matrix */}
        {includedModules.risks && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-400 print:text-slate-800" />
              9. Matriz de Riscos & Severidade ({currentProjectRisks.length} riscos)
            </h2>
            <div className="space-y-2 text-xs">
              {currentProjectRisks.map((r) => (
                <div
                  key={r.id}
                  className="p-2.5 bg-slate-800/60 border border-slate-750 rounded-lg flex items-center justify-between gap-3 print:bg-slate-50 print:border-slate-200"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 print:text-slate-900">{r.risk}</span>
                      <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded print:bg-white print:border-slate-200 print:text-slate-700">
                        {r.category}
                      </span>
                    </div>
                    {r.preventiveAction && (
                      <p className="text-[11px] text-slate-400 mt-0.5 print:text-slate-600">
                        Prevenção: {r.preventiveAction}
                      </p>
                    )}
                  </div>
                  <div className="text-right font-bold text-xs shrink-0 text-slate-300 print:text-slate-900">
                    <span>
                      {r.classification} (Score {r.riskScore})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 10: Pareto */}
        {includedModules.pareto && currentProjectPareto.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-400 print:text-slate-800" />
              10. Análise de Pareto (Priorização 80/20)
            </h2>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-750 text-xs space-y-1.5 print:bg-slate-50 print:border-slate-200">
              <p className="font-bold text-slate-200 print:text-slate-800 mb-1">
                Principais Causas Mapeadas por Volume/Impacto:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentProjectPareto.slice(0, 4).map((p) => (
                  <div key={p.id} className="p-2 bg-slate-900/50 rounded border border-slate-800 print:bg-white print:border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-200 print:text-slate-900 block truncate">{p.category}</span>
                    <span className="text-[10px] text-blue-400 print:text-blue-700 font-bold">{p.count} ocorrências ({p.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 11: Pesquisa de Clima & eNPS */}
        {includedModules.climateSurvey && currentProjectClimateSurveys.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-blue-400 print:text-slate-800" />
              11. Diagnóstico de Pesquisa de Clima & eNPS ({currentProjectClimateSurveys.length})
            </h2>
            <div className="space-y-4 text-xs">
              {currentProjectClimateSurveys.map((surv) => (
                <div
                  key={surv.id}
                  className="p-4 bg-slate-800/60 rounded-lg border border-slate-750 space-y-3 print:bg-slate-50 print:border-slate-200"
                >
                  <div className="flex items-center justify-between font-bold text-slate-100 print:text-slate-900">
                    <span className="text-sm">
                      {surv.title} ({surv.cycle})
                    </span>
                    <span className="text-blue-400 print:text-blue-700">
                      eNPS: {surv.enpsScore > 0 ? `+${surv.enpsScore}` : surv.enpsScore} pts | Favorabilidade:{' '}
                      {surv.overallFavorabilityPercent}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800 print:bg-white print:border-slate-200">
                      <span className="text-slate-400 print:text-slate-600 block">Respondentes</span>
                      <strong className="text-slate-100 print:text-slate-900">
                        {surv.totalRespondents} / {surv.totalEligible} ({surv.participationRate}%)
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800 print:bg-white print:border-slate-200">
                      <span className="text-slate-400 print:text-slate-600 block">Promotores (9-10)</span>
                      <strong className="text-emerald-400 print:text-emerald-700">{surv.enpsPromotersPercent}%</strong>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800 print:bg-white print:border-slate-200">
                      <span className="text-slate-400 print:text-slate-600 block">Detratores (0-6)</span>
                      <strong className="text-rose-400 print:text-rose-700">{surv.enpsDetractorsPercent}%</strong>
                    </div>
                  </div>

                  {surv.dimensions && surv.dimensions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="font-semibold text-slate-300 print:text-slate-800 block text-[11px]">
                        Favorabilidade por Dimensões:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {surv.dimensions.map((dim) => (
                          <div
                            key={dim.key}
                            className="p-1.5 bg-slate-900/40 rounded border border-slate-800 text-[11px] flex justify-between print:bg-white print:border-slate-200"
                          >
                            <span className="text-slate-300 print:text-slate-700 truncate pr-1">{dim.name}</span>
                            <span className="font-bold text-slate-100 print:text-slate-900">{dim.favorabilityPercent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {surv.executiveSummary && (
                    <p className="text-[11px] text-slate-300 print:text-slate-700 italic bg-slate-900/40 p-2 rounded border border-slate-800 print:bg-white print:border-slate-200">
                      "{surv.executiveSummary}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formal Signatures Footer */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-center text-xs print:border-slate-300">
          <div>
            <div className="border-t border-slate-700 w-48 mx-auto mb-1 pt-1 print:border-slate-400" />
            <p className="font-bold text-slate-100 print:text-slate-900">{currentProject.leadConsultant}</p>
            <p className="text-[11px] text-slate-400 print:text-slate-500">Consultor Líder do Projeto</p>
          </div>
          <div>
            <div className="border-t border-slate-700 w-48 mx-auto mb-1 pt-1 print:border-slate-400" />
            <p className="font-bold text-slate-100 print:text-slate-900">{currentProject.clientName}</p>
            <p className="text-[11px] text-slate-400 print:text-slate-500">Representante do Cliente</p>
          </div>
        </div>
      </div>
    </div>
  );
};
