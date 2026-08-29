import React from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { ModuleId } from '../../types';
import { ChevronRight, Home, Layers } from 'lucide-react';

interface BreadcrumbsProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const moduleNames: Record<ModuleId, string> = {
  dashboard: 'Dashboard Geral',
  projects: 'Projetos de Consultoria',
  clients: 'Clientes e Contatos',
  contract: 'Contrato de Prestação de Serviço',
  meeting: 'Simulação de Reunião',
  bsc: 'Balanced Scorecard (BSC)',
  swot: 'Análise SWOT',
  gantt: 'Diagrama de Gantt',
  actions5w2h: 'Plano de Ação 5W2H',
  '5w2h': 'Plano de Ação 5W2H',
  risks: 'Matriz de Riscos',
  pareto: 'Análise de Pareto',
  climate: 'Pesquisa de Clima',
  reports: 'Relatórios do Projeto',
  settings: 'Configurações',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title, subtitle, actions }) => {
  const { activeModule, setActiveModule, currentProject } = useConsulting();

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        {/* Breadcrumbs navigation trail */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveModule('dashboard')}
            className="hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Início</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          {currentProject && (
            <>
              <button
                onClick={() => setActiveModule('projects')}
                className="hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer truncate max-w-[150px] sm:max-w-xs"
                title={currentProject.name}
              >
                <Layers className="w-3 h-3 text-slate-500" />
                <span className="truncate">{currentProject.name}</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </>
          )}

          <span className="font-semibold text-slate-200">
            {moduleNames[activeModule] || title}
          </span>
        </nav>

        {/* Page Title & Subtitle */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight font-heading">
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Action Buttons Toolbar */}
      {actions && (
        <div className="flex items-center flex-wrap gap-2.5 shrink-0 no-print">
          {actions}
        </div>
      )}
    </div>
  );
};
