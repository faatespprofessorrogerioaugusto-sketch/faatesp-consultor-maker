import React, { useState, useMemo } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { generateConsultingDocx } from '../../utils/docxExport';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Copy,
  Calendar,
  CheckSquare,
  Sparkles,
  ShieldAlert,
  BarChart3,
  FileSignature,
  Presentation,
  Target,
  Grid2X2,
  GitPullRequest,
  HeartHandshake,
  Check,
  Compass,
  FileText,
  FileDown,
  Loader2,
  FileCode,
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
    calculateRiskClass,
  } = useConsulting();

  // Derived client for current project
  const currentProjectClient = useMemo(() => {
    if (!currentProject) return null;
    return clients.find((c) => c.id === currentProject.clientId) || null;
  }, [currentProject, clients]);

  // Derived SWOT categories
  const swotGrouped = useMemo(() => {
    const list = Array.isArray(currentProjectSwot) ? currentProjectSwot : [];
    const isCategory = (item: any, cat: string) => {
      const c = (item.category || item.type || '').toLowerCase();
      return c.includes(cat);
    };
    return {
      strengths: list.filter((i) => isCategory(i, 'for') || isCategory(i, 'streng')),
      weaknesses: list.filter((i) => isCategory(i, 'fra') || isCategory(i, 'weak')),
      opportunities: list.filter((i) => isCategory(i, 'opor') || isCategory(i, 'oppor')),
      threats: list.filter((i) => isCategory(i, 'ame') || isCategory(i, 'threa')),
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

  const projectBscObjectives = useMemo(() => {
    return (bscObjectives || []).filter((b) => !b.projectId || b.projectId === currentProjectId);
  }, [bscObjectives, currentProjectId]);

  // Selection of included modules in the executive report
  const [includedModules, setIncludedModules] = useState({
    executiveSummary: true,
    contract: true,
    meetings: true,
    bsc: true,
    okrs: false,
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
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Impressão / Exportação PDF
  const handlePrint = () => {
    if (!currentProject) {
      showToast('Selecione um projeto para gerar o relatório em PDF.', 'warning');
      return;
    }
    showToast('Preparando impressão. Escolha "Salvar como PDF" no destino da impressora para gerar o arquivo.', 'info');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Exportação DOCX via docx
  const handleExportDOCX = async () => {
    if (!currentProject) {
      showToast('Selecione um projeto para exportar o relatório.', 'warning');
      return;
    }

    try {
      setIsExportingDocx(true);
      showToast('Compilando relatório executivo em formato Word (.docx)...', 'info');

      const blob = await generateConsultingDocx({
        project: currentProject,
        client: currentProjectClient,
        contract: projectContract,
        meetings: projectMeetings,
        bscObjectives: projectBscObjectives,
        okrs: projectOkrs,
        swotItems: currentProjectSwot || [],
        ishikawas: projectIshikawas,
        actions5w2h: currentProjectActions,
        ganttTasks: currentProjectTasks,
        risks: currentProjectRisks,
        pareto: currentProjectPareto,
        climateSurveys: currentProjectClimateSurveys,
        consultantNotes,
        recommendations,
        settings,
        includedModules,
        formatCurrency,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizedName = currentProject.name.replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
      link.download = `Relatorio_Executivo_${sanitizedName}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showToast('Relatório DOCX (Word) gerado e baixado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar DOCX:', error);
      showToast('Ocorreu um erro ao gerar o arquivo Word. Tente novamente.', 'error');
    } finally {
      setIsExportingDocx(false);
    }
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
      bsc: projectBscObjectives,
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
    swotGrouped.strengths.forEach((s) => csvContent += `"Forca";"${s.factor || (s as any).text || ''}";"${s.impact || 3}"\n`);
    swotGrouped.weaknesses.forEach((w) => csvContent += `"Fraqueza";"${w.factor || (w as any).text || ''}";"${w.impact || 3}"\n`);
    swotGrouped.opportunities.forEach((o) => csvContent += `"Oportunidade";"${o.factor || (o as any).text || ''}";"${o.impact || 3}"\n`);
    swotGrouped.threats.forEach((t) => csvContent += `"Ameaca";"${t.factor || (t as any).text || ''}";"${t.impact || 3}"\n`);

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
• Metas BSC: ${projectBscObjectives.length} objetivos estratégicos
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
          subtitle="Geração de relatórios gerenciais, exportação em Word (DOCX), impressão em PDF e dados estruturados"
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
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 cursor-pointer"
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
          title="Relatório Executivo & Centro de Exportação"
          subtitle="Geração de dossiê profissional para o cliente, exportação nativa em DOCX (Word), impressão vetorial em PDF e planilhas"
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
                id="btn-export-docx"
                onClick={handleExportDOCX}
                disabled={isExportingDocx}
                className="px-3 py-1.5 text-xs font-semibold text-blue-100 bg-blue-700/80 border border-blue-600 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                title="Exportar documento no formato Microsoft Word (.docx)"
              >
                {isExportingDocx ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando Word...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-blue-300" />
                    <span>Exportar DOCX (Word)</span>
                  </>
                )}
              </button>

              <button
                id="btn-print-report"
                onClick={handlePrint}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Imprimir ou Salvar em PDF de alta qualidade"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Exportar PDF / Imprimir</span>
              </button>
            </div>
          }
        />
      </div>

      {/* QUICK EXPORT CHANNELS CARD (Hidden during Print) */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileDown className="w-4 h-4 text-blue-400" />
              <span>Formatos de Exportação Direta</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Escolha o formato ideal para apresentação executiva, edição no Microsoft Word ou análise em planilhas:
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Projeto:</span>
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="text-xs bg-transparent border-none text-slate-100 font-bold focus:ring-0 cursor-pointer outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-white">
                  {p.name} ({p.clientName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action format cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. PDF */}
          <button
            onClick={handlePrint}
            className="text-left p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 rounded-xl transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-rose-300">Documento PDF</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Diagramação executiva A4, cabeçalhos formais e assinatura (via impressão / salvar como PDF).
            </p>
          </button>

          {/* 2. DOCX */}
          <button
            onClick={handleExportDOCX}
            disabled={isExportingDocx}
            className="text-left p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 rounded-xl transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                DOCX
              </div>
              {isExportingDocx ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              )}
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-blue-300">Microsoft Word (.docx)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Arquivo nativo do Word totalmente editável com tabelas estruturadas, estilos corporativos e capas.
            </p>
          </button>

          {/* 3. CSV */}
          <button
            onClick={handleExportCSV}
            className="text-left p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500 rounded-xl transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                CSV
              </div>
              <FileSpreadsheet className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Planilha Excel (CSV)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Tabelas tabuladas com 5W2H, Riscos, SWOT e OKRs prontas para importação no Excel ou PowerBI.
            </p>
          </button>

          {/* 4. JSON */}
          <button
            onClick={handleExportJSON}
            className="text-left p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500 rounded-xl transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                JSON
              </div>
              <FileCode className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-300">Backup Técnico (JSON)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Exportação do banco de dados completo do projeto para integração ou restauração técnica.
            </p>
          </button>
        </div>
      </div>

      {/* Module Selector & Notes Customizer (Hidden during Print) */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4 print:hidden">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Personalização do Dossiê Executivo
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Selecione quais seções deseja incluir tanto na visualização em tela, no documento Word (.docx) e na impressão em PDF:
          </p>
        </div>

        {/* Modules Checkboxes */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            {[
              { key: 'executiveSummary', label: 'Sumário Executivo' },
              { key: 'contract', label: 'Contrato de Serviço' },
              { key: 'meetings', label: 'Simulador de Reunião' },
              { key: 'bsc', label: 'Balanced Scorecard (BSC)' },
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
      <div className="bg-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-800 shadow-xl text-slate-100 max-w-5xl mx-auto print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
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
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Metas BSC</span>
                <strong className="text-sm font-bold text-slate-100 print:text-slate-900">{projectBscObjectives.length}</strong>
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
              3. Alinhamento com Stakeholders & Reuniões ({projectMeetings.length})
            </h2>
            <div className="space-y-2 text-xs">
              {projectMeetings.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-800/60 rounded-lg border border-slate-750 print:bg-slate-50 print:border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-100 print:text-slate-900">
                    <span>{m.title}</span>
                    <span className="text-slate-400 print:text-slate-600 font-normal">
                      {m.scheduledDate || (m as any).date || 'Data não definida'} • {m.durationMinutes} min
                    </span>
                  </div>
                  <p className="text-slate-300 print:text-slate-700">
                    <strong>Pauta:</strong>{' '}
                    {Array.isArray(m.agenda)
                      ? m.agenda.map((a: any) => a.title || a).join(', ')
                      : String(m.agenda || 'Alinhamento geral')}
                  </p>
                  {(m.meetingNotes || (m as any).clientFeedback) && (
                    <p className="text-slate-400 print:text-slate-600 italic">
                      "Notas: {m.meetingNotes || (m as any).clientFeedback}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Balanced Scorecard (BSC) */}
        {includedModules.bsc && projectBscObjectives.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-400 print:text-slate-800" />
              4. Balanced Scorecard (BSC) & Metas Estratégicas ({projectBscObjectives.length})
            </h2>
            <div className="space-y-4 text-xs overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 divide-y divide-slate-800 print:border-slate-200 print:divide-slate-200">
                <thead className="bg-slate-800 text-[10px] font-bold text-slate-300 uppercase print:bg-slate-100 print:text-slate-700">
                  <tr>
                    <th className="p-2">Perspectiva</th>
                    <th className="p-2">Objetivo Estratégico</th>
                    <th className="p-2">Indicador (KPI)</th>
                    <th className="p-2 text-right">Realizado</th>
                    <th className="p-2 text-right">Meta</th>
                    <th className="p-2 text-center">Progresso</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 print:divide-slate-100">
                  {projectBscObjectives.map((b) => {
                    const prog = b.targetValue > 0 ? Math.min(100, Math.round((b.currentValue / b.targetValue) * 100)) : 0;
                    const perspLabels: Record<string, string> = {
                      financial: '1. Financeira',
                      customer: '2. Clientes & Mercado',
                      internal: '3. Processos Internos',
                      learning: '4. Aprendizado & Crescimento',
                    };
                    const statusLabels: Record<string, string> = {
                      achieved: 'Alcançado',
                      on_track: 'No Prazo',
                      warning: 'Atenção',
                      critical: 'Crítico',
                    };
                    return (
                      <tr key={b.id}>
                        <td className="p-2 font-semibold text-blue-400 print:text-blue-700 whitespace-nowrap">
                          {perspLabels[b.perspective] || b.perspective}
                        </td>
                        <td className="p-2 font-medium text-slate-200 print:text-slate-800">
                          {b.name}
                          {b.initiatives && (
                            <span className="block text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                              Iniciativa: {b.initiatives}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-slate-300 print:text-slate-700">{b.kpi}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-100 print:text-slate-900">
                          {b.currentValue} {b.unit}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-300 print:text-slate-700 font-semibold">
                          {b.targetValue} {b.unit}
                        </td>
                        <td className="p-2 text-center">
                          <span className="font-bold text-slate-100 print:text-slate-900">{prog}%</span>
                        </td>
                        <td className="p-2 font-bold text-blue-400 print:text-blue-700">
                          {statusLabels[b.status] || b.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section: Objetivos e Resultados-Chave (OKRs & Metas) */}
        {includedModules.okrs && projectOkrs.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-400 print:text-slate-800" />
              Objetivos e Resultados-Chave (OKRs) — Desdobramento Estratégico ({projectOkrs.length})
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
                    <li key={s.id}>{s.factor || (s as any).text || s.description || 'Força identificada'}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg print:bg-rose-50/60 print:border-rose-200">
                <p className="font-bold text-rose-300 mb-1 print:text-rose-900">
                  Fraquezas ({swotGrouped.weaknesses.length})
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {swotGrouped.weaknesses.map((s) => (
                    <li key={s.id}>{s.factor || (s as any).text || s.description || 'Fraqueza identificada'}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg print:bg-blue-50/60 print:border-blue-200">
                <p className="font-bold text-blue-300 mb-1 print:text-blue-900">
                  Oportunidades ({swotGrouped.opportunities.length})
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {swotGrouped.opportunities.map((s) => (
                    <li key={s.id}>{s.factor || (s as any).text || s.description || 'Oportunidade mapeada'}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg print:bg-amber-50/60 print:border-amber-200">
                <p className="font-bold text-amber-300 mb-1 print:text-amber-900">
                  Ameaças ({swotGrouped.threats.length})
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {swotGrouped.threats.map((s) => (
                    <li key={s.id}>{s.factor || (s as any).text || s.description || 'Ameaça mapeada'}</li>
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
                    Problema Central:{' '}
                    <span className="text-rose-400 print:text-rose-700">
                      {ish.problemStatement || ish.problem || (ish as any).effect || ish.description || 'Problema em análise'}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {ish.causes && ish.causes.length > 0 ? (
                      ish.causes.map((c, i) => (
                        <div key={i} className="p-2 bg-slate-900/50 rounded border border-slate-800 print:bg-white print:border-slate-200">
                          <strong className="text-[11px] text-slate-300 print:text-slate-800 capitalize block mb-0.5">
                            {c.category}
                          </strong>
                          <p className="text-[10px] text-slate-400 print:text-slate-600">{c.cause}</p>
                        </div>
                      ))
                    ) : (
                      <p className="italic text-slate-500 text-xs">Sem causas detalhadas registradas.</p>
                    )}
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
                    <td className="p-2 font-bold text-slate-200 print:text-slate-900">{t.name || (t as any).title}</td>
                    <td className="p-2 text-slate-400 print:text-slate-700 font-mono">{t.startDate}</td>
                    <td className="p-2 text-slate-400 print:text-slate-700 font-mono">{t.endDate}</td>
                    <td className="p-2 text-slate-300 print:text-slate-800">{t.responsible || (t as any).assignee || 'Consultor'}</td>
                    <td className="p-2 font-mono text-slate-300 print:text-slate-900">
                      {t.progressPercent !== undefined ? t.progressPercent : (t as any).progress || 0}%
                    </td>
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
                      {(calculateRiskClass ? calculateRiskClass(r.riskScore) : r.classification)} (Score {r.riskScore})
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
                {currentProjectPareto.slice(0, 4).map((p) => {
                  const totalParetoCount = currentProjectPareto.reduce((acc, it) => acc + (it.count || 0), 0) || 1;
                  const pct = Math.round(((p.count || 0) / totalParetoCount) * 100);
                  return (
                    <div key={p.id} className="p-2 bg-slate-900/50 rounded border border-slate-800 print:bg-white print:border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-200 print:text-slate-900 block truncate">{p.category}</span>
                      <span className="text-[10px] text-blue-400 print:text-blue-700 font-bold">{p.count} ocorrências ({pct}%)</span>
                    </div>
                  );
                })}
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
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-center text-xs print:border-slate-300 break-inside-avoid">
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
