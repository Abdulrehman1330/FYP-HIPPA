import { useEffect } from 'react';
import GlassCard from './GlassCard';
import Icon from './Icon';

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const iconName = toast.kind === "ok" ? "check" : toast.kind === "danger" ? "warn" : "info";
  const color = toast.kind === "ok" ? "ok" : toast.kind === "danger" ? "danger" : "info";

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 60, animation: "fadeUp 240ms var(--ease) both",
    }}>
      <GlassCard strong style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name={iconName} size={16} style={{ color: `var(--${color})` }} />
        <span style={{ fontSize: 13 }}>{toast.text}</span>
      </GlassCard>
    </div>
  );
};

export default Toast;
