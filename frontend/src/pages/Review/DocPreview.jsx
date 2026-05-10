const DocPreview = ({ fields }) => (
  <div style={{
    background: "white", borderRadius: 6, padding: 28,
    fontFamily: "Georgia, serif", color: "#222", fontSize: 12,
    boxShadow: "0 8px 24px -8px rgba(0,0,0,0.18)",
    maxWidth: 460, margin: "0 auto",
  }}>
    <div style={{ textAlign: "center", borderBottom: "2px solid #222", paddingBottom: 8, marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>OASIS-E2 ALL ITEMS INSTRUMENT</div>
      <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Outcome and Assessment Information Set — Version E2</div>
    </div>
    {[
      ["M0040 — Patient Name", "patient_name"],
      ["M0066 — Birth Date", "date_of_birth"],
      ["M0020 — Patient ID", "patient_id"],
      ["M0030 — Start of Care Date", "soc_date"],
      ["M0050 — State", "state"],
      ["M0060 — ZIP Code", "zip"],
      ["M1021 — Primary Diagnosis (ICD-10)", "primary_icd10"],
      ["M1023 — Other Diagnoses", "secondary_dx"],
      ["M1100 — Living Situation", "living_situation"],
    ].map(([lbl, key]) => {
      const f = fields.find(x => x.key === key);
      const isLow = f && f.confidence < 0.6;
      return (
        <div key={key} style={{ marginBottom: 10, padding: "4px 6px", borderRadius: 3, background: isLow ? "rgba(201,138,42,0.18)" : "transparent", border: isLow ? "1px dashed rgba(201,138,42,0.55)" : "1px solid transparent" }}>
          <div style={{ fontSize: 9.5, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</div>
          <div style={{ fontFamily: "Courier New, monospace", fontSize: 12, marginTop: 2, borderBottom: "1px dotted #999", paddingBottom: 2 }}>{f?.value || "—"}</div>
        </div>
      );
    })}
    <div style={{ textAlign: "center", color: "#999", fontSize: 9.5, marginTop: 16 }}>— Page 1 of 4 —</div>
  </div>
);

export default DocPreview;
