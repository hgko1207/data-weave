"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { WidgetError } from "@/components/widget/WidgetError";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = { error: Error | null };

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    console.error("[widget] uncaught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <WidgetError message={this.state.error.message} onRetry={this.reset} />
        )
      );
    }
    return this.props.children;
  }
}
