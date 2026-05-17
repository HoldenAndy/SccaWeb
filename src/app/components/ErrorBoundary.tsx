import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f6ff] p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Algo salió mal</h2>
            <p className="text-sm text-slate-500 mb-4">Ocurrió un error inesperado. Intenta recargar la página.</p>
            {this.state.error && (
              <pre className="text-xs bg-slate-100 rounded-lg p-3 mb-4 text-left overflow-auto max-h-32 text-slate-600">
                {this.state.error.message}
              </pre>
            )}
            <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <RotateCcw size={14} />
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
