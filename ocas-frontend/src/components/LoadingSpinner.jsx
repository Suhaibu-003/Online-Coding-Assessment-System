export default function LoadingSpinner({ text = "Loading...", fullScreen = false }) {
  return (
    <div className={fullScreen ? "loading-full" : "loading-overlay"}>
      <div className="loading-card" role="status" aria-live="polite">
        <div className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
        <span className="fw-semibold" style={{ fontSize: "0.92rem" }}>{text}</span>
      </div>
    </div>
  );
}
