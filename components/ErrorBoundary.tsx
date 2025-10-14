import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleClearAndReload = () => {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.error("Failed to clear storage:", e);
    } finally {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          <div className="max-w-lg text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h1>
            <p className="mb-6">The application has encountered a critical error and cannot continue.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This might be due to corrupted session data. Clearing the session and reloading the page often fixes this issue.
            </p>
            <button
              onClick={this.handleClearAndReload}
              className="btn-primary"
            >
              Clear Session and Reload
            </button>
            <details className="mt-6 text-left text-xs text-slate-400">
              <summary>Error Details</summary>
              <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
