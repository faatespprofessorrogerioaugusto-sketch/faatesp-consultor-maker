import React, { useState, useRef, useEffect } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  User,
  Shield,
  X,
  Users,
  LogOut,
  Sparkles,
  RefreshCw,
  Building2,
  Trash2,
} from 'lucide-react';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { StatusBadge } from '../common/Badge';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    projects,
    setActiveModule,
    notifications,
    settings,
    currentUser,
    currentGroup,
    availableGroups,
    switchGroup,
    logout,
    cleanCurrentGroupData,
  } = useConsulting();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);

  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target as Node)) {
        setIsGroupMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        id="main-app-header"
        className="sticky top-0 z-30 h-16 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-sm text-slate-100"
      >
        {/* Left: Mobile Menu + Project Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Project Selector Dropdown */}
          <div ref={projectDropdownRef} className="relative">
            <button
              id="header-project-selector-dropdown-btn"
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 transition-all text-left max-w-[280px] sm:max-w-xs md:max-w-sm"
            >
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-blue-400 block leading-tight">
                  Projeto Ativo
                </span>
                <span className="text-xs font-bold text-slate-100 truncate block">
                  {currentProject?.name || 'Selecione um projeto'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isProjectDropdownOpen && (
              <div
                id="header-project-selector-menu"
                className="absolute left-0 top-full mt-1.5 w-80 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Projetos de Consultoria ({projects.length})
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                  {projects.map((proj) => {
                    const isSelected = proj.id === currentProjectId;
                    return (
                      <button
                        key={proj.id}
                        id={`select-project-item-${proj.id}`}
                        onClick={() => {
                          setCurrentProjectId(proj.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate text-slate-100">{proj.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{proj.clientName}</p>
                        </div>
                        <StatusBadge status={proj.status} size="sm" />
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-800">
                  <button
                    id="header-new-project-quick-btn"
                    onClick={() => {
                      setActiveModule('projects');
                      setIsProjectDropdownOpen(false);
                    }}
                    className="w-full py-2 px-3 text-xs font-medium text-blue-400 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Gerenciar ou Criar Novo Projeto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Group Badge + Global Search + Notifications + Quick Actions + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Global Search */}
          <button
            id="open-global-search-btn"
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
            title="Buscar em todo o projeto (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Buscar no projeto...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] text-slate-300 bg-slate-700 rounded border border-slate-600 font-mono">
              /
            </kbd>
          </button>

          {/* Active Group Notification Badge (Right next to search bar) */}
          <div ref={groupMenuRef} className="relative">
            <button
              id="header-active-group-badge-btn"
              onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-950/50 hover:bg-blue-900/60 text-blue-200 transition-all cursor-pointer shadow-sm group"
              title="Grupo de trabalho ativo (Clique para gerenciar ou alternar)"
            >
              <div className="relative flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse ring-1 ring-slate-900" />
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-blue-400 block leading-none">
                  Grupo Ativo
                </span>
                <span className="text-xs font-bold text-white max-w-[110px] sm:max-w-[160px] truncate block leading-tight">
                  {currentGroup || 'Grupo Principal'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </button>

            {isGroupMenuOpen && (
              <div
                id="header-active-group-dropdown-menu"
                className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-200"
              >
                <div className="pb-2.5 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      Ambiente de Grupo
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Isolamento Ativo
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 truncate">{currentGroup}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Logado como: <strong className="text-slate-300">{currentUser?.email}</strong>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                    Alternar para outro Grupo:
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1 py-0.5">
                    {availableGroups.map((grp) => {
                      const isCurrent = grp === currentGroup;
                      return (
                        <button
                          key={grp}
                          id={`switch-to-group-${grp.replace(/\s+/g, '-').toLowerCase()}`}
                          onClick={() => {
                            switchGroup(grp);
                            setIsGroupMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="truncate">{grp}</span>
                          {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-800 space-y-1">
                  <button
                    id="header-clean-group-btn"
                    onClick={() => {
                      if (window.confirm(`Deseja reiniciar e limpar o ambiente do grupo "${currentGroup}" para começar do zero?`)) {
                        cleanCurrentGroupData();
                        setIsGroupMenuOpen(false);
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-amber-950/40 border border-transparent hover:border-amber-800/40 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Limpar & Iniciar App Limpo para este Grupo</span>
                  </button>

                  <button
                    id="header-logout-btn"
                    onClick={() => {
                      logout();
                      setIsGroupMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Encerrar Sessão / Trocar de Usuário</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div ref={notificationRef} className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Notificações e Alertas"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>

            {isNotificationOpen && (
              <div
                id="header-notifications-dropdown"
                className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-300" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Alertas do Projeto ({notifications.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 py-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                      <p className="text-xs font-medium text-slate-300">Nenhum alerta crítico ativo</p>
                      <p className="text-[11px] text-slate-500">Ações e prazos em dia no projeto!</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        id={`notification-item-${notif.id}`}
                        onClick={() => {
                          setActiveModule(notif.targetModule);
                          setIsNotificationOpen(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-800/70 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <div
                          className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                            notif.type === 'critical'
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                              : notif.type === 'warning'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                              : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                          }`}
                        >
                          {notif.type === 'critical' || notif.type === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-100">{notif.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              id="header-user-profile-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {currentUser?.name?.charAt(0).toUpperCase() || settings.consultantDefaultName.charAt(0) || 'C'}
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-xs font-semibold text-slate-200 block leading-tight">
                  {currentUser?.name || settings.consultantDefaultName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[90px]">
                  {currentGroup || 'Consultor'}
                </span>
              </div>
            </button>

            {isProfileOpen && (
              <div
                id="header-user-profile-menu"
                className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-slate-100">{currentUser?.email || settings.consultantDefaultName}</p>
                  <p className="text-[11px] text-blue-400 font-medium">{currentGroup}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveModule('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Perfil e Configurações
                  </button>
                  <button
                    onClick={() => {
                      setActiveModule('reports');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    Gerar Relatório do Projeto
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-800/80 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Encerrar Sessão
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};

