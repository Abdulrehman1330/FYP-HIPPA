import { useState, useEffect } from 'react';
import { Icon, ConfidenceBadge } from '../../components/ui';

const FieldRow = ({ field, editing, onEdit, onSave, onCancel }) => {
  const [v, setV] = useState(field.value);
  useEffect(() => setV(field.value), [field.value, editing]);

  const isLow = field.confidence < 0.6;

  return (
    <div style={{
      padding: "12px 18px", borderBottom: "1px solid var(--glass-border-soft)",
      background: isLow && !field.edited ? "color-mix(in srgb, var(--warn-bg) 35%, transparent)" : "transparent",
      transition: "background var(--t-fast)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", padding: "1px 6px", background: "var(--glass-inner)", borderRadius: 4 }}>{field.oasis}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{field.label}</span>
          {field.edited && <span className="pill pill--info" style={{ height: 16, fontSize: 9.5 }}><Icon name="edit" size={9} />edited</span>}
        </div>
        <ConfidenceBadge value={field.confidence} />
      </div>
      {editing ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input className="input" autoFocus value={v} onChange={(e) => setV(e.target.value)} style={{ height: 32 }} />
          <button className="btn btn--sm btn--primary" onClick={() => onSave(v)}><Icon name="check" size={11} /></button>
          <button className="btn btn--sm btn--ghost" onClick={onCancel}><Icon name="x" size={11} /></button>
        </div>
      ) : (
        <div onClick={onEdit} style={{ fontSize: 13, color: "var(--ink-1)", cursor: "text", padding: "6px 10px", background: "var(--glass-inner)", borderRadius: 6, fontFamily: "var(--font-mono)" }}>
          {field.value || <span className="dim">— missing —</span>}
        </div>
      )}
      {field.warn && !field.edited && (
        <div style={{ fontSize: 11, color: "var(--warn)", display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
          <Icon name="flag" size={10} /> {field.warn}
        </div>
      )}
    </div>
  );
};

export default FieldRow;
