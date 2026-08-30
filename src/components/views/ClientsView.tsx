import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { Client } from '../../types';
import { StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Search,
  Users2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Edit2,
  Trash2,
  FolderKanban,
  ArrowRight,
  User,
  Building,
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

export const ClientsView: React.FC = () => {
  const { clients, projects, addClient, updateClient, deleteClient, setCurrentProjectId, setActiveModule } =
    useConsulting();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    contactPerson: '',
    role: '',
    phone: '',
    email: '',
    city: '',
    country: 'Brasil',
    segment: '',
    relationshipOrigin: '',
    relationshipStatus: 'Ativo',
    notes: '',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      contactPerson: '',
      role: '',
      phone: '',
      email: '',
      city: '',
      country: 'Brasil',
      segment: '',
      relationshipOrigin: '',
      relationshipStatus: 'Ativo',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      contactPerson: c.contactPerson,
      role: c.role,
      phone: c.phone,
      email: c.email,
      city: c.city,
      country: c.country,
      segment: c.segment,
      relationshipOrigin: c.relationshipOrigin,
      relationshipStatus: c.relationshipStatus,
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      const newId = addClient(formData);
      setSelectedClientId(newId);
    }
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.segment.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.relationshipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId) || filteredClients[0];

  const clientProjects = selectedClient
    ? projects.filter((p) => p.clientId === selectedClient.id || p.clientName === selectedClient.name)
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Cadastro de Clientes"
        subtitle="Gerenciamento de contas de clientes, contatos-chave e histórico de projetos"
        actions={
          <button
            id="create-client-top-btn"
            onClick={openCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Cliente
          </button>
        }
      />

      {/* Main Grid: Client List (Left) + Detail Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-100">
        {/* Left: Client List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-clients-input"
                type="text"
                name="search_clients_filter_field"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente, contato ou cidade..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg placeholder:text-slate-500 focus:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>{filteredClients.length} organizações</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-0.5"
              >
                <option value="all">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Prospect">Prospect</option>
                <option value="Em Pausa">Em Pausa</option>
                <option value="Encerrado">Encerrado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              const projCount = projects.filter(
                (p) => p.clientId === client.id || p.clientName === client.name
              ).length;

              return (
                <div
                  key={client.id}
                  id={`client-item-${client.id}`}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{client.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {client.contactPerson} ({client.role})
                      </p>
                    </div>
                    <StatusBadge status={client.relationshipStatus} size="sm" />
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{client.segment}</span>
                    <span className="font-semibold text-blue-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {projCount} {projCount === 1 ? 'projeto' : 'projetos'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Client Profile & History */}
        <div className="lg:col-span-7">
          {selectedClient ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden text-slate-100">
              {/* Header */}
              <div className="p-6 bg-slate-950 border-b border-slate-800 text-white flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    {selectedClient.segment || 'Geral'}
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-white">{selectedClient.name}</h3>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {selectedClient.city}, {selectedClient.country}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedClient)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(selectedClient.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Excluir cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details & Contacts */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Contato Principal</p>
                    <p className="text-xs font-bold text-slate-100 mt-1">{selectedClient.contactPerson}</p>
                    <p className="text-xs text-slate-400">{selectedClient.role}</p>
                    <div className="mt-3 space-y-1 text-xs text-slate-300">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {selectedClient.phone || 'Não informado'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {selectedClient.email || 'Não informado'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Origem da Conta</p>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {selectedClient.relationshipOrigin || 'Prospecção / Indicação'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Status do Relacionamento</p>
                      <div className="mt-0.5">
                        <StatusBadge status={selectedClient.relationshipStatus} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Observações</p>
                      <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                        {selectedClient.notes || 'Sem observações registradas.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Associated Projects History */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderKanban className="w-4 h-4 text-blue-400" />
                      Histórico de Projetos Associados ({clientProjects.length})
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {clientProjects.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
                        <p className="text-xs">Nenhum projeto vinculado a este cliente ainda.</p>
                      </div>
                    ) : (
                      clientProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-3 bg-slate-950/60 hover:bg-slate-800/80 rounded-lg border border-slate-800 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-100 truncate">{proj.name}</p>
                            <p className="text-[11px] text-slate-400">
                              Líder: {proj.leadConsultant} • {formatDateBR(proj.startDate)} a {proj.expectedEndDate ? formatDateBR(proj.expectedEndDate) : 'Em aberto'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={proj.status} size="sm" />
                            <button
                              onClick={() => {
                                setCurrentProjectId(proj.id);
                                setActiveModule('dashboard');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              Abrir <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-500">
              <Users2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Selecione um cliente para ver detalhes e histórico</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Client Modal */}
      {isModalOpen && (
        <div
          id="client-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            id="client-form-modal-card"
            className="w-full max-w-xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                {editingClient ? 'Editar Cadastro de Cliente' : 'Novo Cliente / Organização'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveForm}
              autoComplete="off"
              noValidate
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome da Organização / Pessoa <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="client_org_name_unique_field"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Grupo Varejo Brasil S.A."
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nome do Contato Principal <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="client_contact_person_unique_field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Ex: Mariana Drummond"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    name="client_role_unique_field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Ex: Diretora de Operações"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    name="client_phone_unique_field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+55 (11) 98765-4321"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    E-mail
                  </label>
                  <input
                    type="text"
                    name="client_contact_email_unique_field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="client_city_unique_field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    name="client_country_unique_field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Brasil"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Segmento
                  </label>
                  <input
                    type="text"
                    name="client_segment_unique_field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    placeholder="Varejo, Tecnologia..."
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Origem
                  </label>
                  <input
                    type="text"
                    name="client_origin_unique_field"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={formData.relationshipOrigin}
                    onChange={(e) => setFormData({ ...formData, relationshipOrigin: e.target.value })}
                    placeholder="Indicação, Evento..."
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.relationshipStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        relationshipStatus: e.target.value as Client['relationshipStatus'],
                      })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Em Pausa">Em Pausa</option>
                    <option value="Encerrado">Encerrado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Observações e Histórico
                </label>
                <textarea
                  rows={3}
                  name="client_notes_unique_field"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações relevantes sobre a conta e relacionamento."
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

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
                  {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteClient(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Remover Cliente?"
        message="Tem certeza que deseja remover este cliente do cadastro?"
        confirmText="Sim, Remover"
      />
    </div>
  );
};
