import React from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { ModuleId } from '../../types';
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  Grid2X2,
  CalendarRange,
  CheckSquare2,
  ShieldAlert,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Layers,
  HeartHandshake,
  Target,
  FileSignature,
  Presentation,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const {
    activeModule,
    setActiveModule,
    currentProject,
    currentProjectSwot,
    currentProjectTasks,
    currentProjectActions,
    currentProjectRisks,
    currentProjectClimateSurveys,
    currentProjectOkrs,
    settings,
  } = useConsulting();

  interface NavGroup {
    title: string;
    items: Array<{
      id: ModuleId;
      label: string;
      icon: React.ReactNode;
      badgeCount?: number;
      badgeColor?: string;
    }>;
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Gestão & Projetos',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'projects',
          label: 'Projetos de consultoria',
          icon: <FolderKanban className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'CLIENTES',
      items: [
        {
          id: 'clients',
          label: 'Cadastro de Clientes',
          icon: <Users2 className="w-4 h-4" />,
        },
        {
          id: 'contract',
          label: 'Contrato de Prestação de Serviços',
          icon: <FileSignature className="w-4 h-4" />,
        },
        {
          id: 'meeting',
          label: 'Simulador de Reunião',
          icon: <Presentation className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'FERRAMENTAS DE DIAGNÓSTICOS',
      items: [
        {
          id: 'swot',
          label: 'Análise SWOT',
          icon: <Grid2X2 className="w-4 h-4" />,
          badgeCount: currentProjectSwot.length,
        },
        {
          id: 'pareto',
          label: 'Diagrama de Pareto',
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          id: 'risks',
          label: 'Matriz de Riscos',
          icon: <ShieldAlert className="w-4 h-4" />,
          badgeCount: currentProjectRisks.filter((r) => r.classification === 'Crítico' || r.classification === 'Alto').length,
          badgeColor: 'bg-rose-500 text-white',
        },
      ],
    },
    {
      title: 'FERRAMENTAS DE PLANEJAMENTO',
      items: [
        {
          id: 'gantt',
          label: 'Diagrama de Gantt',
          icon: <CalendarRange className="w-4 h-4" />,
          badgeCount: currentProjectTasks.length,
        },
        {
          id: 'okrs',
          label: 'OKR',
          icon: <Target className="w-4 h-4" />,
          badgeCount: currentProjectOkrs.length,
        },
        {
          id: '5w2h',
          label: 'Plano de Ação (5W2H)',
          icon: <CheckSquare2 className="w-4 h-4" />,
          badgeCount: currentProjectActions.filter((a) => a.status !== 'Concluída').length,
          badgeColor: 'bg-amber-500 text-white',
        },
      ],
    },
    {
      title: 'CULTURA ORGANIZACIONAL',
      items: [
        {
          id: 'climate',
          label: 'Pesquisa de Clima',
          icon: <HeartHandshake className="w-4 h-4" />,
          badgeCount: currentProjectClimateSurveys.length,
        },
      ],
    },
    {
      title: 'Consolidação & Ajustes',
      items: [
        {
          id: 'reports',
          label: 'Relatórios Executivos',
          icon: <FileSpreadsheet className="w-4 h-4" />,
        },
        {
          id: 'settings',
          label: 'Configurações',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  const handleSelectModule = (id: ModuleId) => {
    setActiveModule(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#020617] text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 shrink-0 bg-[#020617]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
              C
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-white text-base tracking-tight truncate block">
                  CONSULTOR<span className="text-blue-500"> PRIME</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate block">
                  O CANIVETE SUIÇO DO CONSULTOR
                </span>
              </div>
            )}
          </div>

          <button
            id="toggle-sidebar-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Project Pill in Sidebar */}
        {!isCollapsed && currentProject && (
          <div className="px-3 pt-3 pb-1">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Projeto Selecionado
                </p>
                <p className="text-xs font-semibold text-slate-100 truncate mt-0.5">
                  {currentProject.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{currentProject.clientName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pt-1 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </span>
                </div>
              ) : (
                gIdx > 0 && <div className="my-2 border-t border-slate-800/80" />
              )}

              {group.items.map((item) => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleSelectModule(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/60'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`shrink-0 ${
                        isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badgeCount !== undefined && item.badgeCount > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-blue-600/40 text-blue-300 border border-blue-500/40'
                                : item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.badgeCount}
                          </span>
                        )}
                      </>
                    )}

                    {isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="p-3.5 border-t border-slate-800 bg-[#020617] text-slate-400 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                {settings.consultantDefaultName.charAt(0) || 'C'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {settings.consultantDefaultName.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-500 truncate">Sênior Partner</p>
              </div>
            </div>
            <span className="text-slate-600 font-mono text-[10px]">v2.4 Pro</span>
          </div>
        )}
      </aside>
    </>
  );
};
