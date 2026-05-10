const GlassCard = ({ as: Tag = "div", className = "", strong, xl, sm, children, style, ...rest }) => {
  const cls = [
    "glass",
    strong && "glass--strong",
    xl && "glass--xl",
    sm && "glass--sm",
    className,
  ].filter(Boolean).join(" ");

  return <Tag className={cls} style={style} {...rest}>{children}</Tag>;
};

export default GlassCard;
