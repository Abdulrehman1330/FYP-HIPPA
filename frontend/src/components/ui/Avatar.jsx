const Avatar = ({ name, size = 28, tone = "default" }) => {
  const initials = (name || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const seed = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = seed % 360;
  const bg = tone === "default"
    ? `linear-gradient(135deg, hsl(${hue} 50% 78%), hsl(${(hue + 40) % 360} 55% 70%))`
    : "var(--accent-soft)";

  return (
    <span style={{
      display: "inline-grid", placeItems: "center",
      width: size, height: size, borderRadius: "50%",
      background: bg,
      color: "var(--ink-1)",
      fontSize: size < 30 ? 10.5 : 12,
      fontWeight: 600,
      letterSpacing: 0.02,
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
      flexShrink: 0,
    }}>
      {initials}
    </span>
  );
};

export default Avatar;
