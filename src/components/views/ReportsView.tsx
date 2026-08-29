import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import {
  FileText,
  Printer,
  Download,
  CheckSquare,
  Sparkles,
  Shield,
  BarChart2,
  Calendar,
  Building2,
  Layers,
  Award,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    currentProject,
    currentProjectClient,
    currentProjectSwot,
    currentProjectGantt,
    currentProjectIshikawa,
    currentProjectActions,
    currentProjectRisks,
    currentProjectPareto,
    currentProjectClimateSurveys,
    settings,
    formatCurrency,
  } = useConsulting();

  // Selection of included modules in the executive report
  const [includedModules, setIncludedModules] = useState({
    executiveSummary: true,
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
    `1. Priorizar as 3 ações com prazo de 30 dias no plano 5W2H.\n2. Instituir comitê semanal de governança com os stakeholders-chave.\n3. Acompanhar os KRs do ciclo Q1 para garantir o atingimento das metas.`
  );

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const projectData = {
      project: currentProject,
      client: currentProjectClient,
      swot: currentProjectSwot,
      gantt: currentProjectGantt,
      ishikawa: currentProjectIshikawa,
      actions5w2h: currentProjectActions,
      risks: currentProjectRisks,
      pareto: currentProjectPareto,
      climateSurveys: currentProjectClimateSurveys,
      generatedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Relatorio_Consultoria_${currentProject.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header - Hidden when printing */}
      <div className="print:hidden">
        <Breadcrumbs
          title="Relatório Executivo de Consultoria & Exportação"
          subtitle="Geração de dossiê profissional para o cliente, impressão em PDF e backup estruturado"
          actions={
            <>
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                Exportar Dados (JSON)
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Salvar PDF
              </button>
            </>
          }
        />
      </div>

      {/* Module Selector & Notes Customizer (Hidden during Print) */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm space-y-4 print:hidden">
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Módulos a Incluir no Relatório do Cliente:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2 text-xs">
            {[
              { key: 'executiveSummary', label: 'Sumário & Diagnóstico' },
              { key: 'swot', label: 'Matriz SWOT' },
              { key: 'ishikawa', label: 'Causa & Efeito (Ishikawa)' },
              { key: 'actions5w2h', label: 'Plano de Ação 5W2H' },
              { key: 'gantt', label: 'Cronograma Gantt' },
              { key: 'risks', label: 'Matriz de Riscos' },
              { key: 'pareto', label: 'Análise de Pareto' },
              { key: 'climateSurvey', label: 'Pesquisa de Clima & eNPS' },
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
                  className="rounded text-blue-500 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">{mod.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Parecer do Consultor Líder
            </label>
            <textarea
              rows={3}
              value={consultantNotes}
              onChange={(e) => setConsultantNotes(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
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
              className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* PRINTABLE EXECUTIVE REPORT PREVIEW CONTAINER */}
      <div className="bg-slate-900 p-8 sm:p-12 rounded-xl border border-slate-800 shadow-xl text-slate-100 max-w-5xl mx-auto print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
        {/* Formal Header */}
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm print:bg-slate-900">
                CH
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-100 uppercase print:text-slate-900">
                {settings.consultingFirmName}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-2 print:text-slate-900">
              Relatório Executivo & Diagnóstico Estratégico
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 print:text-slate-600">
              Projeto: <strong className="text-slate-100 print:text-slate-900">{currentProject.name}</strong> • Cliente:{' '}
              <strong className="text-slate-100 print:text-slate-900">{currentProject.clientName}</strong>
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

        {/* Section: Executive Summary */}
        {includedModules.executiveSummary && (
          <div className="mb-8 space-y-4">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-200">
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
          </div>
        )}

        {/* Section: SWOT */}
        {includedModules.swot && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-200">
              2. Matriz SWOT (Forças, Fraquezas, Oportunidades e Ameaças)
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg print:bg-emerald-50/60 print:border-emerald-200">
                <p className="font-bold text-emerald-300 mb-1 print:text-emerald-900">Forças ({currentProjectSwot.strengths.length})</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {currentProjectSwot.strengths.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg print:bg-rose-50/60 print:border-rose-200">
                <p className="font-bold text-rose-300 mb-1 print:text-rose-900">Fraquezas ({currentProjectSwot.weaknesses.length})</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {currentProjectSwot.weaknesses.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg print:bg-blue-50/60 print:border-blue-200">
                <p className="font-bold text-blue-300 mb-1 print:text-blue-900">Oportunidades ({currentProjectSwot.opportunities.length})</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {currentProjectSwot.opportunities.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg print:bg-amber-50/60 print:border-amber-200">
                <p className="font-bold text-amber-300 mb-1 print:text-amber-900">Ameaças ({currentProjectSwot.threats.length})</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                  {currentProjectSwot.threats.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section: 5W2H Action Plan */}
        {includedModules.actions5w2h && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-200">
              3. Plano de Ação 5W2H ({currentProjectActions.length} ações)
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
                    <td className="p-2 text-right font-mono text-slate-300 print:text-slate-900">{formatCurrency(a.howMuch)}</td>
                    <td className="p-2 font-semibold text-[11px] text-slate-200 print:text-slate-800">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section: Risk Matrix */}
        {includedModules.risks && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-200">
              4. Matriz de Riscos & Severidade
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
                      <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.2 rounded print:bg-white print:border-slate-200 print:text-slate-700">
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
                    <span>{r.classification} (Score {r.riskScore})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Pesquisa de Clima & eNPS */}
        {includedModules.climateSurvey && currentProjectClimateSurveys.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-slate-900 print:border-slate-200">
              5. Diagnóstico de Clima Organizacional & eNPS
            </h2>
            <div className="space-y-4 text-xs">
              {currentProjectClimateSurveys.map((surv) => (
                <div
                  key={surv.id}
                  className="p-4 bg-slate-800/60 rounded-lg border border-slate-750 space-y-3 print:bg-slate-50 print:border-slate-200"
                >
                  <div className="flex items-center justify-between font-bold text-slate-100 print:text-slate-900">
                    <span className="text-sm">{surv.title} ({surv.cycle})</span>
                    <span className="text-blue-400 print:text-blue-700">
                      eNPS: {surv.enpsScore > 0 ? `+${surv.enpsScore}` : surv.enpsScore} pts | Favorabilidade: {surv.overallFavorabilityPercent}%
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
