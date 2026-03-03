import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center animate-fade-in">
                        <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle className="h-8 w-8 text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Something went wrong</h2>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                            An unexpected error occurred in the application. We've been notified and are working on it.
                        </p>
                        {this.state.error && (
                            <div className="mb-8 p-4 bg-slate-50 rounded-xl text-left overflow-auto max-h-32">
                                <p className="text-xs font-mono text-slate-600 break-words">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
