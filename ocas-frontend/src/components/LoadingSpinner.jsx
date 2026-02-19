export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="spinner-border" role="status" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
