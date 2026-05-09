const ConfidenceBadge = ({ value }) => {
  const pct = Math.round(value * 100);
  const tier = value >= 0.85 ? "high" : value >= 0.6 ? "mid" : "low";

  return (
    <span className={`conf conf--${tier}`} title={`Confidence ${pct}%`}>
      <span className="meter"><i style={{ width: `${pct}%` }} /></span>
      {pct}%
    </span>
  );
};

export default ConfidenceBadge;
