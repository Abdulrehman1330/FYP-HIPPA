import GlassCard from './GlassCard';
import Icon from './Icon';

const SlideOver = ({ open, onClose, title, children, width = 460 }) => {
  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(10,20,32,0.28)",
      backdropFilter: "blur(4px)",
      animation: "fadeIn 180ms ease both",
    }}>
      <GlassCard strong xl onClick={(e) => e.stopPropagation()} style={{
        position: "absolute", top: 12, right: 12, bottom: 12,
        width, maxWidth: "92vw",
        padding: 24, borderRadius: "var(--r-5)",
        display: "flex", flexDirection: "column",
        animation: "slideInRight 280ms cubic-bezier(0.22, 0.61, 0.36, 1) both",
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400 }}>{title}</h3>
          <button className="btn btn--ghost btn--icon" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", margin: "0 -8px", padding: "0 8px" }}>{children}</div>
      </GlassCard>
    </div>
  );
};

export default SlideOver;
