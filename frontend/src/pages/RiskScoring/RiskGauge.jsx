const RiskGauge = ({ score, klass }) => {
  const angle = -90 + score * 180;
  const color = klass === "high" ? "var(--danger)" : klass === "medium" ? "var(--warn)" : "var(--ok)";
  const r = 100, cx = 130, cy = 130;

  const arc = (start, end) => {
    const s = (Math.PI * start) / 180, e = (Math.PI * end) / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <div style={{ position: "relative", width: 260, height: 150, margin: "12px auto 0" }}>
      <svg viewBox="0 0 260 150" width="260" height="150">
        <path d={arc(180, 360)} stroke="var(--glass-inner)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={arc(180, 180 + score * 180)} stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 4px 12px " + color + ")" }} />
        <g transform={`rotate(${angle} ${cx} ${cy})`}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 14} stroke="var(--ink-1)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="var(--ink-1)" />
          <circle cx={cx} cy={cy} r="3" fill="var(--bg-base)" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center" }}>
        <div className="display" style={{ fontSize: 56, color, lineHeight: 1 }}>{score.toFixed(2)}</div>
        <div className="eyebrow" style={{ color, marginTop: 4 }}>{klass} risk</div>
      </div>
    </div>
  );
};

export default RiskGauge;
