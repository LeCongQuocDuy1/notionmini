import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="h-screen flex flex-col items-center justify-center gap-4"
          style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
        >
          <p className="text-4xl select-none">⚠️</p>
          <h1 className="text-lg font-semibold">Đã xảy ra lỗi không mong muốn</h1>
          <p className="text-sm max-w-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            {this.state.error?.message ?? 'Lỗi không xác định'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-2 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
