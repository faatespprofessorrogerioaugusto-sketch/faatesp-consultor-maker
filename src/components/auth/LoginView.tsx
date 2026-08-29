import React, { useState } from 'react';
import { useConsulting, getGroupStoragePrefix } from '../../context/ConsultingContext';
import {
  Shield,
  Users,
  Mail,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { availableGroups, login } = useConsulting();

  const [email, setEmail] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(availableGroups[0] || 'Grupo 01');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check if a group already has saved data
  const checkGroupHasData = (groupName: string) => {
    if (!groupName) return false;
    const prefix = getGroupStoragePrefix(groupName);
    return localStorage.getItem(`${prefix}_initialized`) === 'true';
  };

  const activeTargetGroup = isCreatingNewGroup ? newGroupName.trim() : selectedGroup;
  const isExistingGroup = checkGroupHasData(activeTargetGroup);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Por favor, digite seu e-mail corporativo ou pessoal.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Por favor, informe um formato de e-mail válido (ex: consultor@empresa.com).');
      return;
    }

    const groupToUse = isCreatingNewGroup ? newGroupName.trim() : selectedGroup.trim();
    if (!groupToUse) {
      setErrorMsg('Por favor, selecione um grupo existente ou digite o nome do novo grupo.');
      return;
    }

    login(cleanEmail, groupToUse);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Branding */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Consultor Maker
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                Enterprise
              </span>
            </h1>
            <p className="text-xs text-slate-400">Plataforma Integrada de Gestão & Consultoria Estratégica</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Isolamento Seguro de Dados por Grupo</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-xl">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            {/* Header / Intro */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                <Users className="w-3.5 h-3.5" />
                <span>Acesso Multi-Grupos & Isolamento</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                Entrar na Plataforma
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Identifique-se com seu e-mail e escolha o grupo de trabalho para carregar seu ambiente específico.
              </p>
            </div>

            {errorMsg && (
              <div
                id="login-error-alert"
                className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off" noValidate>
              {/* Fake inputs to trick aggressive browser autofill */}
              <input type="text" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
              <input type="password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  DIGITE SEU E-MAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email-input"
                    type="text"
                    name={`field_${Math.random()}`}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-form-type="other"
                    data-1p-ignore="true"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Group Dropdown & Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    GRUPO
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewGroup(!isCreatingNewGroup);
                      setNewGroupName('');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {isCreatingNewGroup ? (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        <span>Escolher da lista</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Outro grupo</span>
                      </>
                    )}
                  </button>
                </div>

                {!isCreatingNewGroup ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <select
                      id="login-group-select"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                    >
                      {availableGroups.map((grp) => (
                        <option key={grp} value={grp} className="bg-slate-900 text-slate-100">
                          {grp}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <input
                      id="login-new-group-input"
                      type="text"
                      name={`new_grp_${Math.random()}`}
                      autoComplete="off"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Digite o nome do novo grupo ou equipe..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-emerald-500/40 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-blue-500/40"
              >
                <span>Acessar Ambiente do Grupo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="px-6 py-4 max-w-7xl mx-auto w-full text-center text-xs text-slate-400 z-10">
        <strong className="font-bold text-slate-200">Todos os direitos reservados &bull; MISTER ROGER</strong>
      </footer>
    </div>
  );
};
