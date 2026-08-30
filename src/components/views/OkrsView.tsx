import React, { useState, useMemo } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { OKRObjective, KeyResult, KRStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ArrowRight,
  CheckSquare,
  HelpCircle,
  Calculator,
  Search,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  User,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export const OkrsView: React.FC = () => {
  const {
    currentProject,
    currentProjectOKRs,
    addObjective,
    updateObjective,
    duplicateOkr,
    deleteObjective,
    addKeyResult,
    updateKeyResult,
    deleteKeyResult,
    convertKRTo5W2H,
    setActiveModule,
  } = useConsulting();

  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPedagogicalGuide, setShowPedagogicalGuide] = useState<boolean>(true);
  const [expandedObjectives, setExpandedObjectives] = useState<Record<string, boolean>>({});

  // Modal Objective
  const [isObjModalOpen, setIsObjModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<OKRObjective | null>(null);
  const [objForm, setObjForm] = useState({
    title: '',
    category: 'Estratégico',
    cycle: 'Q1 2025',
    owner: currentProject?.leadConsultant || '',
    description: '',
  });

  // Modal KR
  const [isKrModalOpen, setIsKrModalOpen] = useState(false);
  const [targetObjId, setTargetObjId] = useState<string | null>(null);
  const [editingKr, setEditingKr] = useState<KeyResult | null>(null);
  const [krForm, setKrForm] = useState<{
    title: string;
    initialValue: number;
    targetValue: number;
    currentValue: number;
    unit: string;
    owner: string;
    status: KRStatus;
  }>({
    title: '',
    initialValue: 0,
    targetValue: 100,
    currentValue: 20,
    unit: '%',
    owner: currentProject?.leadConsultant || '',
    status: 'No rumo',
  });

  // Modal 5W2H Conversion
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertTarget, setConvertTarget] = useState<{
    objId: string;
    objTitle: string;
    kr: KeyResult;
  } | null>(null);
  const [convertForm, setConvertForm] = useState({
    what: '',
    who: '',
    when: '',
    cost: 0,
  });

  // Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'obj' | 'kr';
    id: string;
    parentObjId?: string;
  } | null>(null);

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
        Selecione um projeto primeiro.
      </div>
    );
  }

  // Calculate live preview progress for the KR Form Modal
  const previewCalculation = useMemo(() => {
    const init = Number(krForm.initialValue) || 0;
    const tgt = Number(krForm.targetValue) || 0;
    const cur = Number(krForm.currentValue) || 0;
    const diff = tgt - init;

    let progress = 0;
    let isDecreasingGoal = diff < 0;

    if (diff > 0) {
      progress = Math.min(100, Math.max(0, Math.round(((cur - init) / diff) * 100)));
    } else if (diff < 0) {
      progress = Math.min(100, Math.max(0, Math.round(((init - cur) / (init - tgt)) * 100)));
    } else {
      progress = cur >= tgt ? 100 : 0;
    }

    let status: KRStatus = 'No rumo';
    if (progress >= 100) status = 'Atingido';
    else if (progress >= 70) status = 'No rumo';
    else if (progress >= 40) status = 'Em atenção';
    else status = 'Em risco';

    return { progress, status, isDecreasingGoal, init, tgt, cur, diff };
  }, [krForm.initialValue, krForm.targetValue, krForm.currentValue]);

  // Distinct cycles & categories
  const cycles = Array.from(new Set(currentProjectOKRs.map((o) => o.cycle))).filter(Boolean);
  const categories = ['Estratégico', 'Operacional', 'Financeiro', 'Pessoas / RH', 'Comercial / MKT'];

  const toggleExpand = (id: string) => {
    setExpandedObjectives((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const state: Record<string, boolean> = {};
    currentProjectOKRs.forEach((o) => (state[o.id] = true));
    setExpandedObjectives(state);
  };

  const collapseAll = () => {
    const state: Record<string, boolean> = {};
    currentProjectOKRs.forEach((o) => (state[o.id] = false));
    setExpandedObjectives(state);
  };

  // Filtered Objectives
  const filteredOKRs = useMemo(() => {
    return currentProjectOKRs.filter((o) => {
      const matchCycle = cycleFilter === 'all' || o.cycle === cycleFilter;
      const matchCategory = categoryFilter === 'all' || o.category === categoryFilter;
      const matchSearch =
        !searchQuery.trim() ||
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.keyResults.some(
          (k) =>
            k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            k.owner.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchCycle && matchCategory && matchSearch;
    });
  }, [currentProjectOKRs, cycleFilter, categoryFilter, searchQuery]);

  // Global KPIs summary
  const stats = useMemo(() => {
    const totalObjs = currentProjectOKRs.length;
    const allKrs = currentProjectOKRs.flatMap((o) => o.keyResults);
    const totalKrs = allKrs.length;
    const avgProgress =
      totalKrs > 0
        ? Math.round(allKrs.reduce((acc, k) => acc + (k.progressPercent || 0), 0) / totalKrs)
        : 0;

    const achieved = allKrs.filter((k) => (k.progressPercent || 0) >= 100).length;
    const onTrack = allKrs.filter(
      (k) => (k.progressPercent || 0) >= 70 && (k.progressPercent || 0) < 100
    ).length;
    const inWarning = allKrs.filter(
      (k) => (k.progressPercent || 0) >= 40 && (k.progressPercent || 0) < 70
    ).length;
    const inDanger = allKrs.filter((k) => (k.progressPercent || 0) < 40).length;

    return { totalObjs, totalKrs, avgProgress, achieved, onTrack, inWarning, inDanger };
  }, [currentProjectOKRs]);

  // Objective Handlers
  const openAddObj = () => {
    setEditingObj(null);
    setObjForm({
      title: '',
      category: 'Estratégico',
      cycle: cycles[0] || 'Q1 2025',
      owner: currentProject.leadConsultant,
      description: '',
    });
    setIsObjModalOpen(true);
  };

  const openEditObj = (o: OKRObjective) => {
    setEditingObj(o);
    setObjForm({
      title: o.title,
      category: o.category,
      cycle: o.cycle,
      owner: o.owner,
      description: o.description || '',
    });
    setIsObjModalOpen(true);
  };

  const handleSaveObj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objForm.title.trim()) return;

    if (editingObj) {
      updateObjective(editingObj.id, {
        title: objForm.title,
        category: objForm.category,
        cycle: objForm.cycle,
        owner: objForm.owner,
        description: objForm.description,
      });
    } else {
      addObjective({
        projectId: currentProject.id,
        title: objForm.title,
        category: objForm.category,
        cycle: objForm.cycle,
        owner: objForm.owner,
        description: objForm.description,
        keyResults: [],
      });
    }
    setIsObjModalOpen(false);
  };

  // KR Handlers
  const openAddKr = (objId: string) => {
    setTargetObjId(objId);
    setEditingKr(null);
    setKrForm({
      title: '',
      initialValue: 0,
      targetValue: 100,
      currentValue: 0,
      unit: '%',
      owner: currentProject.leadConsultant,
      status: 'No rumo',
    });
    setIsKrModalOpen(true);
  };

  const openEditKr = (objId: string, kr: KeyResult) => {
    setTargetObjId(objId);
    setEditingKr(kr);
    setKrForm({
      title: kr.title,
      initialValue: kr.initialValue,
      targetValue: kr.targetValue,
      currentValue: kr.currentValue,
      unit: kr.unit,
      owner: kr.owner,
      status: kr.status,
    });
    setIsKrModalOpen(true);
  };

  const handleSaveKr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetObjId || !krForm.title.trim()) return;

    const progress = previewCalculation.progress;
    const status = previewCalculation.status;

    if (editingKr) {
      updateKeyResult(targetObjId, editingKr.id, {
        title: krForm.title,
        initialValue: Number(krForm.initialValue),
        targetValue: Number(krForm.targetValue),
        currentValue: Number(krForm.currentValue),
        unit: krForm.unit,
        owner: krForm.owner,
        progressPercent: progress,
        status: status,
      });
    } else {
      addKeyResult(targetObjId, {
        title: krForm.title,
        initialValue: Number(krForm.initialValue),
        targetValue: Number(krForm.targetValue),
        currentValue: Number(krForm.currentValue),
        unit: krForm.unit,
        owner: krForm.owner,
        progressPercent: progress,
        status: status,
      });
    }
    setIsKrModalOpen(false);
  };

  const handleQuickUpdateKrValue = (objId: string, krId: string, newCurrentVal: number) => {
    const obj = currentProjectOKRs.find((o) => o.id === objId);
    const kr = obj?.keyResults.find((k) => k.id === krId);
    if (!kr) return;

    const diff = kr.targetValue - kr.initialValue;
    let progress = 0;
    if (diff > 0) {
      progress = Math.min(
        100,
        Math.max(0, Math.round(((newCurrentVal - kr.initialValue) / diff) * 100))
      );
    } else if (diff < 0) {
      progress = Math.min(
        100,
        Math.max(
          0,
          Math.round(((kr.initialValue - newCurrentVal) / (kr.initialValue - kr.targetValue)) * 100)
        )
      );
    } else {
      progress = newCurrentVal >= kr.targetValue ? 100 : 0;
    }

    let status: KRStatus = kr.status;
    if (progress >= 100) status = 'Atingido';
    else if (progress >= 70) status = 'No rumo';
    else if (progress >= 40) status = 'Em atenção';
    else status = 'Em risco';

    updateKeyResult(objId, krId, {
      currentValue: newCurrentVal,
      progressPercent: progress,
      status: status,
    });
  };

  // Convert KR to 5W2H Action
  const openConvertModal = (objId: string, objTitle: string, kr: KeyResult) => {
    setConvertTarget({ objId, objTitle, kr });
    setConvertForm({
      what: `Implementar plano de ação operacional para atingir a meta: ${kr.title}`,
      who: kr.owner || currentProject.leadConsultant,
      when: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      cost: 0,
    });
    setIsConvertModalOpen(true);
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertTarget) return;

    convertKRTo5W2H(
      convertTarget.objId,
      convertTarget.kr.id,
      convertForm.what,
      convertForm.who,
      convertForm.when,
      Number(convertForm.cost) || 0
    );

    setIsConvertModalOpen(false);
  };

  const getProgressBg = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      <Breadcrumbs
        title="Objetivos e Resultados-Chave (OKRs & Metas)"
        subtitle="Alinhamento estratégico, metas quantitativas mensuráveis e acompanhamento de avanço em tempo real"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowPedagogicalGuide((prev) => !prev)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                showPedagogicalGuide
                  ? 'bg-blue-950/70 border-blue-700 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Guia de Como Funcionam e Como Calcular OKRs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Como Calcular OKRs</span>
            </button>

            <button
              onClick={openAddObj}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Objetivo
            </button>
          </div>
        }
      />

      {/* Pedagogical Interactive Guide Banner */}
      {showPedagogicalGuide && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-900/60 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5 text-blue-300 font-bold text-sm">
              <Calculator className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Como estruturar e calcular Metas & OKRs na Consultoria</span>
            </div>
            <button
              onClick={() => setShowPedagogicalGuide(false)}
              className="text-slate-400 hover:text-slate-200 text-xs font-semibold p-1 cursor-pointer"
            >
              Ocultar guia ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Target className="w-4 h-4 text-blue-400" />
                <span>1. Objetivo (O que queremos?)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Qualitativo, inspirador e estratégico. Define a direção desejada para a empresa ou setor (Ex: <em>Aumentar a rentabilidade das operações e a satisfação dos clientes</em>).
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>2. Resultado-Chave (Como medimos?)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Quantitativo e mensurável. Composto por <strong>Linha de Base (Inicial)</strong>, <strong>Meta Final (Alvo)</strong> e <strong>Realizado (Atual medido)</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>3. Cálculo Automático do % Meta</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Fórmula de avanço proporcional: <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">((Realizado - Inicial) / (Meta - Inicial)) × 100</code>. O sistema calcula e ajusta o status (Verde, Amarelo, Vermelho) automaticamente!
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>
              💡 <strong>Dica Prática:</strong> Se um KR estiver em risco ou atrasado, clique em <strong>"Gerar Ação 5W2H"</strong> para desdobrá-lo imediatamente em um plano de intervenção operacional.
            </span>
            <button
              onClick={() => setActiveModule('5w2h')}
              className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              Ver Plano 5W2H <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Objetivos</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.totalObjs}</div>
          <div className="text-[11px] text-slate-400">Desdobramentos estratégicos</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Metas (KRs)</span>
            <Sliders className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.totalKrs}</div>
          <div className="text-[11px] text-slate-400">Indicadores mensuráveis</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Atingimento Médio</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.avgProgress}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${getProgressBg(stats.avgProgress)}`}
              style={{ width: `${stats.avgProgress}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Distribuição KRs</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2 py-0.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-bold text-xs rounded" title="Atingidos">
              {stats.achieved} ✓
            </span>
            <span className="px-2 py-0.5 bg-blue-950/70 border border-blue-800 text-blue-300 font-bold text-xs rounded" title="No rumo">
              {stats.onTrack}
            </span>
            <span className="px-2 py-0.5 bg-amber-950/70 border border-amber-800 text-amber-300 font-bold text-xs rounded" title="Atenção">
              {stats.inWarning}
            </span>
            <span className="px-2 py-0.5 bg-rose-950/70 border border-rose-800 text-rose-300 font-bold text-xs rounded" title="Risco">
              {stats.inDanger}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Verde / Amarelo / Vermelho</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por objetivo, indicador ou responsável..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 shrink-0">
            <span className="text-slate-400 font-medium">Ciclo:</span>
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-100">
                Todos os Ciclos
              </option>
              {cycles.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-100">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 shrink-0">
            <span className="text-slate-400 font-medium">Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-100">
                Todas as Categorias
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={expandAll}
            className="px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded text-[11px] font-medium transition-colors cursor-pointer"
          >
            Expandir todos
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded text-[11px] font-medium transition-colors cursor-pointer"
          >
            Recolher todos
          </button>
        </div>
      </div>

      {/* Objectives Accordion List */}
      <div className="space-y-4">
        {filteredOKRs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-200">Nenhum Objetivo Cadastrado</h3>
            <p className="text-xs text-slate-400 mt-1">
              Defina os objetivos estratégicos do projeto e desdobre em Key Results (KRs) mensuráveis.
            </p>
            <button
              onClick={openAddObj}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Cadastrar Primeiro Objetivo
            </button>
          </div>
        ) : (
          filteredOKRs.map((obj) => {
            const isExpanded = expandedObjectives[obj.id] !== false; // expanded by default
            const krCount = obj.keyResults.length;
            const avgProgress =
              krCount > 0
                ? Math.round(
                    obj.keyResults.reduce((acc, k) => acc + (k.progressPercent || 0), 0) /
                      krCount
                  )
                : 0;

            return (
              <div
                key={obj.id}
                className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Objective Card Header */}
                <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/60">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleExpand(obj.id)}
                      className="p-1 text-slate-400 hover:text-slate-200 mt-0.5 rounded cursor-pointer shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-blue-300 uppercase bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/80">
                          {obj.category}
                        </span>
                        <span className="text-[10px] text-slate-300 font-semibold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {obj.cycle}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          {obj.owner}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                        {obj.title}
                      </h3>
                      {obj.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {obj.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress Metric + Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pl-8 lg:pl-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                    <div className="w-36 text-right">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                          Atingimento
                        </span>
                        <span className="text-slate-100 font-mono">{avgProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressBg(
                            avgProgress
                          )}`}
                          style={{ width: `${avgProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAddKr(obj.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Adicionar Key Result"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Novo KR</span>
                      </button>
                      <button
                        onClick={() => duplicateOkr(obj.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 rounded cursor-pointer"
                        title="Duplicar Objetivo"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditObj(obj)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                        title="Editar Objetivo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'obj', id: obj.id })}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                        title="Excluir Objetivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Results Nested List */}
                {isExpanded && (
                  <div className="p-4 bg-slate-900/90 space-y-3">
                    {krCount === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
                        Nenhum Key Result vinculado a este objetivo.{' '}
                        <button
                          onClick={() => openAddKr(obj.id)}
                          className="text-blue-400 font-bold hover:underline cursor-pointer"
                        >
                          Clique aqui para adicionar o primeiro KR mensurável.
                        </button>
                      </div>
                    ) : (
                      obj.keyResults.map((kr) => (
                        <div
                          key={kr.id}
                          className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-850/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          {/* KR Details */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={kr.status} size="sm" />
                              <span className="font-bold text-slate-100 text-sm leading-snug">
                                {kr.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                              <span>
                                Baseline (Inicial):{' '}
                                <strong className="text-slate-300">
                                  {kr.initialValue} {kr.unit}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Meta (Alvo):{' '}
                                <strong className="text-blue-300">
                                  {kr.targetValue} {kr.unit}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Responsável: <strong className="text-slate-300">{kr.owner}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Realized Metric Modifier + Progress + Convert 5W2H */}
                          <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                            {/* Realized Interactive Modifier */}
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-750 px-2.5 py-1 rounded-lg">
                              <span className="text-[11px] text-slate-400 font-medium">
                                Realizado:
                              </span>
                              <input
                                type="number"
                                value={kr.currentValue}
                                onChange={(e) =>
                                  handleQuickUpdateKrValue(obj.id, kr.id, Number(e.target.value))
                                }
                                className="w-20 font-mono font-bold text-slate-100 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-right focus:outline-none focus:border-blue-500"
                                title="Altere o valor realizado para calcular a meta em tempo real"
                              />
                              <span className="text-xs text-slate-400 font-medium">{kr.unit}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-24 text-right">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-[10px] text-slate-400">Avanço</span>
                                <span className="text-slate-200 font-mono">
                                  {kr.progressPercent}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full ${getProgressBg(
                                    kr.progressPercent
                                  )}`}
                                  style={{ width: `${kr.progressPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Convert to 5W2H Button */}
                            <button
                              onClick={() => openConvertModal(obj.id, obj.title, kr)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              title="Transformar este KR em uma ação no plano 5W2H"
                            >
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden sm:inline">Gerar Ação 5W2H</span>
                            </button>

                            {/* Edit / Delete actions */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditKr(obj.id, kr)}
                                className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                                title="Editar KR"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'kr',
                                    id: kr.id,
                                    parentObjId: obj.id,
                                  })
                                }
                                className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                                title="Excluir KR"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Objective */}
      {isObjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingObj ? 'Editar Objetivo Estratégico' : 'Novo Objetivo Estratégico'}
                </h3>
              </div>
              <button
                onClick={() => setIsObjModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveObj} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Enunciado do Objetivo <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={objForm.title}
                  onChange={(e) => setObjForm({ ...objForm, title: e.target.value })}
                  placeholder="Ex: Aumentar a eficiência operacional e a margem de contribuição"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={objForm.category}
                    onChange={(e) => setObjForm({ ...objForm, category: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Estratégico">Estratégico</option>
                    <option value="Operacional">Operacional</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Pessoas / RH">Pessoas / RH</option>
                    <option value="Comercial / MKT">Comercial / MKT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Ciclo Temporal
                  </label>
                  <input
                    type="text"
                    value={objForm.cycle}
                    onChange={(e) => setObjForm({ ...objForm, cycle: e.target.value })}
                    placeholder="Ex: Q1 2025"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Dono / Líder
                  </label>
                  <input
                    type="text"
                    value={objForm.owner}
                    onChange={(e) => setObjForm({ ...objForm, owner: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição / Contexto Estratégico
                </label>
                <textarea
                  rows={2}
                  value={objForm.description}
                  onChange={(e) => setObjForm({ ...objForm, description: e.target.value })}
                  placeholder="Por que este objetivo é a prioridade estratégica da organização no momento?"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsObjModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  Salvar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit KR with Real-Time Math Preview */}
      {isKrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingKr ? 'Editar Key Result (KR)' : 'Adicionar Key Result Mensurável (KR)'}
                </h3>
              </div>
              <button
                onClick={() => setIsKrModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKr} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Enunciado do Key Result <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={krForm.title}
                  onChange={(e) => setKrForm({ ...krForm, title: e.target.value })}
                  placeholder="Ex: Reduzir tempo de ciclo de faturamento de 45 para 20 dias"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Baseline, Target, Realized, Unit Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Inicial (Base)
                  </label>
                  <input
                    type="number"
                    value={krForm.initialValue}
                    onChange={(e) =>
                      setKrForm({ ...krForm, initialValue: Number(e.target.value) })
                    }
                    className="w-full text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Meta (Alvo) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={krForm.targetValue}
                    onChange={(e) =>
                      setKrForm({ ...krForm, targetValue: Number(e.target.value) })
                    }
                    className="w-full text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-blue-400 rounded-lg p-2.5 focus:outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Realizado
                  </label>
                  <input
                    type="number"
                    value={krForm.currentValue}
                    onChange={(e) =>
                      setKrForm({ ...krForm, currentValue: Number(e.target.value) })
                    }
                    className="w-full text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={krForm.unit}
                    onChange={(e) => setKrForm({ ...krForm, unit: e.target.value })}
                    placeholder="%, R$, dias"
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500 text-center"
                  />
                </div>
              </div>

              {/* Dynamic Live Calculation Card */}
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Calculator className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cálculo em Tempo Real da Meta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Progresso:</span>
                    <strong className="text-slate-100 font-mono text-sm">
                      {previewCalculation.progress}%
                    </strong>
                    <StatusBadge status={previewCalculation.status} size="sm" />
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressBg(
                      previewCalculation.progress
                    )}`}
                    style={{ width: `${previewCalculation.progress}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  {previewCalculation.isDecreasingGoal ? (
                    <>
                      Meta de Redução: (({previewCalculation.init} - {previewCalculation.cur}) / (
                      {previewCalculation.init} - {previewCalculation.tgt})) × 100 ={' '}
                      <strong>{previewCalculation.progress}%</strong>
                    </>
                  ) : (
                    <>
                      Meta de Aumento: (({previewCalculation.cur} - {previewCalculation.init}) / (
                      {previewCalculation.tgt} - {previewCalculation.init})) × 100 ={' '}
                      <strong>{previewCalculation.progress}%</strong>
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Responsável pelo KR
                  </label>
                  <input
                    type="text"
                    value={krForm.owner}
                    onChange={(e) => setKrForm({ ...krForm, owner: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status Sugerido
                  </label>
                  <select
                    value={krForm.status}
                    onChange={(e) =>
                      setKrForm({ ...krForm, status: e.target.value as KRStatus })
                    }
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="No rumo">No rumo (Verde - Atingimento &gt;= 70%)</option>
                    <option value="Em atenção">Em atenção (Amarelo - 40% a 69%)</option>
                    <option value="Em risco">Em risco (Vermelho - &lt; 40%)</option>
                    <option value="Atingido">Atingido (100% Concluído)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsKrModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  Salvar Key Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Convert KR to 5W2H Action */}
      {isConvertModalOpen && convertTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Gerar Plano de Ação 5W2H a partir da Meta
                </h3>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConvertSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 space-y-1 text-xs">
                <p className="text-slate-400">
                  Objetivo Estratégico: <strong className="text-slate-200">{convertTarget.objTitle}</strong>
                </p>
                <p className="text-slate-400">
                  Meta KR: <strong className="text-blue-300">{convertTarget.kr.title}</strong> ({convertTarget.kr.currentValue} / {convertTarget.kr.targetValue} {convertTarget.kr.unit})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  O que será feito? (What) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={convertForm.what}
                  onChange={(e) => setConvertForm({ ...convertForm, what: e.target.value })}
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Quem executará? (Who)
                  </label>
                  <input
                    type="text"
                    value={convertForm.who}
                    onChange={(e) => setConvertForm({ ...convertForm, who: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Prazo Limite (When)
                  </label>
                  <input
                    type="date"
                    value={convertForm.when}
                    onChange={(e) => setConvertForm({ ...convertForm, when: e.target.value })}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Custo Estimado em R$ (How Much)
                </label>
                <input
                  type="number"
                  value={convertForm.cost}
                  onChange={(e) => setConvertForm({ ...convertForm, cost: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" />
                  Criar Ação no 5W2H
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            if (deleteConfirm.type === 'obj') {
              deleteObjective(deleteConfirm.id);
            } else if (deleteConfirm.type === 'kr' && deleteConfirm.parentObjId) {
              deleteKeyResult(deleteConfirm.parentObjId, deleteConfirm.id);
            }
            setDeleteConfirm(null);
          }
        }}
        title="Excluir item?"
        message="Tem certeza que deseja excluir este item de OKR? Esta ação é irreversível."
        confirmText="Sim, Excluir"
      />
    </div>
  );
};
