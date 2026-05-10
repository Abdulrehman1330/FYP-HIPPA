const Icon = ({ name, size = 16, ...rest }) => {
  const s = { width: size, height: size, ...(rest.style || {}) };
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round", strokeLinejoin: "round",
    ...rest, style: s,
  };

  switch (name) {
    case "dashboard": return (<svg {...props}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>);
    case "upload":    return (<svg {...props}><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>);
    case "doc":       return (<svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>);
    case "review":    return (<svg {...props}><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>);
    case "poc":       return (<svg {...props}><path d="M9 11h6M9 15h4"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>);
    case "risk":      return (<svg {...props}><path d="m21 12-3 4-4-9-4 14-3-9H3"/></svg>);
    case "patients":  return (<svg {...props}><circle cx="9" cy="8" r="3.5"/><path d="M3 20c1.5-3.5 4-5 6-5s4.5 1.5 6 5"/><circle cx="17" cy="6" r="2.5"/><path d="M21 14c-.5-1.5-1.7-2.5-3-2.5"/></svg>);
    case "audit":     return (<svg {...props}><path d="M3 6h18M3 12h18M3 18h12"/></svg>);
    case "settings":  return (<svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>);
    case "search":    return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>);
    case "bell":      return (<svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>);
    case "plus":      return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>);
    case "check":     return (<svg {...props}><path d="m5 13 4 4L19 7"/></svg>);
    case "x":         return (<svg {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>);
    case "arrow-r":   return (<svg {...props}><path d="M5 12h14m-6-6 6 6-6 6"/></svg>);
    case "arrow-l":   return (<svg {...props}><path d="M19 12H5m6-6-6 6 6 6"/></svg>);
    case "chev-r":    return (<svg {...props}><path d="m9 6 6 6-6 6"/></svg>);
    case "chev-d":    return (<svg {...props}><path d="m6 9 6 6 6-6"/></svg>);
    case "warn":      return (<svg {...props}><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.7 3h16.96a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h0"/></svg>);
    case "info":      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h0"/></svg>);
    case "edit":      return (<svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>);
    case "drop":      return (<svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>);
    case "scan":      return (<svg {...props}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M21 7V5a2 2 0 0 0-2-2h-2"/><path d="M3 17v2a2 2 0 0 0 2 2h2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M3 12h18"/></svg>);
    case "flag":      return (<svg {...props}><path d="M4 21V4l9 3 6-3v11l-6 3-9-3"/></svg>);
    case "claim":     return (<svg {...props}><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="m9 21 3-3 3 3"/><path d="M12 14v7"/></svg>);
    case "comment":   return (<svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
    case "trend-up":  return (<svg {...props}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>);
    case "trend-dn":  return (<svg {...props}><path d="m3 7 6 6 4-4 8 8"/><path d="M14 17h7v-7"/></svg>);
    case "circle":    return (<svg {...props}><circle cx="12" cy="12" r="9"/></svg>);
    case "lock":      return (<svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>);
    case "user":      return (<svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>);
    case "logout":    return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>);
    case "filter":    return (<svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>);
    case "more":      return (<svg {...props}><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>);
    case "sparkle":   return (<svg {...props}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>);
    case "shield":    return (<svg {...props}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z"/></svg>);
    default: return null;
  }
};

export default Icon;
