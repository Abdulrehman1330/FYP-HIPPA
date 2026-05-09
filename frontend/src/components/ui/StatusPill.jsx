export const STATUS_MAP = {
  UPLOADED:      { tone: "info",   label: "Uploaded" },
  PREPROCESSING: { tone: "info",   label: "Processing" },
  EXTRACTED:     { tone: "warn",   label: "Awaiting review" },
  IN_REVIEW:     { tone: "info",   label: "In review" },
  APPROVED:      { tone: "ok",     label: "Approved" },
  POC_GENERATED: { tone: "ok",     label: "POC generated" },
  RISK_SCORED:   { tone: "ok",     label: "Risk scored" },
  REJECTED:      { tone: "danger", label: "Rejected" },
  FAILED:        { tone: "danger", label: "Failed" },
};

const StatusPill = ({ status, withDot = true }) => {
  const m = STATUS_MAP[status] || { tone: "neutral", label: status };
  return (
    <span className={`pill pill--${m.tone}`}>
      {withDot && <span className="dot" />}
      {m.label}
    </span>
  );
};

export default StatusPill;
