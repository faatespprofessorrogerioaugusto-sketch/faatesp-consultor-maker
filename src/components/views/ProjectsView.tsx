import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
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
} from 'lucide-react';

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
  } = useConsulting();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.segment.toLowerCase().includes(search.toLowerCase()) ||
      p.leadConsultant.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesArchived = showArchived ? true : !p.isArchived;

    return matchesSearch && matchesStatus && matchesArchived;
  });

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

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-100">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-projects-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, cliente ou consultor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const isSelected = project.id === currentProjectId;
          return (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              className={`bg-slate-900 rounded-xl border transition-all flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700 shadow-sm'
              } ${project.isArchived ? 'opacity-60 bg-slate-950' : ''}`}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {project.segment}
                  </span>
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
                      {project.startDate} a {project.expectedEndDate || 'Em aberto'}
                    </span>
                  </div>

                  {project.team && project.team.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Equipe:
                      </span>
                      <span className="font-medium text-slate-200 truncate max-w-[150px]">
                        {project.team.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
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
              </div>
            </div>
          );
        })}
      </div>

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
