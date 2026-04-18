import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from "react";

// Global error boundary to catch blank page crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", color: "red" }}>
          <h2>App crashed — check console</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register service worker for push notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration.scope);
      })
      .catch((error) => {
        console.log("SW registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
