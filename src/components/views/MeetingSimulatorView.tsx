import React, { useState, useEffect } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { MeetingSimulation, MeetingAgendaItem } from '../../types';
import {
  Presentation,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Plus,
  Trash2,
  Clock,
  Users,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  FileCheck,
  Calendar,
} from 'lucide-react';

export const MeetingSimulatorView: React.FC = () => {
  const { currentProjectId, meetings = [], addMeeting, updateMeeting, deleteMeeting, currentProject } = useConsulting();

  const projectMeetings = meetings.filter((m) => !m.projectId || m.projectId === currentProjectId);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    projectMeetings[0]?.id || null
  );

  const selectedMeeting = projectMeetings.find((m) => m.id === selectedMeetingId) || projectMeetings[0];

  // Timer states
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // New Meeting Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MeetingSimulation['type']>('results_presentation');
  const [newDuration, setNewDuration] = useState(60);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMeetingData: Omit<MeetingSimulation, 'id' | 'projectId'> = {
      title: newTitle,
      type: newType,
      scheduledDate: new Date().toISOString().split('T')[0],
      durationMinutes: newDuration,
      participants: [
        `${currentProject?.leadConsultant || 'Consultor Líder'} (Apresentador)`,
        `${currentProject?.clientName || 'Diretoria Executiva'} (Cliente)`,
      ],
      clientMood: 'demanding',
      objectives: [
        'Apresentar diagnóstico e oportunidades prioritárias',
        'Validar metas estratégicas e cronograma',
        'Definir decisões executivas e aprovação de próximos passos',
      ],
      agenda: [
        {
          id: `ag-${Date.now()}-1`,
          title: '1. Abertura, Contexto & Alinhamento de Objetivos',
          allocatedMinutes: Math.round(newDuration * 0.15),
          notes: 'Agradecer a presença, repassar a pauta e reforçar o propósito da sessão.',
          decisions: '',
        },
        {
          id: `ag-${Date.now()}-2`,
          title: '2. Apresentação dos Resultados do Diagnóstico',
          allocatedMinutes: Math.round(newDuration * 0.45),
          notes: 'Expor matriz de riscos, indicadores críticos e oportunidades de ganho rápido.',
          decisions: '',
        },
        {
          id: `ag-${Date.now()}-3`,
          title: '3. Discussão de Metas & Tratamento de Objeções',
          allocatedMinutes: Math.round(newDuration * 0.25),
          notes: 'Ouvir a diretoria, alinhar expectativas de ROI e recursos necessários.',
          decisions: '',
        },
        {
          id: `ag-${Date.now()}-4`,
          title: '4. Deliberações Finais e Próximos Passos',
          allocatedMinutes: Math.round(newDuration * 0.15),
          notes: 'Firmar responsáveis, prazos de entrega e agendamento do próximo comitê.',
          decisions: '',
        },
      ],
      objectionsAndAnswers: [
        {
          objection: 'O prazo do projeto parece muito longo para nossa urgência.',
          recommendedResponse: 'Focamos as 2 primeiras quinzenas em Quick Wins (vitórias rápidas) de alto impacto enquanto a estrutura definitiva é implementada.',
        },
        {
          objection: 'Nossa equipe interna já está sobrecarregada para apoiar a consultoria.',
          recommendedResponse: 'A metodologia do Consultor Prime assume 80% do esforço de análise e estruturação, exigindo apenas 1 hora semanal dos líderes.',
        },
      ],
      meetingNotes: '',
      actionItemsGenerated: [],
      status: 'planned',
    };

    addMeeting(newMeetingData);
    setIsModalOpen(false);
    setNewTitle('');
  };

  const handleUpdateNotes = (notes: string) => {
    if (selectedMeeting) {
      updateMeeting(selectedMeeting.id, { meetingNotes: notes });
    }
  };

  const handleUpdateDecision = (agendaId: string, decisionText: string) => {
    if (!selectedMeeting) return;
    const updatedAgenda = selectedMeeting.agenda.map((item) =>
      item.id === agendaId ? { ...item, decisions: decisionText } : item
    );
    updateMeeting(selectedMeeting.id, { agenda: updatedAgenda });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Simulador & Condução de Reuniões Executivas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Estruture pautas com cronômetro ao vivo, simule respostas para objeções difíceis e registre decisões em tempo real.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Pauta de Reunião</span>
        </button>
      </div>

      {/* Meeting Selector */}
      <div className="flex items-center gap-2 overflow-x-auto bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 px-2">
          Reuniões:
        </span>
        {projectMeetings.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSelectedMeetingId(m.id);
              setTimerSeconds(0);
              setIsTimerRunning(false);
              setActiveItemIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              (selectedMeeting?.id === m.id)
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{m.title}</span>
          </button>
        ))}
      </div>

      {!selectedMeeting ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Presentation className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Nenhuma reunião estruturada neste projeto</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Crie sua primeira pauta estruturada para conduzir apresentações de diagnóstico com cronômetro e roteiro de objeções.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Criar Pauta Executiva
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Agenda & Live Timer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Conduction Card */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                    Modo Condução em Tempo Real
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1.5">{selectedMeeting.title}</h2>
                  <p className="text-xs text-slate-400">
                    Duração prevista: <strong>{selectedMeeting.durationMinutes} minutos</strong> &bull; Data: {selectedMeeting.scheduledDate}
                  </p>
                </div>

                {/* Big Timer */}
                <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="font-mono text-2xl font-black text-white tracking-wider">
                    {formatTime(timerSeconds)}
                  </span>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`p-2 rounded-lg text-white font-bold cursor-pointer transition-all ${
                        isTimerRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                      title={isTimerRunning ? 'Pausar' : 'Iniciar'}
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(0);
                      }}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      title="Reiniciar cronômetro"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Agenda items flow */}
              <div className="mt-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Blocos da Pauta de Reunião
                </h3>

                {selectedMeeting.agenda.map((item, index) => {
                  const isCurrent = activeItemIndex === index;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItemIndex(index)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-950/40 border-blue-600 ring-1 ring-blue-500/50 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {item.allocatedMinutes} min
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-2 pl-8 leading-relaxed">
                        {item.notes}
                      </p>

                      {/* Decision input */}
                      <div className="mt-3 pl-8">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Decisões tomadas neste bloco:
                        </label>
                        <input
                          type="text"
                          value={item.decisions || ''}
                          onChange={(e) => handleUpdateDecision(item.id, e.target.value)}
                          placeholder="Ex: Aprovada alocação de 2 especialistas para o projeto..."
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Meeting Minutes / Notes */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Ata Executiva & Encaminhamentos
              </h3>
              <textarea
                rows={4}
                value={selectedMeeting.meetingNotes || ''}
                onChange={(e) => handleUpdateNotes(e.target.value)}
                placeholder="Registre aqui as conclusões gerais, novos prazos acordados e observações da diretoria..."
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Column: Objection Simulator & Strategy Guide */}
          <div className="space-y-6">
            {/* Participants & Context */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" /> Participantes Convocados
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedMeeting.participants.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Objections & Recommended Responses */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Simulador de Objeções
                </h3>
                <span className="text-[10px] bg-amber-950/70 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full font-semibold">
                  Guia do Consultor
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Antecipe os questionamentos mais duros do cliente com respostas de alto impacto:
              </p>

              <div className="space-y-3">
                {selectedMeeting.objectionsAndAnswers.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-rose-300 flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold shrink-0">❓</span>
                      <span>"{item.objection}"</span>
                    </div>
                    <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        <strong className="text-emerald-400">Resposta:</strong> {item.recommendedResponse}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Presentation className="w-5 h-5 text-blue-400" />
              Criar Nova Pauta de Reunião
            </h2>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Título da Reunião *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Apresentação de Diagnóstico e Alinhamento"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Tipo de Sessão
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MeetingSimulation['type'])}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="results_presentation">Apresentação de Resultados</option>
                    <option value="diagnostic_kickoff">Kickoff de Diagnóstico</option>
                    <option value="status_steering">Comitê de Direção (Steering)</option>
                    <option value="crisis_alignment">Alinhamento Crítico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Duração Prevista (min)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Gerar Pauta Estruturada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
