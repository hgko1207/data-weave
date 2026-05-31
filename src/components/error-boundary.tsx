"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { WidgetError } from "@/components/widget/WidgetError";

// fallback은 정적 ReactNode 또는 함수(error, reset) 형태. 함수면 메시지/재시도 전달 가능.
type FallbackFn = (error: Error, reset: () => void) => ReactNode;

type Props = {
  children: ReactNode;
  fallback?: ReactNode | FallbackFn;
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
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return (fallback as FallbackFn)(this.state.error, this.reset);
      }
      return (
        fallback ?? (
          <WidgetError message={this.state.error.message} onRetry={this.reset} />
        )
      );
    }
    return this.props.children;
  }
}
