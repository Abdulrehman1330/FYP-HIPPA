import GlassCard from './GlassCard';
import Icon from './Icon';

const Modal = ({ open, onClose, title, children, footer, width = 520 }) => {
  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(10,20,32,0.32)",
      backdropFilter: "blur(6px)",
      display: "grid", placeItems: "center",
      animation: "fadeIn 200ms ease both",
    }}>
      <GlassCard strong xl onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: "90vw",
        padding: 24, borderRadius: "var(--r-5)",
        animation: "scaleIn 240ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400 }}>{title}</h3>
          <button className="btn btn--ghost btn--icon" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div>{children}</div>
        {footer && (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--glass-border-soft)" }}>
            {footer}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Modal;
