import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import {
  StakeholderItem,
  StakeholderStance,
  StakeholderStrategy,
} from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Users2,
  Plus,
  Grid2X2,
  List,
  Edit2,
  Trash2,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export const StakeholdersView: React.FC = () => {
  const {
    currentProject,
    currentProjectStakeholders,
    addStakeholder,
    updateStakeholder,
    deleteStakeholder,
  } = useConsulting();

  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [filterStance, setFilterStance] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<StakeholderItem | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    organization: string;
    power: number;
    interest: number;
    currentStance: StakeholderStance;
    desiredStance: StakeholderStance;
    strategy: StakeholderStrategy;
    expectations: string;
    concerns: string;
    engagementActions: string;
    contactFrequency: string;
    responsible: string;
  }>({
    name: '',
    role: '',
    organization: currentProject?.clientName || '',
    power: 4,
    interest: 4,
    currentStance: 'Neutro',
    desiredStance: 'Apoiador',
    strategy: 'Gerenciar de perto',
    expectations: '',
    concerns: '',
    engagementActions: '',
    contactFrequency: 'Semanal',
    responsible: currentProject?.leadConsultant || '',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  // Automatic strategy determination based on power & interest
  const computeStrategy = (power: number, interest: number): StakeholderStrategy => {
    if (power >= 3 && interest >= 3) return 'Gerenciar de perto';
    if (power >= 3 && interest < 3) return 'Manter satisfeito';
    if (power < 3 && interest >= 3) return 'Manter informado';
    return 'Monitorar';
  };

  const openCreateModal = (p: number = 4, i: number = 4) => {
    setEditingStakeholder(null);
    const strat = computeStrategy(p, i);
    setFormData({
      name: '',
      role: '',
      organization: currentProject.clientName,
      power: p,
      interest: i,
      currentStance: 'Neutro',
      desiredStance: 'Apoiador',
      strategy: strat,
      expectations: '',
      concerns: '',
      engagementActions: '',
      contactFrequency: 'Semanal',
      responsible: currentProject.leadConsultant,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: StakeholderItem) => {
    setEditingStakeholder(s);
    setFormData({
      name: s.name,
      role: s.role,
      organization: s.organization || '',
      power: s.power,
      interest: s.interest,
      currentStance: s.currentStance,
      desiredStance: s.desiredStance,
      strategy: s.strategy,
      expectations: s.expectations || '',
      concerns: s.concerns || '',
      engagementActions: s.engagementActions || '',
      contactFrequency: s.contactFrequency || 'Semanal',
      responsible: s.responsible || currentProject.leadConsultant,
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStakeholder) {
      updateStakeholder(editingStakeholder.id, {
        name: formData.name,
        role: formData.role,
        organization: formData.organization,
        power: formData.power,
        interest: formData.interest,
        currentStance: formData.currentStance,
        desiredStance: formData.desiredStance,
        strategy: formData.strategy,
        expectations: formData.expectations,
        concerns: formData.concerns,
        engagementActions: formData.engagementActions,
        contactFrequency: formData.contactFrequency,
        responsible: formData.responsible,
      });
    } else {
      addStakeholder({
        projectId: currentProject.id,
        name: formData.name,
        role: formData.role,
        organization: formData.organization,
        power: formData.power,
        interest: formData.interest,
        currentStance: formData.currentStance,
        desiredStance: formData.desiredStance,
        strategy: formData.strategy,
        expectations: formData.expectations,
        concerns: formData.concerns,
        engagementActions: formData.engagementActions,
        contactFrequency: formData.contactFrequency,
        responsible: formData.responsible,
      });
    }
    setIsModalOpen(false);
  };

  const filteredStakeholders = currentProjectStakeholders.filter((s) => {
    const matchStrat = filterStrategy === 'all' || s.strategy === filterStrategy;
    const matchStance = filterStance === 'all' || s.currentStance === filterStance;
    return matchStrat && matchStance;
  });

  // Quadrants logic
  // Q1: High Power (>=3), High Interest (>=3) -> Gerenciar de perto
  // Q2: High Power (>=3), Low Interest (<3) -> Manter satisfeito
  // Q3: Low Power (<3), High Interest (>=3) -> Manter informado
  // Q4: Low Power (<3), Low Interest (<3) -> Monitorar
  const qManageClosely = filteredStakeholders.filter((s) => s.power >= 3 && s.interest >= 3);
  const qSatisfy = filteredStakeholders.filter((s) => s.power >= 3 && s.interest < 3);
  const qInform = filteredStakeholders.filter((s) => s.power < 3 && s.interest >= 3);
  const qMonitor = filteredStakeholders.filter((s) => s.power < 3 && s.interest < 3);

  const renderStanceBadge = (stance: StakeholderStance) => {
    switch (stance) {
      case 'Apoiador':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Apoiador
          </span>
        );
      case 'Neutro':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Neutro
          </span>
        );
      case 'Resistente':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            Resistente
          </span>
        );
      case 'Crítico':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
            Crítico
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Matriz de Stakeholders (Poder x Interesse)"
        subtitle="Mapeamento, posturas e estratégias de engajamento das partes interessadas"
        actions={
          <>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                Matriz 2x2
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Tabela Completa
              </button>
            </div>

            <button
              onClick={() => openCreateModal(4, 4)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Stakeholder
            </button>
          </>
        }
      />

      {/* VIEW: 2X2 POWER X INTEREST MATRIX */}
      {viewMode === 'matrix' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Left: Alto Poder + Baixo Interesse (Manter Satisfeito) */}
            <div className="bg-slate-900 rounded-xl border border-amber-900/60 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 bg-amber-950/40 border-b border-amber-900/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Alto Poder + Baixo Interesse
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-300/80">
                    Estratégia: MANTER SATISFEITO
                  </span>
                </div>
                <button
                  onClick={() => openCreateModal(4, 2)}
                  className="p-1 text-amber-300 hover:bg-amber-900/50 hover:text-white rounded cursor-pointer transition-colors"
                  title="Adicionar neste quadrante"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-[160px] max-h-72 overflow-y-auto">
                {qSatisfy.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">
                    Nenhuma parte interessada neste quadrante.
                  </p>
                ) : (
                  qSatisfy.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all space-y-2 text-slate-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{s.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            {s.role} • {s.organization}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-0.5 text-slate-400 hover:text-blue-400 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            className="p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStanceBadge(s.currentStance)}
                        <span className="text-[10px] text-slate-400">
                          Poder: {s.power}/5 • Interesse: {s.interest}/5
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Right: Alto Poder + Alto Interesse (Gerenciar de Perto) */}
            <div className="bg-slate-900 rounded-xl border border-rose-900/60 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 bg-rose-950/40 border-b border-rose-900/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Alto Poder + Alto Interesse
                  </h3>
                  <span className="text-[11px] font-semibold text-rose-300/80">
                    Estratégia: GERENCIAR DE PERTO (Chave)
                  </span>
                </div>
                <button
                  onClick={() => openCreateModal(5, 5)}
                  className="p-1 text-rose-300 hover:bg-rose-900/50 hover:text-white rounded cursor-pointer transition-colors"
                  title="Adicionar neste quadrante"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-[160px] max-h-72 overflow-y-auto">
                {qManageClosely.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">
                    Nenhuma parte interessada neste quadrante.
                  </p>
                ) : (
                  qManageClosely.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all space-y-2 text-slate-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{s.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            {s.role} • {s.organization}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-0.5 text-slate-400 hover:text-blue-400 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            className="p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStanceBadge(s.currentStance)}
                        <span className="text-[10px] text-slate-400">
                          Poder: {s.power}/5 • Interesse: {s.interest}/5
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Left: Baixo Poder + Baixo Interesse (Monitorar) */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Baixo Poder + Baixo Interesse
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Estratégia: MONITORAR (Mínimo Esforço)
                  </span>
                </div>
                <button
                  onClick={() => openCreateModal(1, 1)}
                  className="p-1 text-slate-400 hover:bg-slate-800 hover:text-white rounded cursor-pointer transition-colors"
                  title="Adicionar neste quadrante"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-[160px] max-h-72 overflow-y-auto">
                {qMonitor.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">
                    Nenhuma parte interessada neste quadrante.
                  </p>
                ) : (
                  qMonitor.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all space-y-2 text-slate-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{s.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            {s.role} • {s.organization}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-0.5 text-slate-400 hover:text-blue-400 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            className="p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStanceBadge(s.currentStance)}
                        <span className="text-[10px] text-slate-400">
                          Poder: {s.power}/5 • Interesse: {s.interest}/5
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Right: Baixo Poder + Alto Interesse (Manter Informado) */}
            <div className="bg-slate-900 rounded-xl border border-blue-900/60 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 bg-blue-950/40 border-b border-blue-900/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Baixo Poder + Alto Interesse
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-300/80">
                    Estratégia: MANTER INFORMADO
                  </span>
                </div>
                <button
                  onClick={() => openCreateModal(2, 4)}
                  className="p-1 text-blue-300 hover:bg-blue-900/50 hover:text-white rounded cursor-pointer transition-colors"
                  title="Adicionar neste quadrante"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-[160px] max-h-72 overflow-y-auto">
                {qInform.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">
                    Nenhuma parte interessada neste quadrante.
                  </p>
                ) : (
                  qInform.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all space-y-2 text-slate-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{s.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            {s.role} • {s.organization}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-0.5 text-slate-400 hover:text-blue-400 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            className="p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStanceBadge(s.currentStance)}
                        <span className="text-[10px] text-slate-400">
                          Poder: {s.power}/5 • Interesse: {s.interest}/5
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TABLE DETAILED VIEW */
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden text-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                <tr>
                  <th className="py-3 px-4">Stakeholder / Papel</th>
                  <th className="py-3 px-3 text-center">Poder</th>
                  <th className="py-3 px-3 text-center">Interesse</th>
                  <th className="py-3 px-3">Estratégia</th>
                  <th className="py-3 px-3">Postura Atual</th>
                  <th className="py-3 px-3">Postura Desejada</th>
                  <th className="py-3 px-4">Ações de Engajamento</th>
                  <th className="py-3 px-3">Contato</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStakeholders.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <div>{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {s.role} • {s.organization}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-200">{s.power}/5</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-200">{s.interest}/5</td>
                    <td className="py-3 px-3 font-semibold text-blue-400">{s.strategy}</td>
                    <td className="py-3 px-3">{renderStanceBadge(s.currentStance)}</td>
                    <td className="py-3 px-3">{renderStanceBadge(s.desiredStance)}</td>
                    <td className="py-3 px-4 text-slate-300">{s.engagementActions || '-'}</td>
                    <td className="py-3 px-3 text-slate-400">{s.contactFrequency}</td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Stakeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden my-8 text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100">
                {editingStakeholder ? 'Editar Stakeholder' : 'Mapear Novo Stakeholder'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveForm}
              autoComplete="off"
              noValidate
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nome da Parte Interessada <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="stakeholder_name_unique_field"
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
                    placeholder="Ex: Dra. Mariana Costa"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Cargo / Papel
                  </label>
                  <input
                    type="text"
                    name="stakeholder_role_unique_field"
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
                    Poder / Influência ({formData.power}/5)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={formData.power}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const strat = computeStrategy(p, formData.interest);
                      setFormData({ ...formData, power: p, strategy: strat });
                    }}
                    className="w-full accent-blue-600 cursor-pointer mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Interesse / Impacto ({formData.interest}/5)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={formData.interest}
                    onChange={(e) => {
                      const i = Number(e.target.value);
                      const strat = computeStrategy(formData.power, i);
                      setFormData({ ...formData, interest: i, strategy: strat });
                    }}
                    className="w-full accent-rose-600 cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Strategy preview */}
              <div className="p-3 bg-blue-950/50 rounded-lg border border-blue-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-300">Estratégia Recomendada:</span>
                <span className="font-bold text-blue-400 uppercase">{formData.strategy}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Postura Atual
                  </label>
                  <select
                    value={formData.currentStance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentStance: e.target.value as StakeholderStance,
                      })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Apoiador">Apoiador</option>
                    <option value="Neutro">Neutro</option>
                    <option value="Resistente">Resistente</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Postura Desejada
                  </label>
                  <select
                    value={formData.desiredStance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        desiredStance: e.target.value as StakeholderStance,
                      })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Apoiador">Apoiador</option>
                    <option value="Neutro">Neutro</option>
                    <option value="Resistente">Resistente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Expectativas & Requisitos
                </label>
                <textarea
                  rows={2}
                  name="stakeholder_expectations_unique_field"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  placeholder="O que essa parte espera do projeto?"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Ações de Engajamento & Comunicação
                </label>
                <textarea
                  rows={2}
                  name="stakeholder_actions_unique_field"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  value={formData.engagementActions}
                  onChange={(e) => setFormData({ ...formData, engagementActions: e.target.value })}
                  placeholder="Como manter alinhado e engajado?"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
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
                  Salvar Stakeholder
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
            deleteStakeholder(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Remover Stakeholder?"
        message="Tem certeza que deseja remover esta parte interessada da matriz?"
        confirmText="Sim, Remover"
      />
    </div>
  );
};
