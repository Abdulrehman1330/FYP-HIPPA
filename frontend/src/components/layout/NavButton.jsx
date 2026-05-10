import { Icon } from '../ui';

const NavButton = ({ item, active, onClick }) => (
  <button
    className={`nav-item ${active ? "active" : ""}`}
    onClick={onClick}
    data-label={item.label}
    title={item.label}
    style={{ border: 0, fontFamily: "inherit", textAlign: "left" }}
  >
    <Icon name={item.icon} size={15} className="ic" style={{ color: active ? "var(--accent)" : "var(--ink-3)" }} />
    <span>{item.label}</span>
    {item.count != null && <span className="count">{item.count}</span>}
  </button>
);

export default NavButton;
