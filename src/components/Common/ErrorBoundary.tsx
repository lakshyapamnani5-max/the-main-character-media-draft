import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    if (window.confirm('Reset local temporary state and reload? Your cloud saved data will be re-synced.')) {
      try {
        const preserveKeys = ['tmc_custom_firebase_credentials'];
        const preserved: Record<string, string> = {};
        preserveKeys.forEach(k => {
          const val = localStorage.getItem(k);
          if (val) preserved[k] = val;
        });

        localStorage.clear();

        Object.entries(preserved).forEach(([k, v]) => {
          localStorage.setItem(k, v);
        });
      } catch {
        // ignore
      }
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-white border border-[#E8E3D9] rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 text-center">
            
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-[#C58B39]/30 flex items-center justify-center text-[#C58B39]">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#C58B39] font-bold">
                The Main Character Media
              </span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900">
                Application Recovered
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                A display error was prevented from causing a blank screen. You can refresh or reset cache to resume normal operations.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-left text-[11px] font-mono text-neutral-700 max-h-32 overflow-y-auto">
                <span className="font-bold text-rose-600 block mb-0.5">Details:</span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 bg-[#121212] hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto py-2.5 px-4 bg-white hover:bg-rose-50 border border-[#E8E3D9] hover:border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Wipe stale cache and re-sync"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Cache</span>
              </button>
            </div>

            <div className="pt-2 text-[10px] text-neutral-400 font-mono">
              Production ERP · Safety Shield Active
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
