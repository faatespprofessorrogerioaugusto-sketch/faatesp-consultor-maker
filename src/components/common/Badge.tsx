import React from 'react';
import { PriorityLevel, ProjectStatus, RiskClassification, TaskStatus, ActionStatus, OkrStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?:
    | 'blue'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'indigo'
    | 'purple'
    | 'slate'
    | 'teal';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    blue: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    indigo: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
    teal: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
  };

  const dotColors = {
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    indigo: 'bg-indigo-400',
    purple: 'bg-purple-400',
    slate: 'bg-slate-400',
    teal: 'bg-teal-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel | string; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'sm',
}) => {
  switch (priority) {
    case 'Crítica':
      return (
        <Badge variant="rose" size={size} dot>
          Crítica
        </Badge>
      );
    case 'Alta':
      return (
        <Badge variant="amber" size={size} dot>
          Alta
        </Badge>
      );
    case 'Média':
      return (
        <Badge variant="blue" size={size} dot>
          Média
        </Badge>
      );
    case 'Baixa':
    default:
      return (
        <Badge variant="slate" size={size} dot>
          Baixa
        </Badge>
      );
  }
};

export const RiskBadge: React.FC<{
  classification: RiskClassification | string;
  score?: number;
  size?: 'sm' | 'md';
}> = ({ classification, score, size = 'sm' }) => {
  const label = score !== undefined ? `${classification} (${score})` : classification;
  switch (classification) {
    case 'Crítico':
      return (
        <Badge variant="rose" size={size} dot>
          {label}
        </Badge>
      );
    case 'Alto':
      return (
        <Badge variant="amber" size={size} dot>
          {label}
        </Badge>
      );
    case 'Moderado':
      return (
        <Badge variant="blue" size={size} dot>
          {label}
        </Badge>
      );
    case 'Baixo':
    default:
      return (
        <Badge variant="emerald" size={size} dot>
          {label}
        </Badge>
      );
  }
};

export const StatusBadge: React.FC<{
  status: ProjectStatus | TaskStatus | ActionStatus | OkrStatus | string;
  size?: 'sm' | 'md';
}> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'Concluído':
    case 'Concluída':
    case 'Ativo':
    case 'Resolvido':
    case 'No Prazo':
      return (
        <Badge variant="emerald" size={size} dot>
          {status}
        </Badge>
      );
    case 'Em andamento':
    case 'Em Tratamento':
    case 'Em Ação':
      return (
        <Badge variant="blue" size={size} dot>
          {status}
        </Badge>
      );
    case 'Em revisão':
    case 'Em Investigação':
    case 'Em Risco':
    case 'Monitorar':
      return (
        <Badge variant="amber" size={size} dot>
          {status}
        </Badge>
      );
    case 'Atrasado':
    case 'Atrasada':
    case 'Cancelado':
    case 'Cancelada':
    case 'Resistente':
      return (
        <Badge variant="rose" size={size} dot>
          {status}
        </Badge>
      );
    case 'Planejamento':
    case 'Não iniciado':
    case 'Não iniciada':
    case 'Pendente':
    case 'Prospect':
    default:
      return (
        <Badge variant="slate" size={size} dot>
          {status}
        </Badge>
      );
  }
};
