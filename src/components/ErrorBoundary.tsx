import React from 'react';
import { isChunkLoadFailure } from '../lib/setupDeployRecovery';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-xl font-semibold text-text">
              {this.props.fallbackTitle ?? 'Something went wrong'}
            </h2>
            <p className="text-sm text-muted">
              {this.state.error.message || 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-off px-4 py-2 text-sm font-medium text-text transition-colors duration-150 hover:bg-bg active:scale-[0.97]"
              onClick={() => {
                if (isChunkLoadFailure(this.state.error)) {
                  window.location.reload();
                  return;
                }
                this.handleReset();
              }}
            >
              {isChunkLoadFailure(this.state.error) ? 'Reload page' : 'Try again'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
