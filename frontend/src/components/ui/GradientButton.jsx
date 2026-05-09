import Icon from './Icon';

const GradientButton = ({ children, icon, iconRight, variant, size, onClick, type, disabled, block, className = "" }) => {
  const cls = [
    "btn",
    variant === "primary" && "btn--primary",
    variant === "ghost" && "btn--ghost",
    variant === "danger" && "btn--danger",
    size === "sm" && "btn--sm",
    size === "lg" && "btn--lg",
    block && "btn--block",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button className={cls} onClick={onClick} type={type} disabled={disabled}>
      {icon && <Icon name={icon} size={size === "lg" ? 16 : 14} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 16 : 14} />}
    </button>
  );
};

export default GradientButton;
