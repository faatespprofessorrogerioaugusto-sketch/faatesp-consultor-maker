import React, { useState, useMemo } from 'react';
import {
  useConsulting,
  loadDataForGroup,
  isProfessorGroup,
  isProfessorEmail,
  PROFESSOR_AUTHORIZED_EMAIL,
} from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { Project, ProjectStatus, PriorityLevel } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Search,
  FolderKanban,
  Copy,
  Archive,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  User,
  Users,
  CheckCircle2,
  ArrowRight,
  Filter,
  GraduationCap,
  Building2,
  ExternalLink,
  ShieldCheck,
  Eye,
} from 'lucide-react';

// Format date to Brazilian standard (dd/mm/aaaa)
const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return dateStr;
};

interface ProjectWithGroup extends Project {
  sourceGroup: string;
}

export const ProjectsView: React.FC = () => {
  const {
    projects,
    clients,
    currentProjectId,
    setCurrentProjectId,
    addProject,
    updateProject,
    duplicateProject,
    archiveProject,
    deleteProject,
    setActiveModule,
    settings,
    currentUser,
    currentGroup,
    availableGroups,
    switchGroup,
  } = useConsulting();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Check if current user is Professor
  const isProfessor =
    isProfessorGroup(currentGroup) || isProfessorEmail(currentUser?.email || '');

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    clientId: string;
    clientName: string;
    segment: string;
    description: string;
    mainObjective: string;
    leadConsultant: string;
    team: string;
    startDate: string;
    expectedEndDate: string;
    status: ProjectStatus;
    priority: PriorityLevel;
    budget: number;
    notes: string;
  }>({
    name: '',
    clientId: '',
    clientName: '',
    segment: '',
    description: '',
    mainObjective: '',
    leadConsultant: settings.consultantDefaultName || '',
    team: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    status: 'Planejamento',
    priority: 'Média',
    budget: 0,
    notes: '',
  });

  // Delete Confirm Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      segment: clients[0]?.segment || 'Geral',
      description: '',
      mainObjective: '',
      leadConsultant: settings.consultantDefaultName || '',
      team: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '',
      status: 'Planejamento',
      priority: 'Média',
      budget: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      clientId: proj.clientId,
      clientName: proj.clientName,
      segment: proj.segment,
      description: proj.description,
      mainObjective: proj.mainObjective,
      leadConsultant: proj.leadConsultant,
      team: proj.team.join(', '),
      startDate: proj.startDate,
      expectedEndDate: proj.expectedEndDate,
      status: proj.status,
      priority: proj.priority,
      budget: proj.budget || 0,
      notes: proj.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleClientChange = (clientId: string) => {
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        clientId: found.id,
        clientName: found.name,
        segment: found.segment || prev.segment,
      }));
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const teamArray = formData.team
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject) {
      updateProject(editingProject.id, {
        name: formData.name,
        clientId: formData.clientId,
        clientName: formData.clientName,
        segment: formData.segment,
        description: formData.description,
        mainObjective: formData.mainObjective,
        leadConsultant: formData.leadConsultant,
        team: teamArray,
        startDate: formData.startDate,
        expectedEndDate: formData.expectedEndDate,
        status: formData.status,
        priority: formData.priority,
        budget: Number(formData.budget),
        notes: formData.notes,
      });
    } else {
      addProject({
        name: formData.name,
        clientId: formData.clientId,
        clientName: formData.clientName,
        segment: formData.segment,
        description: formData.description,
        mainObjective: formData.mainObjective,
        leadConsultant: formData.leadConsultant,
        team: teamArray,
        startDate: formData.startDate,
        expectedEndDate: formData.expectedEndDate,
        status: formData.status,
        priority: formData.priority,
        budget: Number(formData.budget),
        notes: formData.notes,
        isArchived: false,
      });
    }

    setIsModalOpen(false);
  };

  // Aggregated Projects List:
  // - Students (Groups 1-5) only see their own projects.
  // - Professor sees their own projects + projects aggregated from Groups 01-05.
  const allVisibleProjects: ProjectWithGroup[] = useMemo(() => {
    if (!isProfessor) {
      return projects.map((p) => ({ ...p, sourceGroup: currentGroup || 'Meu Grupo' }));
    }

    const aggregated: ProjectWithGroup[] = [];
    const seenMap = new Set<string>();

    // 1. Projects in current active state
    projects.forEach((p) => {
      aggregated.push({ ...p, sourceGroup: currentGroup || 'Professor' });
      seenMap.add(`${currentGroup}_${p.id}`);
    });

    // 2. Aggregate projects from all other registered groups (Groups 01 to 05, etc.)
    availableGroups.forEach((grp) => {
      if (grp === currentGroup) return;
      try {
        const grpData = loadDataForGroup(grp);
        if (grpData.projects && grpData.projects.length > 0) {
          grpData.projects.forEach((p) => {
            const key = `${grp}_${p.id}`;
            if (!seenMap.has(key)) {
              seenMap.add(key);
              aggregated.push({ ...p, sourceGroup: grp });
            }
          });
        }
      } catch (e) {
        console.error(`Error loading projects for group ${grp}:`, e);
      }
    });

    return aggregated;
  }, [isProfessor, projects, currentGroup, availableGroups]);

  const filteredProjects = allVisibleProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.segment.toLowerCase().includes(search.toLowerCase()) ||
      p.leadConsultant.toLowerCase().includes(search.toLowerCase()) ||
      p.sourceGroup.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesArchived = showArchived ? true : !p.isArchived;
    const matchesGroup =
      !isProfessor ||
      selectedGroupFilter === 'all' ||
      p.sourceGroup.toLowerCase() === selectedGroupFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesArchived && matchesGroup;
  });

  const getGroupBadgeStyle = (grp: string) => {
    if (isProfessorGroup(grp)) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    if (grp.includes('01') || grp.includes('1')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
    if (grp.includes('02') || grp.includes('2')) {
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
    if (grp.includes('03') || grp.includes('3')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    if (grp.includes('04') || grp.includes('4')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (grp.includes('05') || grp.includes('5')) {
      return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    }
    return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
  };

  const handleInspectGroupProject = (proj: ProjectWithGroup) => {
    if (proj.sourceGroup !== currentGroup) {
      switchGroup(proj.sourceGroup);
    }
    setCurrentProjectId(proj.id);
    setActiveModule('dashboard');
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Projetos de Consultoria"
        subtitle="Cadastre e gerencie projetos com dados e ferramentas isoladas por ProjetoID"
        actions={
          <button
            id="create-project-top-btn"
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        }
      />

      {/* Professor Supervisory Banner */}
      {isProfessor && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-blue-950/40 border border-amber-500/30 text-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                  Painel de Supervisão & Mentoria Docente
                </h4>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Acesso Multi-Grupos (1 a 5)
                </span>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Isolamento dos Alunos Preservado
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Você pode visualizar todos os projetos das empresas dos <strong>Grupos 01 a 05</strong> de forma integrada.
                Os alunos de cada grupo só visualizam estritamente os seus próprios cards e projetos.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-300 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 shrink-0 shadow-sm flex md:flex-col items-center md:items-end justify-between w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Consolidado</span>
            <span className="font-bold text-amber-300 text-sm">
              {allVisibleProjects.length} {allVisibleProjects.length === 1 ? 'projeto' : 'projetos'}
            </span>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3 text-slate-100">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-projects-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, cliente, grupo ou consultor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
          {/* Group Filter (Professor only) */}
          {isProfessor && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Grupo:</span>
              <select
                id="filter-projects-group-select"
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="text-xs bg-slate-800 border border-amber-500/40 text-amber-200 font-semibold rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">🏢 Todos os Grupos ({allVisibleProjects.length})</option>
                {availableGroups.map((grp) => {
                  const grpProjectsCount = allVisibleProjects.filter(
                    (p) => p.sourceGroup.toLowerCase() === grp.toLowerCase()
                  ).length;
                  const isProfGrp = isProfessorGroup(grp);
                  return (
                    <option key={grp} value={grp} className="bg-slate-900 text-slate-200">
                      {isProfGrp ? `👑 ${grp} (Docente)` : `🏢 ${grp}`} ({grpProjectsCount})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              id="filter-projects-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-2 py-1 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="Planejamento">Planejamento</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Em revisão">Em revisão</option>
              <option value="Concluído">Concluído</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <span>Exibir arquivados</span>
          </label>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Nenhum projeto encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {search || statusFilter !== 'all' || selectedGroupFilter !== 'all'
              ? 'Tente alterar seus filtros de pesquisa ou grupo selecionado.'
              : 'Clique em "Novo Projeto" para cadastrar o primeiro projeto de consultoria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isFromCurrentGroup = project.sourceGroup === currentGroup;
            const isSelected = isFromCurrentGroup && project.id === currentProjectId;

            return (
              <div
                key={`${project.sourceGroup}_${project.id}`}
                id={`project-card-${project.id}`}
                className={`bg-slate-900 rounded-xl border transition-all flex flex-col justify-between overflow-hidden relative group ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                    : isFromCurrentGroup
                    ? 'border-slate-800 hover:border-slate-700 shadow-sm'
                    : 'border-slate-800/90 hover:border-blue-500/40 shadow-sm bg-slate-900/95'
                } ${project.isArchived ? 'opacity-60 bg-slate-950' : ''}`}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {project.segment}
                      </span>
                      {/* Group badge (highlighted for professor view) */}
                      {isProfessor && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${getGroupBadgeStyle(
                            project.sourceGroup
                          )}`}
                          title={`Projeto pertencente ao ${project.sourceGroup}`}
                        >
                          {isProfessorGroup(project.sourceGroup) ? (
                            <GraduationCap className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Building2 className="w-3 h-3" />
                          )}
                          <span>{project.sourceGroup}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={project.priority} size="sm" />
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 line-clamp-2 leading-snug">
                    {project.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-400 mt-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {project.clientName}
                  </p>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {project.description || project.mainObjective}
                  </p>

                  {/* Meta details */}
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Consultor:
                      </span>
                      <span className="font-medium text-slate-200 truncate max-w-[150px]">
                        {project.leadConsultant}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Período:
                      </span>
                      <span className="font-medium text-slate-200">
                        {formatDateBR(project.startDate)} a {project.expectedEndDate ? formatDateBR(project.expectedEndDate) : 'Em aberto'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Equipe:
                      </span>
                      <span className="font-medium text-slate-200 truncate max-w-[160px]">
                        {project.sourceGroup || currentGroup}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
                  {isFromCurrentGroup ? (
                    <button
                      id={`select-project-btn-${project.id}`}
                      onClick={() => {
                        setCurrentProjectId(project.id);
                        setActiveModule('dashboard');
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Projeto Ativo
                        </>
                      ) : (
                        <>
                          Selecionar
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      id={`inspect-group-project-btn-${project.id}`}
                      onClick={() => handleInspectGroupProject(project)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 shadow-xs"
                      title={`Alternar para o ${project.sourceGroup} e abrir este projeto`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Examinar no {project.sourceGroup}</span>
                    </button>
                  )}

                  {isFromCurrentGroup ? (
                    <div className="flex items-center gap-1">
                      <button
                        id={`edit-project-btn-${project.id}`}
                        onClick={() => openEditModal(project)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        title="Editar projeto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`duplicate-project-btn-${project.id}`}
                        onClick={() => duplicateProject(project.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        title="Duplicar projeto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`archive-project-btn-${project.id}`}
                        onClick={() => archiveProject(project.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        title={project.isArchived ? 'Desarquivar' : 'Arquivar'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`delete-project-btn-${project.id}`}
                        onClick={() => setDeleteConfirmId(project.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        title="Excluir projeto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Ambiente {project.sourceGroup}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create/Edit Project */}
      {isModalOpen && (
        <div
          id="project-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            id="project-form-modal-card"
            className="w-full max-w-2xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-400" />
                {editingProject ? 'Editar Projeto de Consultoria' : 'Novo Projeto de Consultoria'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome do Projeto <span className="text-rose-400">*</span>
                </label>
                <input
                  id="project-form-name-input"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Transformação Digital & Operações Lean"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:bg-slate-750 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Client and Segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Cliente / Organização <span className="text-rose-400">*</span>
                  </label>
                  {clients.length > 0 ? (
                    <select
                      id="project-form-client-select"
                      value={formData.clientId}
                      onChange={(e) => handleClientChange(e.target.value)}
                      className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value, clientId: 'client-custom' })
                      }
                      placeholder="Nome do cliente"
                      className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Segmento de Atuação
                  </label>
                  <input
                    type="text"
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    placeholder="Ex: Varejo, Saúde, Tecnologia, Indústria"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Main Objective */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Objetivo Principal do Projeto <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.mainObjective}
                  onChange={(e) => setFormData({ ...formData, mainObjective: e.target.value })}
                  placeholder="Ex: Otimizar tempo de ciclo em 30% e implantar esteira ágil até Q3."
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição e Escopo
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais sobre o escopo acordado e entregáveis."
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Lead Consultant & Team */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Consultor Responsável <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.leadConsultant}
                    onChange={(e) => setFormData({ ...formData, leadConsultant: e.target.value })}
                    placeholder="Nome do consultor líder"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Equipe Envolvida (separar por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="Ex: Ana Silva, Bruno Souza, Carlos Lima"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Dates & Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                    Término Previsto
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedEndDate}
                    onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Planejamento">Planejamento</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Em revisão">Em revisão</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Cancelado">Cancelado</option>
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

              {/* Observations & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Orçamento / Honorários ({settings.currency})
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Observações Gerais
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas internas ou observações de contrato"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Form Footer */}
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
                  {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteProject(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Excluir Projeto de Consultoria?"
        message="Esta ação é definitiva e removerá todos os dados deste projeto (SWOT, Gantt, Ishikawa, 5W2H, Riscos, etc.). Deseja continuar?"
        confirmText="Sim, Excluir Projeto"
        isDestructive={true}
      />
    </div>
  );
};
