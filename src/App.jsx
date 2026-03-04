import { useState, useEffect } from "react";

const inspections = [
  { id: 1, date: "04/12/2023", turbine: "T-108", severity: "HIGH", status: "Open", drone: "DR-501", gps: "(28.023, -23.678)", confidence: 87, image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80" },
  { id: 2, date: "04/10/2023", turbine: "T-122", severity: "HIGH", status: "Open", drone: "DR-502", gps: "(28.031, -23.690)", confidence: 92, image: "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&q=80" },
  { id: 3, date: "04/09/2023", turbine: "T-132", severity: "MEDIUM", status: "Closed", drone: "DR-498", gps: "(28.015, -23.661)", confidence: 74, image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&q=80" },
  { id: 4, date: "04/08/2023", turbine: "T-138", severity: "LOW", status: "Open", drone: "DR-495", gps: "(28.009, -23.645)", confidence: 61, image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80" },
  { id: 5, date: "04/07/2023", turbine: "T-101", severity: "HIGH", status: "Open", drone: "DR-490", gps: "(27.998, -23.622)", confidence: 95, image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80" },
  { id: 6, date: "04/06/2023", turbine: "T-115", severity: "LOW", status: "Closed", drone: "DR-488", gps: "(28.044, -23.710)", confidence: 55, image: "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&q=80" },
];

const workOrders = [
  { id: "WO-2092341", turbine: "T-107", severity: "HIGH", team: "Team A", status: "Open" },
  { id: "WO-6789123", turbine: "T-107", severity: "MEDIUM", team: "Team B", status: "Closed" },
  { id: "WO-5874635", turbine: "T-107", severity: "MEDIUM", team: "Team B", status: "FAILED" },
  { id: "WO-6830417", turbine: "T-022", severity: "LOW", team: "Team D", status: "Open" },
  { id: "WO-1234567", turbine: "T-108", severity: "HIGH", team: "Team A", status: "Open" },
  { id: "WO-9988776", turbine: "T-122", severity: "HIGH", team: "Team C", status: "Open" },
];

const severityConfig = {
  HIGH: { bg: "#ef4444", text: "white", label: "HIGH" },
  MEDIUM: { bg: "#f97316", text: "white", label: "medium" },
  LOW: { bg: "#22c55e", text: "white", label: "low" },
};

const Badge = ({ severity, style = {} }) => {
  const cfg = severityConfig[severity] || severityConfig.LOW;
  return (
    <span style={{
      background: cfg.bg, color: cfg.text,
      padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.04em", fontFamily: "monospace", ...style
    }}>{cfg.label}</span>
  );
};

const StatusPill = ({ status }) => {
  const colors = {
    Open: { bg: "#e8f4fd", color: "#2563eb" },
    Closed: { bg: "#f0fdf4", color: "#16a34a" },
    FAILED: { bg: "#fef2f2", color: "#dc2626" },
  };
  const c = colors[status] || colors.Open;
  return (
    <span style={{ background: c.bg, color: c.color, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{status}</span>
  );
};

// ─── PANEL 1: Inspection Dashboard ───────────────────────────────────────────
function InspectionDashboard({ onSelectInspection }) {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const rowsPerPage = 4;

  const filtered = inspections.filter(r =>
    r.turbine.toLowerCase().includes(search.toLowerCase()) ||
    r.severity.toLowerCase().includes(search.toLowerCase()) ||
    r.status.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const exportCSV = () => {
    const header = "Date,Turbine ID,Severity,Status\n";
    const rows = inspections.map(r => `${r.date},${r.turbine},${r.severity},${r.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "inspections.csv"; a.click();
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px", fontFamily: "'IBM Plex Sans', sans-serif", minWidth: 340, flex: 1 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 14, letterSpacing: "-0.01em" }}>Inspection Dashboard</div>

      {/* Top bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "#374151", flex: 1, cursor: "pointer" }}>
          {["Last 7 Days","Last 30 Days","Last 3 Months","Last 6 Months","Last 12 Months","Last 24 Months"].map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={exportCSV} style={{ background: "#111", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Export CSV ▾</button>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>Filters</div>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search turbine, severity…" style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 10px", fontSize: 12, flex: 1, outline: "none" }} />
        <button onClick={() => { setSearch(""); setPage(1); }} style={{ background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "#6b7280" }}>Reset</button>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["", "Date", "Turbine ID", "Severity", "Status"].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb", fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr key={row.id} onClick={() => onSelectInspection(row)} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "6px 10px" }}>
                  <div style={{ width: 36, height: 28, borderRadius: 4, overflow: "hidden" }}>
                    <img src={row.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </td>
                <td style={{ padding: "6px 10px", color: "#374151" }}>{row.date}</td>
                <td style={{ padding: "6px 10px", color: "#374151", fontWeight: 500 }}>{row.turbine}</td>
                <td style={{ padding: "6px 10px" }}><Badge severity={row.severity} /></td>
                <td style={{ padding: "6px 10px", color: "#6b7280" }}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: "#6b7280" }}>Select Page</span>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ width: 22, height: 22, borderRadius: 4, border: page === p ? "2px solid #2563eb" : "1px solid #d1d5db", background: page === p ? "#eff6ff" : "#fff", color: page === p ? "#2563eb" : "#374151", fontSize: 11, fontWeight: page === p ? 700 : 400, cursor: "pointer" }}>{p}</button>
        ))}
      </div>

      {/* Photo picker */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
        {inspections.slice(0, 3).map((r, i) => (
          <div key={r.id} onClick={() => setSelectedPhoto(selectedPhoto === r.id ? null : r.id)} style={{ width: 52, height: 40, borderRadius: 6, overflow: "hidden", cursor: "pointer", border: selectedPhoto === r.id ? "2px solid #2563eb" : "2px solid transparent", transition: "border 0.15s" }}>
            <img src={r.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
        <button style={{ background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "#374151" }}>Select Photo ▾</button>
      </div>

      {/* Notes */}
      <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px", fontSize: 11.5, color: "#374151", lineHeight: 1.7 }}>
        <div><b>1. Date Range</b></div>
        <div style={{ paddingLeft: 14 }}>a. Supports up to 24-month range (Query Time &lt; 2 Seconds)</div>
        <div><b>2. Export Data Range to CSV</b></div>
        <div><b>3. Audit log is up to 5,000 records</b></div>
        <div><b>4. Table supports 10,000 records</b></div>
      </div>
    </div>
  );
}

// ─── PANEL 2: Inspection Detail & Defect Review ───────────────────────────────
function DefectReview({ inspection, onClose }) {
  const [finderNotes, setFinderNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [metaOpen, setMetaOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Metadata");

  const handleUpdate = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!inspection) {
    return (
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, fontFamily: "'IBM Plex Sans', sans-serif", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", gap: 8 }}>
        <div style={{ fontSize: 40 }}>🔍</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Select an inspection to review</div>
        <div style={{ fontSize: 12 }}>Click any row in the dashboard</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", fontFamily: "'IBM Plex Sans', sans-serif", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Inspection Detail &amp; Defect Review</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>Export CSV ▾</button>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 16 }}>✕</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left column */}
        <div style={{ flex: 1, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
            {["Metadata"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 18px", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", color: activeTab === tab ? "#2563eb" : "#6b7280", borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent" }}>{tab}</button>
            ))}
            <div style={{ marginLeft: "auto", padding: "8px 14px" }}>
              <button onClick={() => setMetaOpen(!metaOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 16 }}>☰</button>
            </div>
          </div>

          {/* Image */}
          <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
            <img src={inspection.image} alt="turbine" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: "30%", left: "55%", width: 60, height: 50, border: "2.5px solid #ef4444", borderRadius: 3, boxShadow: "0 0 0 1px rgba(239,68,68,0.3)" }} />
            <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, borderRadius: 4, padding: "2px 7px" }}>AI Detected</div>
          </div>

          {/* Meta fields */}
          <div style={{ padding: "14px 16px", fontSize: 12, color: "#374151", lineHeight: 2 }}>
            <div><span style={{ color: "#6b7280" }}>Date:</span> <b>{inspection.date}, 10:10AM</b></div>
            <div><span style={{ color: "#6b7280" }}>Drone:</span> <b>{inspection.drone}</b></div>
            <div><span style={{ color: "#6b7280" }}>Turbine:</span> <b>{inspection.turbine}</b></div>
            <div><span style={{ color: "#6b7280" }}>GPS Coordinate:</span> <b>{inspection.gps}</b></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#6b7280" }}>Severity:</span> <Badge severity={inspection.severity} /></div>
          </div>

          {/* AI Confidence bar */}
          <div style={{ padding: "0 16px 14px" }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>AI Confidence: {inspection.confidence}%</div>
            <div style={{ background: "#e5e7eb", borderRadius: 99, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${inspection.confidence}%`, height: "100%", background: inspection.confidence > 80 ? "#22c55e" : inspection.confidence > 60 ? "#f97316" : "#ef4444", borderRadius: 99, transition: "width 0.6s ease" }} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", alignItems: "center" }}>
            <div style={{ padding: "10px 18px", fontSize: 12, fontWeight: 600, color: "#2563eb", borderBottom: "2px solid #2563eb" }}>Metadata</div>
            <div style={{ marginLeft: "auto", padding: "8px 14px", color: "#6b7280", cursor: "pointer" }}>☰</div>
          </div>

          <div style={{ padding: "14px 16px", fontSize: 12, color: "#374151", lineHeight: 2 }}>
            <div><span style={{ color: "#6b7280" }}>Timestamp:</span></div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{inspection.date} 10:10AM</div>
            <div style={{ marginTop: 8 }}><span style={{ color: "#6b7280" }}>Drone ID:</span> <b>{inspection.drone}</b></div>
            <div><span style={{ color: "#6b7280" }}>Turbine ID:</span> <b>{inspection.turbine}</b></div>
            <div><span style={{ color: "#6b7280" }}>GPS:</span> <b>{inspection.gps}</b></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ color: "#6b7280" }}>Severity:</span>
              <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 16 }}>{inspection.severity}</span>
            </div>
          </div>

          <div style={{ padding: "0 16px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: "#374151" }}>Finder Notes:</div>
            <textarea value={finderNotes} onChange={e => setFinderNotes(e.target.value)} placeholder="Add inspection notes…" style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 10px", fontSize: 12, resize: "none", outline: "none", fontFamily: "inherit", minHeight: 80 }} />
          </div>

          <div style={{ padding: "0 16px 16px" }}>
            <button onClick={handleUpdate} style={{ width: "100%", background: saved ? "#22c55e" : "#92400e", color: "#fff", border: "none", borderRadius: 7, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background 0.3s" }}>
              {saved ? "✓ Updated!" : "Update Defect Inspection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PANEL 3: Work Order Synchronization ─────────────────────────────────────
function WorkOrderSync() {
  const [orders, setOrders] = useState(workOrders);
  const [syncMode, setSyncMode] = useState("1 Manual Sync");
  const [syncing, setSyncing] = useState(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const perPage = 4;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSync = (id) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: o.status === "FAILED" ? "Open" : o.status } : o));
      showToast(`Work order ${id} synced successfully`);
    }, 1500);
  };

  const handleDelete = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    showToast(`Work order ${id} deleted`, "warn");
  };

  const paginated = orders.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(orders.length / perPage);

  const exportCSV = () => {
    const header = "Work Order ID,Turbine ID,Severity,Assigned Team,Status\n";
    const rows = orders.map(o => `${o.id},${o.turbine},${o.severity},${o.team},${o.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "work-orders.csv"; a.click();
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px", fontFamily: "'IBM Plex Sans', sans-serif", flex: 1, position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "absolute", top: 12, right: 12, background: toast.type === "warn" ? "#fef3c7" : "#f0fdf4", border: `1px solid ${toast.type === "warn" ? "#fcd34d" : "#86efac"}`, color: toast.type === "warn" ? "#92400e" : "#166534", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: "opacity 0.3s" }}>
          {toast.type === "warn" ? "⚠️" : "✓"} {toast.msg}
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 14, letterSpacing: "-0.01em" }}>Work Order Synchronization</div>

      {/* Header controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>DFMS</div>
        <div style={{ flex: 1 }} />
        <select value={syncMode} onChange={e => setSyncMode(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>
          <option>1 Manual Sync</option>
          <option>Auto Sync (5 min)</option>
          <option>Auto Sync (15 min)</option>
        </select>
      </div>

      <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 10 }}>Work Orders</div>

      {/* Table */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Work Order ID", "Turbine ID", "Severity", "Assigned Team", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb", fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(order => (
              <tr key={order.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "7px 10px", color: "#2563eb", fontFamily: "monospace", fontSize: 11, fontWeight: 600 }}>{order.id}</td>
                <td style={{ padding: "7px 10px", color: "#374151" }}>{order.turbine}</td>
                <td style={{ padding: "7px 10px" }}><Badge severity={order.severity} /></td>
                <td style={{ padding: "7px 10px", color: "#374151" }}>{order.team}</td>
                <td style={{ padding: "7px 10px" }}>
                  {order.status === "FAILED" ? (
                    <span style={{ background: "#fef2f2", color: "#dc2626", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>FAILED</span>
                  ) : (
                    <StatusPill status={order.status} />
                  )}
                </td>
                <td style={{ padding: "7px 10px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleSync(order.id)} title="Sync" style={{ background: syncing === order.id ? "#dbeafe" : "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 5, width: 28, height: 26, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {syncing === order.id ? "⟳" : "👁"}
                    </button>
                    <button onClick={() => handleDelete(order.id)} title="Delete" style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 5, width: 28, height: 26, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination + export */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: "#6b7280" }}>{orders.length.toLocaleString()} records</span>
        <div style={{ flex: 1 }} />
        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ width: 22, height: 22, borderRadius: 4, border: page === p ? "2px solid #2563eb" : "1px solid #d1d5db", background: page === p ? "#eff6ff" : "#fff", color: page === p ? "#2563eb" : "#374151", fontSize: 11, fontWeight: page === p ? 700 : 400, cursor: "pointer" }}>{p}</button>
        ))}
        <button onClick={exportCSV} style={{ background: "#111", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", marginLeft: 4 }}>↑ Export</button>
      </div>

      {/* Notes */}
      <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px", fontSize: 11.5, color: "#374151", lineHeight: 1.75 }}>
        <div><b>1. Automated retries</b></div>
        <div style={{ paddingLeft: 14 }}>a. Automated retries happen within 5 minutes if sync fails</div>
        <div style={{ paddingLeft: 14 }}>b. Failures are red-flagged</div>
        <div style={{ paddingLeft: 14 }}>c. Manual sync option available</div>
        <div><b>2. Export CSV</b></div>
        <div style={{ paddingLeft: 14 }}>a. Export up to 5,000 records within 10 seconds</div>
        <div style={{ paddingLeft: 14 }}>b. Audit logs record export actions for compliance</div>
        <div><b>3. Role-Based Access Control</b></div>
        <div style={{ paddingLeft: 14 }}>a. Only authorized roles can trigger certain actions</div>
        <div style={{ paddingLeft: 14 }}>b. Automated sync functions are protected by RBAC policies</div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [activePanel, setActivePanel] = useState("all");

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Top nav */}
      <div style={{ background: "#0f172a", padding: "12px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>⟨ WindVision <span style={{ color: "#60a5fa" }}>DFMS</span></div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {[["all", "All Panels"], ["dash", "Dashboard"], ["detail", "Detail Review"], ["work", "Work Orders"]].map(([key, label]) => (
            <button key={key} onClick={() => setActivePanel(key)} style={{ background: activePanel === key ? "#1e40af" : "rgba(255,255,255,0.08)", color: activePanel === key ? "#fff" : "#94a3b8", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: activePanel === key ? 600 : 400, transition: "all 0.15s" }}>{label}</button>
          ))}
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
        <span style={{ color: "#94a3b8", fontSize: 11 }}>Live</span>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px", display: "flex", gap: 16, flexWrap: activePanel === "all" ? "wrap" : "nowrap", alignItems: "flex-start" }}>
        {(activePanel === "all" || activePanel === "dash") && (
          <InspectionDashboard onSelectInspection={(r) => { setSelectedInspection(r); if (activePanel !== "all") setActivePanel("detail"); }} />
        )}
        {(activePanel === "all" || activePanel === "detail") && (
          <DefectReview inspection={selectedInspection} onClose={() => setSelectedInspection(null)} />
        )}
        {(activePanel === "all" || activePanel === "work") && (
          <WorkOrderSync />
        )}
      </div>

      {/* Tip banner */}
      {!selectedInspection && activePanel === "all" && (
        <div style={{ margin: "0 24px 20px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#1d4ed8", display: "flex", alignItems: "center", gap: 8 }}>
          💡 <b>Tip:</b> Click any row in the Inspection Dashboard to load it in the Detail Review panel.
        </div>
      )}
    </div>
  );
}
