import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Settings,
  Building2,
  DollarSign,
  ShieldAlert,
  Database,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  Sliders,
  Sparkles,
  Users,
  LogOut,
  Plus,
  Shield,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportAllDataJSON,
    importDataJSON,
    resetToDemoData,
    currentUser,
    currentGroup,
    availableGroups,
    switchGroup,
    createGroup,
    logout,
    cleanCurrentGroupData,
  } = useConsulting();

  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [cleanGroupConfirmOpen, setCleanGroupConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [newGroupNameInput, setNewGroupNameInput] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const success = importDataJSON(jsonStr);
        if (success) {
          setImportStatus('Dados restaurados com sucesso!');
        } else {
          setImportStatus('Erro ao importar: formato JSON inválido.');
        }
      } catch (err) {
        setImportStatus('Erro ao processar o arquivo.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleCreateNewGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupNameInput.trim()) return;
    createGroup(newGroupNameInput.trim());
    switchGroup(newGroupNameInput.trim());
    setNewGroupNameInput('');
  };

  return (
    <div className="space-y-6 max-w-4xl text-slate-100">
      <Breadcrumbs
        title="Configurações Globais & Backup"
        subtitle="Personalização da consultoria, parâmetros de análise de risco e gestão de dados"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Consulting Profile */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">Perfil da Consultoria</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Nome da Consultoria / Empresa
              </label>
              <input
                type="text"
                value={formSettings.consultingFirmName}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, consultingFirmName: e.target.value })
                }
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Consultor Padrão
              </label>
              <input
                type="text"
                value={formSettings.defaultConsultantName}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, defaultConsultantName: e.target.value })
                }
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Símbolo de Moeda Padrão
              </label>
              <select
                value={formSettings.currency}
                onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              >
                <option value="R$">Real Brasileiro (R$)</option>
                <option value="US$">Dólar Americano (US$)</option>
                <option value="€">Euro (€)</option>
                <option value="£">Libra Esterlina (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Formato de Data
              </label>
              <select
                value={formSettings.dateFormat}
                onChange={(e) => setFormSettings({ ...formSettings, dateFormat: e.target.value })}
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Brasil / Europa)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Padrão)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (EUA)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                Limiares de Severidade da Matriz de Riscos (Score = P × I)
              </h3>
              <p className="text-xs text-slate-400">
                Configure os pontos de corte para classificação automática de risco (1 a 25)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-900/60">
              <label className="block font-bold text-rose-300 uppercase mb-1">
                Nível Crítico (Score &ge;)
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={formSettings.riskScoreThresholds.critical}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    riskScoreThresholds: {
                      ...formSettings.riskScoreThresholds,
                      critical: Number(e.target.value),
                    },
                  })
                }
                className="w-full bg-slate-800 border border-rose-800/80 rounded p-2 font-bold font-mono text-rose-200 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-amber-950/40 rounded-lg border border-amber-900/60">
              <label className="block font-bold text-amber-300 uppercase mb-1">
                Nível Alto (Score &ge;)
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={formSettings.riskScoreThresholds.high}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    riskScoreThresholds: {
                      ...formSettings.riskScoreThresholds,
                      high: Number(e.target.value),
                    },
                  })
                }
                className="w-full bg-slate-800 border border-amber-800/80 rounded p-2 font-bold font-mono text-amber-200 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-900/60">
              <label className="block font-bold text-blue-300 uppercase mb-1">
                Nível Moderado (Score &ge;)
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={formSettings.riskScoreThresholds.moderate}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    riskScoreThresholds: {
                      ...formSettings.riskScoreThresholds,
                      moderate: Number(e.target.value),
                    },
                  })
                }
                className="w-full bg-slate-800 border border-blue-800/80 rounded p-2 font-bold font-mono text-blue-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Configurações salvas com sucesso!
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </form>

      {/* Group & Workspace Multi-tenancy Management */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100">Grupo Atual & Multi-Tenancy</h3>
              <p className="text-xs text-slate-400">
                Isolamento completo de dados por equipe. Alterne entre grupos ou inicie novos ambientes.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Isolamento Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessão Atual</span>
            <p className="text-sm font-bold text-slate-100 mt-1">{currentUser?.email}</p>
            <p className="text-xs text-blue-400 font-semibold mt-0.5">Grupo: {currentGroup}</p>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCleanGroupConfirmOpen(true)}
                className="text-xs px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 transition-colors font-medium cursor-pointer"
              >
                Limpar Dados deste Grupo
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-xs px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30 transition-colors font-medium flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Criar Novo Grupo</span>
            <form onSubmit={handleCreateNewGroup} className="mt-2 flex gap-2">
              <input
                type="text"
                value={newGroupNameInput}
                onChange={(e) => setNewGroupNameInput(e.target.value)}
                placeholder="Nome do novo grupo..."
                className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar
              </button>
            </form>
            <p className="text-[11px] text-slate-400 mt-2">
              Novos grupos iniciam com um app limpo pronto para novos projetos.
            </p>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Grupos Registrados no Sistema:
          </span>
          <div className="flex flex-wrap gap-2">
            {availableGroups.map((grp) => {
              const isCurrent = grp === currentGroup;
              return (
                <button
                  key={grp}
                  type="button"
                  onClick={() => switchGroup(grp)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-bold shadow-sm'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-400' : 'bg-slate-500'}`} />
                  <span>{grp}</span>
                  {isCurrent && <span className="text-[10px] font-normal text-blue-300">(Ativo)</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Database Management & Backups */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Database className="w-5 h-5 text-slate-300" />
          <div>
            <h3 className="font-bold text-sm text-slate-100">Gestão da Base de Dados & Backup</h3>
            <p className="text-xs text-slate-400">
              Persistência local ativa. Faça backup de todos os seus projetos e ferramentas.
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 bg-blue-950/60 text-blue-200 rounded-lg border border-blue-800/80 text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <button
            onClick={exportAllDataJSON}
            className="p-4 bg-slate-800/70 hover:bg-slate-800 border border-slate-750 rounded-xl text-left transition-all flex flex-col justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <Download className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] uppercase font-bold text-slate-500">JSON</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Exportar Backup Completo</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Baixar todos os projetos, clientes e ferramentas em um único arquivo.
              </p>
            </div>
          </button>

          <label className="p-4 bg-slate-800/70 hover:bg-slate-800 border border-slate-750 rounded-xl text-left transition-all flex flex-col justify-between gap-3 cursor-pointer group">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center justify-between">
              <Upload className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] uppercase font-bold text-slate-500">Restaurar</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Importar / Restaurar Backup</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Carregar arquivo JSON para recuperar projetos anteriores.
              </p>
            </div>
          </label>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="p-4 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/60 rounded-xl text-left transition-all flex flex-col justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <RefreshCw className="w-5 h-5 text-rose-400 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[10px] uppercase font-bold text-rose-400">Demonstração</span>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-200">Restaurar Dados Demo</p>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Carregar casos de estudo de demonstração completos.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          resetToDemoData();
          setResetConfirmOpen(false);
        }}
        title="Restaurar Dados de Demonstração?"
        message="Esta ação substituirá todos os dados do grupo atual pelos projetos e diagnósticos padrão de demonstração. Deseja continuar?"
        confirmText="Sim, Restaurar Demo"
      />

      {/* Confirmation Modal for Clean Group */}
      <ConfirmModal
        isOpen={cleanGroupConfirmOpen}
        onClose={() => setCleanGroupConfirmOpen(false)}
        onConfirm={() => {
          cleanCurrentGroupData();
          setCleanGroupConfirmOpen(false);
        }}
        title={`Limpar Dados do Grupo "${currentGroup}"?`}
        message="Todos os projetos, diagnósticos, matrizes e ferramentas criados neste grupo serão resetados para um ambiente em branco. Os dados de outros grupos permanecerão intactos."
        confirmText="Sim, Limpar Ambiente"
        type="danger"
      />
    </div>
  );
};
