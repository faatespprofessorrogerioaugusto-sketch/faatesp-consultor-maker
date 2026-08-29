import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { ModuleId } from '../../types';
import {
  Search,
  X,
  Layers,
  Calendar,
  CheckSquare,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Briefcase,
  GitBranch,
  HeartHandshake,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    currentProjectSwot,
    currentProjectTasks,
    currentProjectActions,
    currentProjectRisks,
    currentProjectPareto,
    currentProjectClimateSurveys,
    currentProject,
    setActiveModule,
  } = useConsulting();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      module: ModuleId;
      moduleName: string;
      icon: React.ReactNode;
    }> = [];

    // SWOT
    currentProjectSwot.forEach((s) => {
      if (s.factor.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          title: s.factor,
          subtitle: `SWOT (${s.category}) • Impacto: ${s.impact}/5`,
          module: 'swot',
          moduleName: 'Análise SWOT',
          icon: <Layers className="w-4 h-4 text-blue-600" />,
        });
      }
    });

    // Gantt
    currentProjectTasks.forEach((t) => {
      if (t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))) {
        results.push({
          id: t.id,
          title: t.name,
          subtitle: `Cronograma Gantt (${t.stage}) • ${t.status}`,
          module: 'gantt',
          moduleName: 'Diagrama de Gantt',
          icon: <Calendar className="w-4 h-4 text-indigo-600" />,
        });
      }
    });

    // 5W2H
    currentProjectActions.forEach((a) => {
      if (
        a.what.toLowerCase().includes(q) ||
        a.why.toLowerCase().includes(q) ||
        a.who.toLowerCase().includes(q)
      ) {
        results.push({
          id: a.id,
          title: a.what,
          subtitle: `5W2H • Responsável: ${a.who} • Prazo: ${a.when}`,
          module: '5w2h',
          moduleName: 'Plano de Ação 5W2H',
          icon: <CheckSquare className="w-4 h-4 text-emerald-600" />,
        });
      }
    });

    // Risks
    currentProjectRisks.forEach((r) => {
      if (
        r.risk.toLowerCase().includes(q) ||
        r.cause.toLowerCase().includes(q) ||
        r.consequence.toLowerCase().includes(q)
      ) {
        results.push({
          id: r.id,
          title: r.risk,
          subtitle: `Matriz de Riscos • Nível: ${r.riskScore} (${r.classification})`,
          module: 'risks',
          moduleName: 'Matriz de Riscos',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
        });
      }
    });

    // Pareto
    currentProjectPareto.forEach((p) => {
      if (p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          title: p.category,
          subtitle: `Pareto • Ocorrências: ${p.count} • ${p.period}`,
          module: 'pareto',
          moduleName: 'Análise de Pareto',
          icon: <TrendingUp className="w-4 h-4 text-amber-600" />,
        });
      }
    });

    // Pesquisa de Clima & eNPS
    currentProjectClimateSurveys.forEach((clim) => {
      if (
        clim.title.toLowerCase().includes(q) ||
        clim.cycle.toLowerCase().includes(q) ||
        (clim.executiveSummary && clim.executiveSummary.toLowerCase().includes(q))
      ) {
        results.push({
          id: clim.id,
          title: clim.title,
          subtitle: `Pesquisa de Clima (${clim.cycle}) • eNPS: ${clim.enpsScore > 0 ? `+${clim.enpsScore}` : clim.enpsScore} • Favorabilidade: ${clim.overallFavorabilityPercent}%`,
          module: 'climate',
          moduleName: 'Pesquisa de Clima & eNPS',
          icon: <HeartHandshake className="w-4 h-4 text-rose-500" />,
        });
      }
    });

    return results;
  }, [
    query,
    currentProjectSwot,
    currentProjectTasks,
    currentProjectActions,
    currentProjectRisks,
    currentProjectPareto,
    currentProjectClimateSurveys,
  ]);

  if (!isOpen) return null;

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="global-search-card"
        className="w-full max-w-2xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden flex flex-col max-h-[80vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar em "${currentProject?.name || 'Projeto'}" (SWOT, Gantt, Riscos, Ações, OKRs...)`}
            className="w-full text-slate-100 placeholder:text-slate-500 bg-transparent border-none outline-none text-base"
          />
          {query && (
            <button
              id="clear-global-search-query-btn"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-800/80">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-sm font-medium text-slate-300">Digite qualquer palavra-chave para buscar</p>
              <p className="text-xs text-slate-500 mt-1">
                Fatores SWOT, tarefas do cronograma, ações 5W2H, riscos, stakeholders e metas
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-300">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Tente pesquisar por outro termo ou nome de responsável</p>
            </div>
          ) : (
            searchResults.map((res) => (
              <button
                key={`${res.module}-${res.id}`}
                id={`search-result-item-${res.id}`}
                onClick={() => {
                  setActiveModule(res.module);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-800/80 flex items-start gap-3 transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 group-hover:shadow-xs transition-all shrink-0 mt-0.5 border border-slate-700">
                  {res.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                      {res.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-400 shrink-0">{res.moduleName}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{res.subtitle}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>{searchResults.length} resultados encontrados</span>
          <span>Projeto ativo: <strong className="text-slate-200">{currentProject?.name}</strong></span>
        </div>
      </div>
    </div>
  );
};
