import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-slate-900/90 rounded-2xl border border-rose-800/60 text-slate-100 max-w-3xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400 mb-3">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {this.props.fallbackTitle || 'Ocorreu um erro ao carregar este componente'}
              </h2>
              <p className="text-xs text-slate-400">
                Detalhes do erro: {this.state.error?.message || 'Erro inesperado de renderização'}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950 rounded-lg text-xs font-mono text-rose-300 border border-slate-800 overflow-x-auto max-h-40">
            {this.state.error?.stack || this.state.error?.toString()}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar Novamente
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 cursor-pointer transition-colors"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
