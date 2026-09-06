import React, { useState, useEffect } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { ConsultingPlan, ConsultingPlanPhaseItem } from '../../types';
import {
  FileText,
  Printer,
  RotateCw,
  Edit3,
  Eye,
  CheckCircle2,
  FolderKanban,
  Building2,
  Users2,
  Calendar,
  Save,
  Undo2,
  Copy,
  Sparkles,
  Layers,
  Clock,
  Target,
  ShieldCheck,
  Award,
} from 'lucide-react';

const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return dateStr;
};

export const ConsultingPlanView: React.FC = () => {
  const {
    currentProjectId,
    setCurrentProjectId,
    projects,
    currentProject,
    currentProjectPlan,
    saveConsultingPlan,
    syncPlanWithProjectData,
    showToast,
    currentUser,
  } = useConsulting();

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [formData, setFormData] = useState<ConsultingPlan | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync formData whenever currentProjectPlan or project changes
  useEffect(() => {
    if (currentProjectPlan) {
      setFormData(JSON.parse(JSON.stringify(currentProjectPlan)));
    }
  }, [currentProjectPlan, currentProjectId]);

  const handleSyncWithTools = () => {
    if (!currentProjectId) return;
    setIsSyncing(true);
    setTimeout(() => {
      try {
        const fresh = syncPlanWithProjectData(currentProjectId);
        setFormData(JSON.parse(JSON.stringify(fresh)));
        setIsSyncing(false);
      } catch (err) {
        setIsSyncing(false);
      }
    }, 400);
  };

  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData || !currentProjectId) return;
    saveConsultingPlan({
      ...formData,
      projectId: currentProjectId,
    });
    setActiveTab('preview');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!formData) return;
    const text = `
PLANO DE CONSULTORIA

1. IDENTIFICAÇÃO
Empresa/Cliente: ${formData.clientName}
Consultor(es) responsável(is): ${formData.consultants}
Data de elaboração: ${formatDateBR(formData.elaborationDate)}

2. DESCRIÇÃO DO PROBLEMA OU OPORTUNIDADE
${formData.problemDescription}

3. OBJETIVOS DO TRABALHO
${formData.objectives.map((o) => `• ${o}`).join('\n')}

4. METODOLOGIAS E FERRAMENTAS
${formData.methodologiesAndTools}

5. CRONOGRAMA DAS FASES DO PROCESSO
${formData.phases.map((p) => `- [${p.stage}] | ${p.description} | Prazo: ${p.estimatedDeadline} | Resp: ${p.responsibleRole}`).join('\n')}

6. RECURSOS NECESSÁRIOS
${formData.humanResources}
${formData.materialTechResources}
${formData.dataAccessDocuments}

7. INDICADORES DE SUCESSO
${formData.successIndicators.map((i) => `• ${i}`).join('\n')}

8. OBSERVAÇÕES GERAIS
${formData.generalObservations}
    `.trim();

    navigator.clipboard.writeText(text);
    showToast('Plano de Consultoria copiado para a área de transferência!');
  };

  if (!currentProject || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800">
        <FolderKanban className="w-12 h-12 text-slate-500 mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-200">Nenhum projeto selecionado</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-md">
          Selecione ou crie um projeto de consultoria para visualizar e estruturar o Plano de Consultoria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header / Control Bar (Hidden on Print) */}
      <div className="print:hidden bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">Plano de Consultoria</h1>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Modelo Integrado
                </span>
                {currentUser?.group && (
                  <span className="px-2.5 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full">
                    {currentUser.group}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Consolidação automática dos diagnósticos (SWOT, Pareto, Riscos, Clima), OKRs, Gantt e Planos 5W2H.
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-blue-400" /> Projeto:
            </span>
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                  {p.name} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Visualizar Modelo
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'edit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Editar Campos
            </button>
          </div>

          <button
            onClick={handleSyncWithTools}
            disabled={isSyncing}
            title="Atualizar dados automaticamente a partir das ferramentas do projeto"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>

          <button
            onClick={handleCopyText}
            title="Copiar texto consolidado"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar
          </button>

          <button
            onClick={handlePrint}
            title="Imprimir ou Salvar em PDF"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Auto-fill Info Banner (Hidden on Print) */}
      <div className="print:hidden bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/60 p-4 rounded-xl border border-blue-800/40 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-blue-200">
            Preenchimento Automático Multi-Seção Ativo
          </p>
          <p className="text-slate-300 leading-relaxed">
            Este Plano de Consultoria mapeia e consolida em tempo real as informações de <strong>Cadastro de Clientes</strong>, 
            <strong> Escopo do Projeto</strong>, <strong>Análise SWOT</strong>, <strong>Diagrama de Pareto (80/20)</strong>, 
            <strong> Matriz de Riscos</strong>, <strong>Pesquisa de Clima</strong>, <strong>OKRs</strong>, 
            <strong> Diagrama de Gantt</strong> e <strong>Planos de Ação 5W2H</strong>.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: OFFICIAL DOCUMENT PREVIEW (Styled exactly like the reference PDF) */}
      {/* ========================================================================= */}
      {activeTab === 'preview' ? (
        <div className="flex justify-center">
          <div className="w-full max-w-[850px] bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 md:p-16 border border-slate-200/80 font-serif leading-relaxed print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:text-black">
            
            {/* Header Title */}
            <div className="text-center mb-10 pb-4 border-b-2 border-slate-900/80">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-slate-950 font-sans">
                PLANO DE CONSULTORIA
              </h1>
              <p className="text-xs uppercase tracking-widest text-slate-600 font-sans mt-1">
                Documento de Alinhamento Estratégico e Planejamento Executivo
              </p>
            </div>

            {/* Section 1: IDENTIFICAÇÃO */}
            <div className="mb-8 space-y-2">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900 flex items-center gap-2">
                1. IDENTIFICAÇÃO
              </h2>
              <div className="text-sm font-sans space-y-2 text-slate-800 bg-slate-50/60 p-4 rounded-lg border border-slate-200/60 print:bg-transparent print:p-0 print:border-none">
                <p>
                  <strong className="font-semibold text-slate-950">Empresa/Cliente:</strong> {formData.clientName}
                  {formData.clientContactPerson && ` (${formData.clientContactPerson}${formData.clientRole ? ` — ${formData.clientRole}` : ''})`}
                </p>
                <p>
                  <strong className="font-semibold text-slate-950">Consultor(es) responsável(is):</strong> {formData.consultants}
                  {formData.groupName && ` • ${formData.groupName}`}
                </p>
                <p>
                  <strong className="font-semibold text-slate-950">Data de elaboração:</strong> {formatDateBR(formData.elaborationDate)}
                </p>
              </div>
              <div className="w-full h-px bg-slate-300 mt-4" />
            </div>

            {/* Section 2: DESCRIÇÃO DO PROBLEMA OU OPORTUNIDADE */}
            <div className="mb-8 space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900">
                2. DESCRIÇÃO DO PROBLEMA OU OPORTUNIDADE
              </h2>
              <div className="text-sm text-slate-800 font-sans text-justify space-y-2 leading-relaxed">
                <p>{formData.problemDescription}</p>
                {formData.problemPerceptionContext && (
                  <p className="text-slate-700 bg-slate-50/70 p-3 rounded border-l-2 border-blue-600 print:bg-transparent print:p-0 print:border-none">
                    <strong>Evidências e Percepção:</strong> {formData.problemPerceptionContext}
                  </p>
                )}
                {formData.prioritizedPainPoints && formData.prioritizedPainPoints.length > 0 && (
                  <div className="mt-2 text-xs font-sans text-slate-700 space-y-1">
                    <p className="font-semibold text-slate-900">Gargalos e vulnerabilidades críticas diagnosticadas:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {formData.prioritizedPainPoints.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="w-full h-px bg-slate-300 mt-4" />
            </div>

            {/* Section 3: OBJETIVOS DO TRABALHO */}
            <div className="mb-8 space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900">
                3. OBJETIVOS DO TRABALHO
              </h2>
              <div className="text-sm text-slate-800 font-sans space-y-2 pl-2">
                {formData.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-900 font-bold">•</span>
                    <p className="leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
              <div className="w-full h-px bg-slate-300 mt-4" />
            </div>

            {/* Section 4: METODOLOGIAS E FERRAMENTAS */}
            <div className="mb-8 space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900">
                4. METODOLOGIAS E FERRAMENTAS
              </h2>
              <div className="text-sm text-slate-800 font-sans text-justify space-y-3 whitespace-pre-line leading-relaxed">
                {formData.methodologiesAndTools}
              </div>

              {formData.selectedToolsList && formData.selectedToolsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 print:hidden">
                  {formData.selectedToolsList.map((t, idx) => (
                    <span key={idx} className="text-[11px] font-sans font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="w-full h-px bg-slate-300 mt-4" />
            </div>

            {/* Section 5: CRONOGRAMA DAS FASES DO PROCESSO */}
            <div className="mb-8 space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900">
                5. CRONOGRAMA DAS FASES DO PROCESSO
              </h2>
              
              {/* Process Phases Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-400 mt-3 print:border-black">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-[#1e3a8a] text-white print:bg-slate-200 print:text-black print:font-bold">
                      <th className="p-3 border-r border-b border-blue-900/60 print:border-black font-semibold w-1/4">
                        Etapa
                      </th>
                      <th className="p-3 border-r border-b border-blue-900/60 print:border-black font-semibold w-2/5">
                        Descrição
                      </th>
                      <th className="p-3 border-r border-b border-blue-900/60 print:border-black font-semibold w-1/6">
                        Prazo estimado
                      </th>
                      <th className="p-3 border-b border-blue-900/60 print:border-black font-semibold w-1/5">
                        Responsável/Cargo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-800 print:divide-black">
                    {formData.phases.map((phase, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80 print:bg-white'}>
                        <td className="p-3 font-semibold text-slate-900 border-r border-slate-300 print:border-black align-top">
                          {phase.stage}
                        </td>
                        <td className="p-3 text-slate-700 border-r border-slate-300 print:border-black align-top leading-normal">
                          {phase.description}
                        </td>
                        <td className="p-3 text-slate-700 border-r border-slate-300 print:border-black align-top font-medium">
                          {phase.estimatedDeadline}
                        </td>
                        <td className="p-3 text-slate-700 align-top font-medium">
                          {phase.responsibleRole}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-full h-px bg-slate-300 mt-4" />
            </div>

            {/* Section 6: RECURSOS NECESSÁRIOS */}
            <div className="mb-8 space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900">
                6. RECURSOS NECESSÁRIOS
              </h2>
              <div className="text-sm font-sans space-y-3 text-slate-800 pl-2">
                <div>
                  <strong className="font-semibold text-slate-950">• Recursos humanos:</strong>
                  <div className="text-xs text-slate-700 mt-0.5 whitespace-pre-line pl-4">
                    {formData.humanResources}
                  </div>
                </div>
                <div>
                  <strong className="font-semibold text-slate-950">• Recursos materiais/tecnológicos:</strong>
                  <div className="text-xs text-slate-700 mt-0.5 whitespace-pre-line pl-4">
                    {formData.materialTechResources}
                  </div>
                </div>
                <div>
                  <strong className="font-semibold text-slate-950">• Acesso a dados/documentos da empresa:</strong>
                  <div className="text-xs text-slate-700 mt-0.5 whitespace-pre-line pl-4">
                    {formData.dataAccessDocuments}
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-slate-300 mt-4" />
            </div>

            {/* Section 7: INDICADORES DE SUCESSO */}
            <div className="mb-8 space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900">
                7. INDICADORES DE SUCESSO
              </h2>
              <div className="text-sm text-slate-800 font-sans space-y-2 pl-2">
                {formData.successIndicators.map((ind, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-900 font-bold">•</span>
                    <p className="leading-relaxed">{ind}</p>
                  </div>
                ))}
              </div>
              <div className="w-full h-px bg-slate-300 mt-4" />
            </div>

            {/* Section 8: OBSERVAÇÕES GERAIS */}
            <div className="mb-10 space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900">
                8. OBSERVAÇÕES GERAIS
              </h2>
              <div className="text-sm font-sans text-slate-800 whitespace-pre-line leading-relaxed text-justify bg-slate-50/50 p-4 rounded border border-slate-200 print:bg-transparent print:p-0 print:border-none">
                {formData.generalObservations}
              </div>
            </div>

            {/* Signatures Footer */}
            <div className="pt-10 border-t border-slate-300 mt-8 font-sans grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
              <div>
                <div className="w-48 mx-auto border-b border-slate-800 mb-2" />
                <p className="font-bold text-slate-950">{formData.consultants.split(',')[0] || 'Consultor Responsável'}</p>
                <p className="text-slate-600">Consultor Líder</p>
              </div>
              <div>
                <div className="w-48 mx-auto border-b border-slate-800 mb-2" />
                <p className="font-bold text-slate-950">{formData.clientContactPerson || formData.clientName}</p>
                <p className="text-slate-600">{formData.clientRole || 'Representante Legal da Empresa'}</p>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: EDITING FORM (Allows custom fine-tuning of every section)          */
        /* ========================================================================= */
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            
            {/* Header Info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  Edição do Plano de Consultoria
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Edite ou complemente as seções do plano. As alterações serão salvas para este projeto.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncWithTools}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Restaurar Auto-Preenchimento
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Alterações
                </button>
              </div>
            </div>

            {/* 1. IDENTIFICAÇÃO */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> 1. IDENTIFICAÇÃO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Empresa / Cliente</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Consultor(es) Responsável(is)</label>
                  <input
                    type="text"
                    value={formData.consultants}
                    onChange={(e) => setFormData({ ...formData, consultants: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data de Elaboração</label>
                  <input
                    type="date"
                    value={formData.elaborationDate}
                    onChange={(e) => setFormData({ ...formData, elaborationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. DESCRIÇÃO DO PROBLEMA OU OPORTUNIDADE */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" /> 2. DESCRIÇÃO DO PROBLEMA OU OPORTUNIDADE
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Situação motivadora & Contexto do problema enfrentado
                </label>
                <textarea
                  rows={3}
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Como o problema foi percebido (evidências, dores, indicadores)
                </label>
                <textarea
                  rows={2}
                  value={formData.problemPerceptionContext || ''}
                  onChange={(e) => setFormData({ ...formData, problemPerceptionContext: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* 3. OBJETIVOS DO TRABALHO */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> 3. OBJETIVOS DO TRABALHO
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      objectives: [...formData.objectives, `Objetivo ${formData.objectives.length + 1}: Novo objetivo`],
                    })
                  }
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  + Adicionar Objetivo
                </button>
              </div>
              <div className="space-y-2">
                {formData.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const newObjs = [...formData.objectives];
                        newObjs[idx] = e.target.value;
                        setFormData({ ...formData, objectives: newObjs });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newObjs = formData.objectives.filter((_, i) => i !== idx);
                        setFormData({ ...formData, objectives: newObjs });
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs"
                      title="Excluir objetivo"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. METODOLOGIAS E FERRAMENTAS */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> 4. METODOLOGIAS E FERRAMENTAS
              </h3>
              <textarea
                rows={4}
                value={formData.methodologiesAndTools}
                onChange={(e) => setFormData({ ...formData, methodologiesAndTools: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* 5. CRONOGRAMA DAS FASES DO PROCESSO */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> 5. CRONOGRAMA DAS FASES DO PROCESSO
              </h3>
              <div className="space-y-3">
                {formData.phases.map((phase, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Etapa</label>
                      <input
                        type="text"
                        value={phase.stage}
                        onChange={(e) => {
                          const newPhases = [...formData.phases];
                          newPhases[idx].stage = e.target.value;
                          setFormData({ ...formData, phases: newPhases });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Descrição</label>
                      <input
                        type="text"
                        value={phase.description}
                        onChange={(e) => {
                          const newPhases = [...formData.phases];
                          newPhases[idx].description = e.target.value;
                          setFormData({ ...formData, phases: newPhases });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Prazo</label>
                        <input
                          type="text"
                          value={phase.estimatedDeadline}
                          onChange={(e) => {
                            const newPhases = [...formData.phases];
                            newPhases[idx].estimatedDeadline = e.target.value;
                            setFormData({ ...formData, phases: newPhases });
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Responsável</label>
                        <input
                          type="text"
                          value={phase.responsibleRole}
                          onChange={(e) => {
                            const newPhases = [...formData.phases];
                            newPhases[idx].responsibleRole = e.target.value;
                            setFormData({ ...formData, phases: newPhases });
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. RECURSOS NECESSÁRIOS */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users2 className="w-4 h-4" /> 6. RECURSOS NECESSÁRIOS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Recursos Humanos</label>
                  <textarea
                    rows={3}
                    value={formData.humanResources}
                    onChange={(e) => setFormData({ ...formData, humanResources: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Recursos Materiais / Tecnológicos</label>
                  <textarea
                    rows={3}
                    value={formData.materialTechResources}
                    onChange={(e) => setFormData({ ...formData, materialTechResources: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Acesso a Dados / Documentos</label>
                  <textarea
                    rows={3}
                    value={formData.dataAccessDocuments}
                    onChange={(e) => setFormData({ ...formData, dataAccessDocuments: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 7. INDICADORES DE SUCESSO */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 7. INDICADORES DE SUCESSO
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      successIndicators: [...formData.successIndicators, `Indicador ${formData.successIndicators.length + 1}: Nova meta mensurável`],
                    })
                  }
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  + Adicionar Indicador
                </button>
              </div>
              <div className="space-y-2">
                {formData.successIndicators.map((ind, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ind}
                      onChange={(e) => {
                        const newInds = [...formData.successIndicators];
                        newInds[idx] = e.target.value;
                        setFormData({ ...formData, successIndicators: newInds });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newInds = formData.successIndicators.filter((_, i) => i !== idx);
                        setFormData({ ...formData, successIndicators: newInds });
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs"
                      title="Excluir indicador"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. OBSERVAÇÕES GERAIS */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> 8. OBSERVAÇÕES GERAIS
              </h3>
              <textarea
                rows={4}
                value={formData.generalObservations}
                onChange={(e) => setFormData({ ...formData, generalObservations: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar Plano de Consultoria
              </button>
            </div>

          </div>
        </form>
      )}
    </div>
  );
};
