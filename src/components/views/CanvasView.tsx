import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { CanvasBlockKey, CanvasItem } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Layout,
  Plus,
  Edit2,
  Trash2,
  Maximize2,
  Handshake,
  CheckCircle,
  Cpu,
  Gem,
  HeartHandshake,
  Radio,
  Users,
  DollarSign,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const CanvasView: React.FC = () => {
  const {
    currentProject,
    currentProjectCanvas,
    addCanvasItem,
    updateCanvasItem,
    deleteCanvasItem,
  } = useConsulting();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CanvasItem | null>(null);

  const [formData, setFormData] = useState<{
    blockKey: CanvasBlockKey;
    text: string;
    description: string;
    color: string;
  }>({
    blockKey: 'value_propositions',
    text: '',
    description: '',
    color: 'yellow',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentProject) {
    return <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Selecione um projeto primeiro.</div>;
  }

  const canvasBlocks: {
    key: CanvasBlockKey;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    bgHeader: string;
  }[] = [
    {
      key: 'key_partners',
      title: 'Parcerias Principais',
      subtitle: 'Quem são os parceiros e fornecedores estratégicos?',
      icon: <Handshake className="w-4 h-4 text-blue-400" />,
      color: 'border-slate-800',
      bgHeader: 'bg-slate-950',
    },
    {
      key: 'key_activities',
      title: 'Atividades Principais',
      subtitle: 'Quais ações críticas são necessárias?',
      icon: <CheckCircle className="w-4 h-4 text-indigo-400" />,
      color: 'border-slate-800',
      bgHeader: 'bg-slate-950',
    },
    {
      key: 'key_resources',
      title: 'Recursos Principais',
      subtitle: 'Quais ativos físicos, humanos e tecnológicos?',
      icon: <Cpu className="w-4 h-4 text-slate-400" />,
      color: 'border-slate-800',
      bgHeader: 'bg-slate-950',
    },
    {
      key: 'value_propositions',
      title: 'Proposta de Valor',
      subtitle: 'Qual valor entregamos ao cliente? Quais dores resolvemos?',
      icon: <Gem className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-900/60',
      bgHeader: 'bg-amber-950/40',
    },
    {
      key: 'customer_relationships',
      title: 'Relacionamento com Clientes',
      subtitle: 'Como interagimos e retemos cada segmento?',
      icon: <HeartHandshake className="w-4 h-4 text-rose-400" />,
      color: 'border-slate-800',
      bgHeader: 'bg-slate-950',
    },
    {
      key: 'channels',
      title: 'Canais de Distribuição',
      subtitle: 'Por onde alcançamos e entregamos a solução?',
      icon: <Radio className="w-4 h-4 text-teal-400" />,
      color: 'border-slate-800',
      bgHeader: 'bg-slate-950',
    },
    {
      key: 'customer_segments',
      title: 'Segmentos de Clientes',
      subtitle: 'Para quem estamos criando valor?',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      color: 'border-slate-800',
      bgHeader: 'bg-slate-950',
    },
    {
      key: 'cost_structure',
      title: 'Estrutura de Custos',
      subtitle: 'Quais são os custos mais relevantes do modelo?',
      icon: <Receipt className="w-4 h-4 text-rose-400" />,
      color: 'border-slate-800',
      bgHeader: 'bg-slate-950',
    },
    {
      key: 'revenue_streams',
      title: 'Fontes de Receita',
      subtitle: 'Como o modelo gera faturamento e monetização?',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      color: 'border-slate-800',
      bgHeader: 'bg-slate-950',
    },
  ];

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-amber-950/60 text-amber-100 border-amber-800/80 shadow-sm';
      case 'blue':
        return 'bg-blue-950/60 text-blue-100 border-blue-800/80 shadow-sm';
      case 'green':
        return 'bg-emerald-950/60 text-emerald-100 border-emerald-800/80 shadow-sm';
      case 'rose':
        return 'bg-rose-950/60 text-rose-100 border-rose-800/80 shadow-sm';
      case 'purple':
        return 'bg-purple-950/60 text-purple-100 border-purple-800/80 shadow-sm';
      default:
        return 'bg-amber-950/60 text-amber-100 border-amber-800/80 shadow-sm';
    }
  };

  const openCreateModal = (blockKey: CanvasBlockKey = 'value_propositions') => {
    setEditingItem(null);
    setFormData({
      blockKey,
      text: '',
      description: '',
      color: 'yellow',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: CanvasItem) => {
    setEditingItem(item);
    setFormData({
      blockKey: item.blockKey,
      text: item.text,
      description: item.description || '',
      color: item.color || 'yellow',
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;

    if (editingItem) {
      updateCanvasItem(editingItem.id, {
        blockKey: formData.blockKey,
        text: formData.text,
        description: formData.description,
        color: formData.color,
      });
    } else {
      addCanvasItem({
        projectId: currentProject.id,
        blockKey: formData.blockKey,
        text: formData.text,
        description: formData.description,
        color: formData.color,
      });
    }
    setIsModalOpen(false);
  };

  const renderCanvasBlock = (blockKey: CanvasBlockKey, minH: string = 'min-h-[220px]') => {
    const config = canvasBlocks.find((b) => b.key === blockKey)!;
    const items = currentProjectCanvas.filter((i) => i.blockKey === blockKey);

    return (
      <div
        key={blockKey}
        className={`bg-slate-900 rounded-xl border ${config.color} shadow-sm flex flex-col justify-between overflow-hidden ${minH}`}
      >
        <div className={`p-3.5 ${config.bgHeader} border-b ${config.color} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {config.icon}
            <div>
              <h3 className="font-bold text-xs text-slate-100 leading-none">{config.title}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => openCreateModal(blockKey)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title={`Adicionar nota em ${config.title}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-64">
          {items.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-6 text-center italic">
              Nenhuma nota adicionada.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-lg border text-xs transition-all space-y-1 ${getColorClass(
                  item.color
                )}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="font-bold leading-snug">{item.text}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-0.5 text-slate-400 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className="text-[10px] opacity-80 leading-tight">{item.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-100">
      <Breadcrumbs
        title="Business Model Canvas (Modelo de Negócio / Solução)"
        subtitle="Visão sistêmica em 9 blocos estratégicos: Proposta de Valor, Clientes, Operação e Finanças"
        actions={
          <>
            <button
              onClick={() => openCreateModal('value_propositions')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Nota ao Canvas
            </button>
          </>
        }
      />

      {/* CLASSIC 9-BOX CANVAS GRID */}
      <div className="space-y-4">
        {/* Top 5 Structural Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Col 1: Parcerias Principais (Full Height) */}
          <div className="md:col-span-1">{renderCanvasBlock('key_partners', 'min-h-[460px]')}</div>

          {/* Col 2: Atividades Principais (Top) + Recursos Principais (Bottom) */}
          <div className="md:col-span-1 flex flex-col gap-4">
            {renderCanvasBlock('key_activities', 'min-h-[220px]')}
            {renderCanvasBlock('key_resources', 'min-h-[220px]')}
          </div>

          {/* Col 3: Proposta de Valor (Center Core, Full Height) */}
          <div className="md:col-span-1">
            {renderCanvasBlock('value_propositions', 'min-h-[460px]')}
          </div>

          {/* Col 4: Relacionamento com Clientes (Top) + Canais (Bottom) */}
          <div className="md:col-span-1 flex flex-col gap-4">
            {renderCanvasBlock('customer_relationships', 'min-h-[220px]')}
            {renderCanvasBlock('channels', 'min-h-[220px]')}
          </div>

          {/* Col 5: Segmentos de Clientes (Full Height) */}
          <div className="md:col-span-1">
            {renderCanvasBlock('customer_segments', 'min-h-[460px]')}
          </div>
        </div>

        {/* Bottom 2 Financial Blocks: Custos & Receitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderCanvasBlock('cost_structure', 'min-h-[180px]')}
          {renderCanvasBlock('revenue_streams', 'min-h-[180px]')}
        </div>
      </div>

      {/* Modal Add / Edit Canvas Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-750 overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-100">
                {editingItem ? 'Editar Nota do Canvas' : 'Adicionar Nota ao Canvas'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Bloco do Canvas <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.blockKey}
                  onChange={(e) =>
                    setFormData({ ...formData, blockKey: e.target.value as CanvasBlockKey })
                  }
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none"
                >
                  {canvasBlocks.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Texto Principal do Post-it <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Ex: Plataforma self-service integrada"
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Detalhamento ou Hipótese
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explique o racional desta nota."
                  className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Cor do Cartão
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { key: 'yellow', label: 'Amarelo', bg: 'bg-amber-400' },
                    { key: 'blue', label: 'Azul', bg: 'bg-blue-400' },
                    { key: 'green', label: 'Verde', bg: 'bg-emerald-400' },
                    { key: 'rose', label: 'Rosa', bg: 'bg-rose-400' },
                    { key: 'purple', label: 'Roxo', bg: 'bg-purple-400' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.key })}
                      className={`w-7 h-7 rounded-full ${c.bg} border-2 transition-all cursor-pointer ${
                        formData.color === c.key ? 'border-white scale-110 ring-2 ring-blue-500' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
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
                  Salvar no Canvas
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
            deleteCanvasItem(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Remover Nota do Canvas?"
        message="Tem certeza que deseja remover esta nota do modelo de negócio?"
        confirmText="Sim, Remover"
      />
    </div>
  );
};
