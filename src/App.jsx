import { useState, useRef } from "react";

// ─── SEED DATA ───────────────────────────────────────────────────────────────

const INIT_TURBINES = [
  { id:"T-107", healthLabel:"Critical",  location:"Farm Alpha – Zone 2", lat:28.023, lng:-23.678, faultHistory:4, lastInspected:"04/12/2023", status:"Active",      description:"Root fracture on blade 2. Recurring vibration issues since 2022. Urgent review needed.", images:["https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80","https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80"], techNote:"", needsAttention:true },
  { id:"T-138", healthLabel:"High Risk", location:"Farm Alpha – Zone 1", lat:27.998, lng:-23.622, faultHistory:5, lastInspected:"04/07/2023", status:"Active",      description:"Multiple erosion events. Blade tip damage visible. Highest fault count in fleet.", images:["https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&q=80"], techNote:"", needsAttention:true },
  { id:"T-108", healthLabel:"Moderate",  location:"Farm Alpha – Zone 3", lat:28.031, lng:-23.690, faultHistory:3, lastInspected:"04/10/2023", status:"Active",      description:"Leading edge crack detected. AI confidence 87%. Schedule follow-up within 2 weeks.", images:["https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&q=80"], techNote:"", needsAttention:false },
  { id:"T-122", healthLabel:"Moderate",  location:"Farm Beta – Zone 1",  lat:28.015, lng:-23.661, faultHistory:2, lastInspected:"04/09/2023", status:"Active",      description:"Surface erosion on blade 1. Minor paint peeling. Routine maintenance scheduled.", images:["https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80"], techNote:"", needsAttention:false },
  { id:"T-132", healthLabel:"Low Risk",  location:"Farm Beta – Zone 2",  lat:28.009, lng:-23.645, faultHistory:1, lastInspected:"04/09/2023", status:"Maintenance", description:"Under scheduled maintenance. Minor cosmetic defect resolved last cycle.", images:[], techNote:"", needsAttention:false },
  { id:"T-022", healthLabel:"Healthy",   location:"Farm Beta – Zone 3",  lat:28.044, lng:-23.710, faultHistory:0, lastInspected:"03/28/2023", status:"Active",      description:"No defects detected. Clean inspection history. Continue routine schedule.", images:["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80"], techNote:"", needsAttention:false },
];

const INIT_DRONES = [
  { id:"DR-501", status:"Available",    battery:94,  healthStatus:"Excellent", model:"DJI M30T",      location:"Farm Alpha HQ", lastMaintenance:"03/20/2023", issues:[] },
  { id:"DR-502", status:"Available",    battery:87,  healthStatus:"Good",      model:"DJI M30T",      location:"Farm Alpha HQ", lastMaintenance:"03/18/2023", issues:[] },
  { id:"DR-498", status:"In Use",       battery:62,  healthStatus:"Good",      model:"Autel EVO II",  location:"Farm Alpha – Zone 1", lastMaintenance:"03/15/2023", issues:[] },
  { id:"DR-495", status:"Maintenance",  battery:45,  healthStatus:"Damaged",   model:"DJI M30T",      location:"Farm Beta HQ",  lastMaintenance:"02/28/2023", issues:["Gimbal misalignment","Low battery health"] },
  { id:"DR-490", status:"Available",    battery:100, healthStatus:"Excellent", model:"Skydio X2",     location:"Farm Beta HQ",  lastMaintenance:"04/01/2023", issues:[] },
];

const INIT_MISSIONS = [
  { id:"M-001", turbines:["T-107","T-138"], drone:"DR-501", date:"2023-04-14", time:"09:00", status:"Scheduled",  weatherSafe:true,  priority:"HIGH",   notes:"Priority run – critical turbines" },
  { id:"M-002", turbines:["T-122"],         drone:"DR-502", date:"2023-04-15", time:"08:30", status:"Pending",    weatherSafe:false, priority:"MEDIUM", notes:"Pending weather clearance" },
  { id:"M-003", turbines:["T-022"],         drone:"DR-490", date:"2023-04-16", time:"10:00", status:"Scheduled",  weatherSafe:true,  priority:"LOW",    notes:"Routine check" },
];

const INIT_INSPECTIONS = [
  { id:"INS-001", inspection_id:"a1b2-0001", date:"04/12/2023", turbine_id:"T-108", drone_id:"DR-501", severity:"HIGH",     status:"Open",    ai_confidence:87, image_count:12, gps:"(28.031,-23.690)", defect_type:"Blade Crack",   classification:"Structural",          techEval:"", needsWork:false, images:["https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80"] },
  { id:"INS-002", inspection_id:"a1b2-0002", date:"04/10/2023", turbine_id:"T-122", drone_id:"DR-502", severity:"HIGH",     status:"Open",    ai_confidence:92, image_count:9,  gps:"(28.015,-23.661)", defect_type:"Erosion",        classification:"Surface",             techEval:"", needsWork:false, images:["https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&q=80"] },
  { id:"INS-003", inspection_id:"a1b2-0003", date:"04/09/2023", turbine_id:"T-132", drone_id:"DR-498", severity:"MEDIUM",   status:"Closed",  ai_confidence:74, image_count:7,  gps:"(28.009,-23.645)", defect_type:"Paint Peeling",  classification:"Cosmetic",            techEval:"", needsWork:false, images:["https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&q=80"] },
  { id:"INS-004", inspection_id:"a1b2-0004", date:"04/08/2023", turbine_id:"T-138", drone_id:"DR-495", severity:"LOW",      status:"Open",    ai_confidence:61, image_count:5,  gps:"(27.998,-23.622)", defect_type:"Minor Dent",     classification:"Impact",              techEval:"", needsWork:false, images:["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80"] },
  { id:"INS-005", inspection_id:"a1b2-0005", date:"04/07/2023", turbine_id:"T-107", drone_id:"DR-490", severity:"CRITICAL", status:"Open",    ai_confidence:97, image_count:15, gps:"(28.023,-23.678)", defect_type:"Root Fracture",  classification:"Critical Structural", techEval:"", needsWork:false, images:["https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80"] },
  { id:"INS-006", inspection_id:"a1b2-0006", date:"04/06/2023", turbine_id:"T-022", drone_id:"DR-501", severity:"LOW",      status:"Closed",  ai_confidence:55, image_count:4,  gps:"(28.044,-23.710)", defect_type:"Insect Buildup", classification:"Surface",             techEval:"", needsWork:false, images:["https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&q=80"] },
];

const WEATHER = {
  "2023-04-14":{ wind:12, safe:true,  icon:"🌤",  label:"Partly cloudy",  vis:"Good" },
  "2023-04-15":{ wind:28, safe:false, icon:"🌧",  label:"High winds",     vis:"Poor" },
  "2023-04-16":{ wind:8,  safe:true,  icon:"☀️",  label:"Clear skies",    vis:"Excellent" },
  "2023-04-17":{ wind:15, safe:true,  icon:"🌤",  label:"Partly cloudy",  vis:"Good" },
  "2023-04-18":{ wind:35, safe:false, icon:"⛈",  label:"Storm warning",  vis:"Poor" },
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

const SEV_CFG = { CRITICAL:["#7c3aed","#fff"], HIGH:["#ef4444","#fff"], MEDIUM:["#f97316","#fff"], LOW:["#22c55e","#fff"] };
const HEALTH_CFG = { Critical:["#7c3aed","#faf5ff"], "High Risk":["#ef4444","#fef2f2"], Moderate:["#f97316","#fff7ed"], "Low Risk":["#3b82f6","#eff6ff"], Healthy:["#22c55e","#f0fdf4"] };
const DRONE_STATUS_CFG = { Available:["#22c55e","#f0fdf4"], "In Use":["#3b82f6","#eff6ff"], Maintenance:["#f97316","#fff7ed"], Damaged:["#ef4444","#fef2f2"] };

const Badge = ({ s, sm }) => { const [bg,c]=SEV_CFG[s]||SEV_CFG.LOW; return <span style={{background:bg,color:c,padding:sm?"1px 6px":"2px 9px",borderRadius:4,fontSize:sm?9:11,fontWeight:700,letterSpacing:"0.04em",fontFamily:"monospace"}}>{s}</span>; };
const HealthBadge = ({ h }) => { const [c,bg]=HEALTH_CFG[h]||["#6b7280","#f9fafb"]; return <span style={{background:bg,color:c,padding:"2px 9px",borderRadius:12,fontSize:11,fontWeight:700,border:`1px solid ${c}30`}}>{h}</span>; };
const StatusDot = ({ s }) => { const [c]=DRONE_STATUS_CFG[s]||["#6b7280"]; return <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:c}}><span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>  {s}</span>; };

function Toast({ msg, type="success" }) {
  const cols = { success:["#f0fdf4","#86efac","#166534","✓"], warn:["#fffbeb","#fcd34d","#92400e","⚠️"], error:["#fef2f2","#fca5a5","#dc2626","⛔"] };
  const [bg,br,c,icon] = cols[type]||cols.success;
  return <div style={{position:"fixed",bottom:24,right:24,background:bg,border:`1px solid ${br}`,color:c,borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:8}}>{icon} {msg}</div>;
}
function useToast() {
  const [t,setT] = useState(null);
  const show = (msg, type="success") => { setT({msg,type}); setTimeout(()=>setT(null),3000); };
  return [t, show];
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",borderRadius:14,width:wide?"800px":"520px",maxWidth:"95vw",maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 22px",borderBottom:"1px solid #e5e7eb",position:"sticky",top:0,background:"#fff",zIndex:1}}>
          <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8",lineHeight:1}}>✕</button>
        </div>
        <div style={{padding:"20px 22px"}}>{children}</div>
      </div>
    </div>
  );
}

function FormRow({ label, children, required }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:5}}>{label}{required&&<span style={{color:"#ef4444",marginLeft:3}}>*</span>}</label>
      {children}
    </div>
  );
}

const inp = { border:"1px solid #d1d5db", borderRadius:7, padding:"7px 10px", fontSize:13, width:"100%", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const selStyle = { ...inp, cursor:"pointer" };
const btnPrimary = { background:"#0f172a", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer" };
const btnSecondary = { background:"#f1f5f9", color:"#374151", border:"1px solid #e2e8f0", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer" };

function exportCSV(filename, header, rows) {
  const blob = new Blob([header+"\n"+rows.join("\n")], {type:"text/csv"});
  const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
}

// ─── TURBINES TAB ────────────────────────────────────────────────────────────

function TurbinesTab() {
  const [turbines, setTurbines] = useState(INIT_TURBINES);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("faultHistory");
  const [sortDir, setSortDir] = useState("desc");
  const [healthFilter, setHealthFilter] = useState("All");
  const [editTarget, setEditTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [toast, showToast] = useToast();
  const [newForm, setNewForm] = useState({ id:"", healthLabel:"Healthy", location:"", lat:"", lng:"", status:"Active", description:"" });

  const sorted = turbines
    .filter(t => {
      const q = search.toLowerCase();
      return (t.id.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) &&
        (healthFilter==="All" || t.healthLabel===healthFilter);
    })
    .sort((a,b) => {
      const v = sortDir==="asc" ? 1 : -1;
      if (sortKey==="faultHistory") return (a.faultHistory-b.faultHistory)*v;
      if (sortKey==="id") return a.id.localeCompare(b.id)*v;
      if (sortKey==="healthLabel") return a.healthLabel.localeCompare(b.healthLabel)*v;
      return 0;
    });

  const toggleSort = key => { if (sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(key); setSortDir("desc"); } };

  const handleDelete = id => { setTurbines(p=>p.filter(t=>t.id!==id)); showToast(`${id} deleted`,"warn"); };
  const handleSaveEdit = () => { setTurbines(p=>p.map(t=>t.id===editTarget.id?{...editTarget}:t)); setEditTarget(null); showToast(`${editTarget.id} updated`); };
  const handleAdd = () => {
    if (!newForm.id || !newForm.location) { showToast("ID and Location required","error"); return; }
    if (turbines.find(t=>t.id===newForm.id)) { showToast("Turbine ID already exists","error"); return; }
    setTurbines(p=>[...p,{...newForm,lat:parseFloat(newForm.lat)||0,lng:parseFloat(newForm.lng)||0,faultHistory:0,lastInspected:"—",images:[],techNote:"",needsAttention:false}]);
    setAddOpen(false); setNewForm({id:"",healthLabel:"Healthy",location:"",lat:"",lng:"",status:"Active",description:""});
    showToast(`${newForm.id} added`);
  };

  const healthLabels = ["All","Critical","High Risk","Moderate","Low Risk","Healthy"];
  const SortArrow = ({k}) => <span style={{marginLeft:3,opacity:sortKey===k?1:0.3}}>{sortKey===k&&sortDir==="desc"?"↓":"↑"}</span>;

  return (
    <div>
      {toast&&<Toast {...toast}/>}
      {/* Controls */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search turbines…" style={{...inp,width:220}}/>
        <select value={healthFilter} onChange={e=>setHealthFilter(e.target.value)} style={{...selStyle,width:140}}>
          {healthLabels.map(l=><option key={l}>{l}</option>)}
        </select>
        <select value={sortKey+":"+sortDir} onChange={e=>{const[k,d]=e.target.value.split(":");setSortKey(k);setSortDir(d);}} style={{...selStyle,width:170}}>
          <option value="faultHistory:desc">Fault History ↓</option>
          <option value="faultHistory:asc">Fault History ↑</option>
          <option value="id:asc">ID A→Z</option>
          <option value="healthLabel:asc">Health Label</option>
        </select>
        <button onClick={()=>exportCSV("turbines.csv","ID,Health,Location,Faults,Status,Description",turbines.map(t=>`${t.id},${t.healthLabel},${t.location},${t.faultHistory},${t.status},"${t.description}"`))} style={btnSecondary}>Export CSV ↓</button>
        <button onClick={()=>setAddOpen(true)} style={btnPrimary}>+ Add Turbine</button>
      </div>

      {/* Table */}
      <div style={{border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:"#f8fafc"}}>
              {[["id","Turbine ID"],["healthLabel","Health"],["location","Location"],["faultHistory","Faults"],["status","Status"]].map(([k,l])=>(
                <th key={k} onClick={()=>toggleSort(k)} style={{padding:"9px 12px",textAlign:"left",fontWeight:700,color:"#475569",fontSize:11,cursor:"pointer",borderBottom:"1px solid #e5e7eb",whiteSpace:"nowrap",userSelect:"none"}}>
                  {l}<SortArrow k={k}/>
                </th>
              ))}
              <th style={{padding:"9px 12px",fontSize:11,color:"#475569",fontWeight:700,borderBottom:"1px solid #e5e7eb"}}>Images</th>
              <th style={{padding:"9px 12px",fontSize:11,color:"#475569",fontWeight:700,borderBottom:"1px solid #e5e7eb"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(t=>(
              <tr key={t.id} style={{borderBottom:"1px solid #f1f5f9",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <td style={{padding:"9px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    {t.needsAttention&&<span title="Needs attention" style={{color:"#ef4444",fontSize:14}}>⚑</span>}
                    <span style={{fontFamily:"monospace",fontWeight:700,color:"#0f172a",fontSize:12}}>{t.id}</span>
                  </div>
                </td>
                <td style={{padding:"9px 12px"}}><HealthBadge h={t.healthLabel}/></td>
                <td style={{padding:"9px 12px",color:"#374151",fontSize:11}}>{t.location}</td>
                <td style={{padding:"9px 12px",textAlign:"center"}}>
                  <span style={{fontWeight:700,color:t.faultHistory>=4?"#ef4444":t.faultHistory>=2?"#f97316":"#16a34a"}}>{t.faultHistory}</span>
                </td>
                <td style={{padding:"9px 12px"}}><StatusDot s={t.status}/></td>
                <td style={{padding:"9px 12px",color:"#64748b",fontSize:11}}>{t.images.length} img</td>
                <td style={{padding:"9px 12px"}}>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>setDetailTarget(t)} style={{...btnSecondary,padding:"4px 10px",fontSize:11}}>View</button>
                    <button onClick={()=>setEditTarget({...t})} style={{...btnSecondary,padding:"4px 10px",fontSize:11}}>Edit</button>
                    <button onClick={()=>handleDelete(t.id)} style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:7,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {addOpen&&(
        <Modal title="Add New Turbine" onClose={()=>setAddOpen(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <FormRow label="Turbine ID" required><input style={inp} value={newForm.id} onChange={e=>setNewForm(p=>({...p,id:e.target.value}))}/></FormRow>
            <FormRow label="Health Label"><select style={selStyle} value={newForm.healthLabel} onChange={e=>setNewForm(p=>({...p,healthLabel:e.target.value}))}>{["Healthy","Low Risk","Moderate","High Risk","Critical"].map(l=><option key={l}>{l}</option>)}</select></FormRow>
            <FormRow label="Location (Farm & Zone)" required><input style={inp} value={newForm.location} onChange={e=>setNewForm(p=>({...p,location:e.target.value}))}/></FormRow>
            <FormRow label="Status"><select style={selStyle} value={newForm.status} onChange={e=>setNewForm(p=>({...p,status:e.target.value}))}>{["Active","Maintenance","Inactive"].map(s=><option key={s}>{s}</option>)}</select></FormRow>
            <FormRow label="Latitude"><input style={inp} type="number" value={newForm.lat} onChange={e=>setNewForm(p=>({...p,lat:e.target.value}))}/></FormRow>
            <FormRow label="Longitude"><input style={inp} type="number" value={newForm.lng} onChange={e=>setNewForm(p=>({...p,lng:e.target.value}))}/></FormRow>
          </div>
          <FormRow label="Description / Defect History"><textarea style={{...inp,height:80,resize:"vertical"}} value={newForm.description} onChange={e=>setNewForm(p=>({...p,description:e.target.value}))}/></FormRow>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={btnSecondary} onClick={()=>setAddOpen(false)}>Cancel</button>
            <button style={btnPrimary} onClick={handleAdd}>Add Turbine</button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget&&(
        <Modal title={`Edit ${editTarget.id}`} onClose={()=>setEditTarget(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <FormRow label="Health Label"><select style={selStyle} value={editTarget.healthLabel} onChange={e=>setEditTarget(p=>({...p,healthLabel:e.target.value}))}>{["Healthy","Low Risk","Moderate","High Risk","Critical"].map(l=><option key={l}>{l}</option>)}</select></FormRow>
            <FormRow label="Status"><select style={selStyle} value={editTarget.status} onChange={e=>setEditTarget(p=>({...p,status:e.target.value}))}>{["Active","Maintenance","Inactive"].map(s=><option key={s}>{s}</option>)}</select></FormRow>
            <FormRow label="Location" required><input style={inp} value={editTarget.location} onChange={e=>setEditTarget(p=>({...p,location:e.target.value}))}/></FormRow>
            <div style={{display:"flex",alignItems:"flex-end",marginBottom:14}}>
              <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer"}}>
                <input type="checkbox" checked={editTarget.needsAttention} onChange={e=>setEditTarget(p=>({...p,needsAttention:e.target.checked}))} style={{width:16,height:16}}/>
                <span style={{fontWeight:600,color:"#ef4444"}}>Flag Needs Attention</span>
              </label>
            </div>
          </div>
          <FormRow label="Description / Defect History"><textarea style={{...inp,height:80,resize:"vertical"}} value={editTarget.description} onChange={e=>setEditTarget(p=>({...p,description:e.target.value}))}/></FormRow>
          <FormRow label="Technician Note"><textarea style={{...inp,height:60,resize:"vertical"}} value={editTarget.techNote} placeholder="Technician observations after inspection…" onChange={e=>setEditTarget(p=>({...p,techNote:e.target.value}))}/></FormRow>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={btnSecondary} onClick={()=>setEditTarget(null)}>Cancel</button>
            <button style={btnPrimary} onClick={handleSaveEdit}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailTarget&&(
        <Modal title={`Turbine ${detailTarget.id} – Full Detail`} onClose={()=>setDetailTarget(null)} wide>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div>
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><HealthBadge h={detailTarget.healthLabel}/>{detailTarget.needsAttention&&<span style={{background:"#fef2f2",color:"#dc2626",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10,border:"1px solid #fecaca"}}>⚑ Needs Attention</span>}</div>
                <div style={{fontSize:12,color:"#374151",lineHeight:1.9}}>
                  <Row label="Location" val={detailTarget.location}/>
                  <Row label="Coordinates" val={`${detailTarget.lat}, ${detailTarget.lng}`}/>
                  <Row label="Status" val={detailTarget.status}/>
                  <Row label="Fault History" val={`${detailTarget.faultHistory} incidents`}/>
                  <Row label="Last Inspected" val={detailTarget.lastInspected}/>
                </div>
              </div>
              <div style={{background:"#f8fafc",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#374151",marginBottom:12}}>
                <div style={{fontWeight:700,marginBottom:4,color:"#0f172a"}}>Description & History</div>
                {detailTarget.description||"No description added."}
              </div>
              {detailTarget.techNote&&(
                <div style={{background:"#fffbeb",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#92400e",border:"1px solid #fde68a"}}>
                  <div style={{fontWeight:700,marginBottom:4}}>🔧 Technician Note</div>
                  {detailTarget.techNote}
                </div>
              )}
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:"#374151"}}>Inspection Images ({detailTarget.images.length})</div>
              {detailTarget.images.length===0?<div style={{color:"#94a3b8",fontSize:12}}>No images stored yet.</div>:(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {detailTarget.images.map((src,i)=>(
                    <div key={i} style={{borderRadius:8,overflow:"hidden",border:"1px solid #e2e8f0",aspectRatio:"4/3"}}>
                      <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                  ))}
                </div>
              )}
              <div style={{marginTop:14,background:"#f0f9ff",borderRadius:8,padding:"10px 12px",fontSize:11,color:"#0369a1"}}>
                <div style={{fontWeight:700,marginBottom:3}}>🔒 AES-256 Encrypted Storage</div>
                Images stored with GPS, timestamp, drone ID, and turbine ID metadata per AC policy.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Row({label,val}) {
  return <div style={{display:"flex",gap:6}}><span style={{color:"#94a3b8",minWidth:100,fontWeight:500}}>{label}:</span><span style={{fontWeight:600,color:"#0f172a"}}>{val}</span></div>;
}

// ─── DRONES TAB ───────────────────────────────────────────────────────────────

function DronesTab() {
  const [drones, setDrones] = useState(INIT_DRONES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editTarget, setEditTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [toast, showToast] = useToast();
  const [newForm, setNewForm] = useState({ id:"", status:"Available", battery:100, healthStatus:"Excellent", model:"", location:"Farm Alpha HQ", issues:"" });

  const filtered = drones.filter(d => {
    const q = search.toLowerCase();
    return (d.id.toLowerCase().includes(q) || d.model.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)) &&
      (statusFilter==="All" || d.status===statusFilter);
  });

  const handleDelete = id => { setDrones(p=>p.filter(d=>d.id!==id)); showToast(`${id} deleted`,"warn"); };
  const handleSaveEdit = () => { setDrones(p=>p.map(d=>d.id===editTarget.id?{...editTarget}:d)); setEditTarget(null); showToast(`${editTarget.id} updated`); };
  const handleAdd = () => {
    if (!newForm.id || !newForm.model) { showToast("ID and Model required","error"); return; }
    if (drones.find(d=>d.id===newForm.id)) { showToast("Drone ID already exists","error"); return; }
    const issues = newForm.issues ? newForm.issues.split(",").map(s=>s.trim()).filter(Boolean) : [];
    setDrones(p=>[...p,{...newForm,battery:parseInt(newForm.battery)||100,issues,lastMaintenance:"—"}]);
    setAddOpen(false);
    setNewForm({id:"",status:"Available",battery:100,healthStatus:"Excellent",model:"",location:"Farm Alpha HQ",issues:""});
    showToast(`${newForm.id} added`);
  };

  const BatteryBar = ({ pct }) => {
    const col = pct>=70?"#22c55e":pct>=40?"#f97316":"#ef4444";
    return (
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:56,background:"#e2e8f0",borderRadius:99,height:7,overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:99}}/>
        </div>
        <span style={{fontSize:11,fontWeight:700,color:col}}>{pct}%</span>
      </div>
    );
  };

  return (
    <div>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search drones…" style={{...inp,width:220}}/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{...selStyle,width:140}}>
          {["All","Available","In Use","Maintenance","Damaged"].map(s=><option key={s}>{s}</option>)}
        </select>
        <button onClick={()=>exportCSV("drones.csv","ID,Status,Battery,Health,Model,Location",drones.map(d=>`${d.id},${d.status},${d.battery}%,${d.healthStatus},${d.model},${d.location}`))} style={btnSecondary}>Export CSV ↓</button>
        <button onClick={()=>setAddOpen(true)} style={btnPrimary}>+ Add Drone</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {filtered.map(d => {
          const [stColor, stBg] = DRONE_STATUS_CFG[d.status]||["#6b7280","#f9fafb"];
          const hasProblem = d.status==="Maintenance" || d.status==="Damaged" || d.battery<40 || d.issues.length>0;
          return (
            <div key={d.id} style={{background:"#fff",border:`1px solid ${hasProblem?"#fecaca":"#e2e8f0"}`,borderRadius:12,padding:16,transition:"box-shadow 0.15s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"monospace",fontWeight:800,fontSize:14,color:"#0f172a"}}>{d.id}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>{d.model}</div>
                </div>
                <span style={{background:stBg,color:stColor,padding:"3px 9px",borderRadius:12,fontSize:11,fontWeight:700,border:`1px solid ${stColor}25`}}>{d.status}</span>
              </div>

              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Battery</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,background:"#e2e8f0",borderRadius:99,height:8,overflow:"hidden"}}>
                    <div style={{width:`${d.battery}%`,height:"100%",background:d.battery>=70?"#22c55e":d.battery>=40?"#f97316":"#ef4444",borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:d.battery>=70?"#16a34a":d.battery>=40?"#b45309":"#dc2626",minWidth:32}}>{d.battery}%</span>
                </div>
              </div>

              <div style={{fontSize:11,color:"#374151",lineHeight:1.8,marginBottom:10}}>
                <div><span style={{color:"#94a3b8"}}>Health: </span><span style={{fontWeight:600}}>{d.healthStatus}</span></div>
                <div><span style={{color:"#94a3b8"}}>Location: </span><span style={{fontWeight:600}}>{d.location}</span></div>
                <div><span style={{color:"#94a3b8"}}>Last Maint: </span><span style={{fontWeight:600}}>{d.lastMaintenance}</span></div>
              </div>

              {d.issues.length>0&&(
                <div style={{background:"#fef2f2",borderRadius:7,padding:"7px 10px",marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#dc2626",marginBottom:3}}>⚠️ Issues</div>
                  {d.issues.map((iss,i)=><div key={i} style={{fontSize:11,color:"#b91c1c"}}>• {iss}</div>)}
                </div>
              )}

              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setDetailTarget(d)} style={{...btnSecondary,padding:"5px 12px",fontSize:11,flex:1}}>Details</button>
                <button onClick={()=>setEditTarget({...d})} style={{...btnSecondary,padding:"5px 12px",fontSize:11,flex:1}}>Edit</button>
                <button onClick={()=>handleDelete(d.id)} style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:7,padding:"5px 10px",fontSize:11,cursor:"pointer"}}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      {addOpen&&(
        <Modal title="Add New Drone" onClose={()=>setAddOpen(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <FormRow label="Drone ID" required><input style={inp} value={newForm.id} onChange={e=>setNewForm(p=>({...p,id:e.target.value}))}/></FormRow>
            <FormRow label="Model" required><input style={inp} value={newForm.model} onChange={e=>setNewForm(p=>({...p,model:e.target.value}))}/></FormRow>
            <FormRow label="Status"><select style={selStyle} value={newForm.status} onChange={e=>setNewForm(p=>({...p,status:e.target.value}))}>{["Available","In Use","Maintenance","Damaged"].map(s=><option key={s}>{s}</option>)}</select></FormRow>
            <FormRow label="Health Status"><select style={selStyle} value={newForm.healthStatus} onChange={e=>setNewForm(p=>({...p,healthStatus:e.target.value}))}>{["Excellent","Good","Fair","Damaged"].map(s=><option key={s}>{s}</option>)}</select></FormRow>
            <FormRow label="Battery %"><input style={inp} type="number" min={0} max={100} value={newForm.battery} onChange={e=>setNewForm(p=>({...p,battery:e.target.value}))}/></FormRow>
            <FormRow label="Location"><input style={inp} value={newForm.location} onChange={e=>setNewForm(p=>({...p,location:e.target.value}))}/></FormRow>
          </div>
          <FormRow label="Known Issues (comma-separated)"><input style={inp} value={newForm.issues} onChange={e=>setNewForm(p=>({...p,issues:e.target.value}))} placeholder="e.g. Gimbal issue, propeller crack"/></FormRow>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={btnSecondary} onClick={()=>setAddOpen(false)}>Cancel</button>
            <button style={btnPrimary} onClick={handleAdd}>Add Drone</button>
          </div>
        </Modal>
      )}

      {editTarget&&(
        <Modal title={`Edit ${editTarget.id}`} onClose={()=>setEditTarget(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <FormRow label="Status"><select style={selStyle} value={editTarget.status} onChange={e=>setEditTarget(p=>({...p,status:e.target.value}))}>{["Available","In Use","Maintenance","Damaged"].map(s=><option key={s}>{s}</option>)}</select></FormRow>
            <FormRow label="Health Status"><select style={selStyle} value={editTarget.healthStatus} onChange={e=>setEditTarget(p=>({...p,healthStatus:e.target.value}))}>{["Excellent","Good","Fair","Damaged"].map(s=><option key={s}>{s}</option>)}</select></FormRow>
            <FormRow label="Battery %"><input style={inp} type="number" min={0} max={100} value={editTarget.battery} onChange={e=>setEditTarget(p=>({...p,battery:parseInt(e.target.value)||0}))}/></FormRow>
            <FormRow label="Location"><input style={inp} value={editTarget.location} onChange={e=>setEditTarget(p=>({...p,location:e.target.value}))}/></FormRow>
          </div>
          <FormRow label="Known Issues (comma-separated)"><input style={inp} value={editTarget.issues.join(", ")} onChange={e=>setEditTarget(p=>({...p,issues:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))} placeholder="Gimbal issue, propeller crack…"/></FormRow>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
            <button style={btnSecondary} onClick={()=>setEditTarget(null)}>Cancel</button>
            <button style={btnPrimary} onClick={handleSaveEdit}>Save Changes</button>
          </div>
        </Modal>
      )}

      {detailTarget&&(
        <Modal title={`Drone ${detailTarget.id} – Full Detail`} onClose={()=>setDetailTarget(null)}>
          <div style={{fontSize:13,lineHeight:2,color:"#374151"}}>
            <Row label="Model" val={detailTarget.model}/>
            <Row label="Status" val={detailTarget.status}/>
            <Row label="Health" val={detailTarget.healthStatus}/>
            <Row label="Location" val={detailTarget.location}/>
            <Row label="Last Maintenance" val={detailTarget.lastMaintenance}/>
            <div style={{margin:"10px 0"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>Battery</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,background:"#e2e8f0",borderRadius:99,height:12,overflow:"hidden"}}>
                  <div style={{width:`${detailTarget.battery}%`,height:"100%",background:detailTarget.battery>=70?"#22c55e":detailTarget.battery>=40?"#f97316":"#ef4444",borderRadius:99}}/>
                </div>
                <span style={{fontWeight:700,fontSize:14,color:detailTarget.battery>=70?"#16a34a":detailTarget.battery>=40?"#b45309":"#dc2626"}}>{detailTarget.battery}%</span>
              </div>
              {detailTarget.battery<40&&<div style={{marginTop:5,fontSize:12,color:"#dc2626",fontWeight:600}}>⚠️ Low battery — recharge before next mission</div>}
            </div>
            {detailTarget.issues.length>0&&(
              <div style={{background:"#fef2f2",borderRadius:8,padding:"10px 14px",marginTop:8}}>
                <div style={{fontWeight:700,color:"#dc2626",fontSize:12,marginBottom:4}}>⚠️ Known Issues</div>
                {detailTarget.issues.map((i,idx)=><div key={idx} style={{fontSize:12}}>• {i}</div>)}
              </div>
            )}
            {detailTarget.issues.length===0&&<div style={{background:"#f0fdf4",borderRadius:8,padding:"10px 14px",marginTop:8,color:"#16a34a",fontSize:12,fontWeight:600}}>✓ No known issues</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SCHEDULING TAB ───────────────────────────────────────────────────────────

function SchedulingTab() {
  const [missions, setMissions] = useState(INIT_MISSIONS);
  const [turbines] = useState(INIT_TURBINES);
  const [drones] = useState(INIT_DRONES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date:"", time:"09:00", drone:"", turbines:[], notes:"" });
  const [conflict, setConflict] = useState(null);
  const [toast, showToast] = useToast();

  const prioritized = [...turbines].sort((a,b)=>b.faultHistory-a.faultHistory);
  const availDrones = drones.filter(d=>d.status==="Available");

  const getWeather = date => WEATHER[date] || { wind:10, safe:true, icon:"🌤", label:"Normal conditions", vis:"Good" };

  const detectConflict = (date, time, drone) => missions.find(m=>m.date===date&&m.time===time&&m.drone===drone);

  const handleTurbineToggle = id => setForm(f=>({...f,turbines:f.turbines.includes(id)?f.turbines.filter(t=>t!==id):[...f.turbines,id]}));

  const handleSchedule = () => {
    if (!form.date||!form.drone||form.turbines.length===0) { showToast("Fill date, drone, and at least one turbine","error"); return; }
    const c = detectConflict(form.date,form.time,form.drone);
    if (c) { setConflict(c); showToast(`Conflict: ${form.drone} already booked at ${form.time} on ${form.date}`,"error"); return; }
    const w = getWeather(form.date);
    const hasPriority = form.turbines.some(t=>prioritized.slice(0,2).map(p=>p.id).includes(t));
    const newM = { id:`M-00${missions.length+1}`, turbines:form.turbines, drone:form.drone, date:form.date, time:form.time, status:"Scheduled", weatherSafe:w.safe, priority:hasPriority?"HIGH":"MEDIUM", notes:form.notes };
    setMissions(p=>[...p,newM]);
    showToast(`${newM.id} scheduled – no conflicts`);
    setForm({date:"",time:"09:00",drone:"",turbines:[],notes:""});
    setShowForm(false); setConflict(null);
  };

  const handleDelete = id => { setMissions(p=>p.filter(m=>m.id!==id)); showToast(`${id} removed`,"warn"); };

  const selDrone = drones.find(d=>d.id===form.drone);
  const formWeather = form.date ? getWeather(form.date) : null;

  return (
    <div>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>

        {/* Left – form + weather */}
        <div style={{flex:"1 1 340px",minWidth:320}}>
          {/* Weather Strip */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:10}}>☁️ Weather Forecast</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {Object.entries(WEATHER).slice(0,3).map(([date,w])=>(
                <div key={date} style={{background:w.safe?"#f0fdf4":"#fef2f2",border:`1px solid ${w.safe?"#bbf7d0":"#fecaca"}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:2}}>{w.icon}</div>
                  <div style={{fontSize:10,fontWeight:700,color:w.safe?"#16a34a":"#dc2626"}}>{w.safe?"✓ SAFE":"⛔ UNSAFE"}</div>
                  <div style={{fontSize:9,color:"#64748b",marginTop:1}}>{date.slice(5)}</div>
                  <div style={{fontSize:9,color:"#94a3b8"}}>💨 {w.wind}km/h</div>
                </div>
              ))}
            </div>
          </div>

          {/* New mission form */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>+ Schedule New Mission</div>
              <button onClick={()=>setShowForm(p=>!p)} style={{...btnSecondary,padding:"5px 12px",fontSize:11}}>{showForm?"Collapse ▲":"Expand ▼"}</button>
            </div>

            {showForm&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                  <FormRow label="Date" required><input type="date" style={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></FormRow>
                  <FormRow label="Time" required><input type="time" style={inp} value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}/></FormRow>
                </div>

                {formWeather&&(
                  <div style={{marginBottom:14,padding:"10px 12px",borderRadius:8,background:formWeather.safe?"#f0fdf4":"#fef2f2",border:`1px solid ${formWeather.safe?"#bbf7d0":"#fecaca"}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:700,color:formWeather.safe?"#16a34a":"#dc2626"}}>
                      <span style={{fontSize:18}}>{formWeather.icon}</span>
                      {form.date} — {formWeather.safe?"✓ Safe for flight":"⛔ Unsafe – High winds detected"}
                    </div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:3}}>Wind {formWeather.wind}km/h • {formWeather.label} • Visibility: {formWeather.vis}</div>
                    {!formWeather.safe&&<div style={{fontSize:11,color:"#dc2626",fontWeight:600,marginTop:4}}>Mission not recommended on this date.</div>}
                  </div>
                )}

                {/* Drone picker */}
                <FormRow label="Select Drone" required>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {drones.map(d=>{
                      const unavail = d.status!=="Available";
                      const lowBatt = d.battery<40;
                      const hasissue = d.issues.length>0;
                      const warn = unavail||lowBatt||hasissue;
                      return (
                        <div key={d.id} onClick={()=>!unavail&&setForm(f=>({...f,drone:d.id}))}
                          style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,
                            border:`1.5px solid ${form.drone===d.id?"#2563eb":warn?"#fca5a5":"#e2e8f0"}`,
                            background:form.drone===d.id?"#eff6ff":unavail?"#fafafa":"#fff",
                            cursor:unavail?"not-allowed":"pointer",opacity:unavail?0.55:1,transition:"all 0.15s"}}>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12}}>{d.id}</span>
                              <span style={{fontSize:10,color:"#64748b"}}>{d.model}</span>
                              {form.drone===d.id&&<span style={{marginLeft:"auto",fontSize:10,background:"#dbeafe",color:"#1d4ed8",padding:"1px 6px",borderRadius:10,fontWeight:700}}>Selected</span>}
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                              <div style={{width:48,background:"#e2e8f0",borderRadius:99,height:5,overflow:"hidden"}}>
                                <div style={{width:`${d.battery}%`,height:"100%",background:d.battery>=70?"#22c55e":d.battery>=40?"#f97316":"#ef4444",borderRadius:99}}/>
                              </div>
                              <span style={{fontSize:10,fontWeight:700,color:d.battery>=70?"#16a34a":d.battery>=40?"#b45309":"#dc2626"}}>{d.battery}%</span>
                              <StatusDot s={d.status}/>
                            </div>
                          </div>
                          {warn&&(
                            <div style={{fontSize:10,color:"#dc2626",textAlign:"right"}}>
                              {unavail&&<div>⛔ {d.status}</div>}
                              {!unavail&&lowBatt&&<div>⚠️ Low battery</div>}
                              {!unavail&&hasissue&&<div>⚠️ {d.issues.length} issue{d.issues.length>1?"s":""}</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </FormRow>

                {/* Turbine picker */}
                <FormRow label="Select Turbines (sorted by fault priority)" required>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {prioritized.map((t,i)=>{
                      const maint = t.status==="Maintenance";
                      return (
                        <div key={t.id} onClick={()=>!maint&&handleTurbineToggle(t.id)}
                          style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",borderRadius:8,
                            border:`1.5px solid ${form.turbines.includes(t.id)?"#2563eb":"#e2e8f0"}`,
                            background:form.turbines.includes(t.id)?"#eff6ff":maint?"#fafafa":"#fff",
                            cursor:maint?"not-allowed":"pointer",opacity:maint?0.5:1,transition:"all 0.15s"}}>
                          <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${form.turbines.includes(t.id)?"#2563eb":"#d1d5db"}`,background:form.turbines.includes(t.id)?"#2563eb":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {form.turbines.includes(t.id)&&<span style={{color:"#fff",fontSize:10,lineHeight:1}}>✓</span>}
                          </div>
                          <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:"#0f172a",minWidth:45}}>{t.id}</span>
                          <HealthBadge h={t.healthLabel}/>
                          {i<2&&<span style={{background:"#fef3c7",color:"#92400e",fontSize:9,padding:"1px 6px",borderRadius:10,fontWeight:700}}>PRIORITY</span>}
                          {t.needsAttention&&<span style={{color:"#ef4444",fontSize:12}} title="Needs attention">⚑</span>}
                          <div style={{flex:1}}/>
                          <span style={{fontSize:10,color:"#94a3b8"}}>⚡{t.faultHistory} faults</span>
                          {maint&&<span style={{fontSize:10,color:"#f97316",fontWeight:600}}>In Maintenance</span>}
                        </div>
                      );
                    })}
                  </div>
                </FormRow>

                {conflict&&(
                  <div style={{marginBottom:14,padding:"10px 12px",borderRadius:8,background:"#fef2f2",border:"1px solid #fecaca"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>⛔ Double-Booking Conflict</div>
                    <div style={{fontSize:11,color:"#374151",marginTop:3}}>{form.drone} is already scheduled for <b>{conflict.id}</b> on {conflict.date} at {conflict.time}.</div>
                  </div>
                )}

                <FormRow label="Notes"><textarea style={{...inp,height:60,resize:"vertical"}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Mission briefing notes…"/></FormRow>
                <button onClick={handleSchedule} style={{...btnPrimary,width:"100%",padding:"11px",fontSize:14}}>Schedule Mission →</button>
              </div>
            )}
            {!showForm&&<div style={{fontSize:12,color:"#94a3b8",textAlign:"center"}}>Click Expand to create a new mission</div>}
          </div>
        </div>

        {/* Right – missions list */}
        <div style={{flex:"1 1 340px",minWidth:300}}>
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>📅 Scheduled Missions ({missions.length})</div>
              <button onClick={()=>exportCSV("missions.csv","ID,Turbines,Drone,Date,Time,Status,Priority",missions.map(m=>`${m.id},"${m.turbines.join("|")}",${m.drone},${m.date},${m.time},${m.status},${m.priority}`))} style={{...btnSecondary,padding:"5px 10px",fontSize:11}}>Export ↓</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {missions.map(m=>(
                <div key={m.id} style={{border:`1px solid ${!m.weatherSafe?"#fecaca":m.priority==="HIGH"?"#fde68a":"#e2e8f0"}`,borderRadius:10,padding:"12px 14px",background:!m.weatherSafe?"#fef9f9":m.priority==="HIGH"?"#fffdf0":"#fff"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontFamily:"monospace",fontWeight:800,fontSize:12,color:"#0f172a"}}>{m.id}</span>
                    <span style={{fontSize:10,background:m.priority==="HIGH"?"#fef3c7":m.priority==="MEDIUM"?"#eff6ff":"#f0fdf4",color:m.priority==="HIGH"?"#92400e":m.priority==="MEDIUM"?"#1d4ed8":"#16a34a",padding:"1px 7px",borderRadius:10,fontWeight:700}}>{m.priority}</span>
                    <span style={{marginLeft:"auto"}}><span style={{background:m.status==="Scheduled"?"#f0fdf4":"#fffbeb",color:m.status==="Scheduled"?"#16a34a":"#b45309",fontSize:11,padding:"2px 8px",borderRadius:10,fontWeight:600}}>{m.status}</span></span>
                    {!m.weatherSafe&&<span style={{fontSize:10,background:"#fef2f2",color:"#dc2626",borderRadius:10,padding:"1px 6px",fontWeight:700}}>⛔ Weather</span>}
                  </div>
                  <div style={{fontSize:11,color:"#374151",marginBottom:4}}>
                    <span style={{fontFamily:"monospace",color:"#2563eb",fontWeight:600}}>{m.drone}</span> → {" "}
                    {m.turbines.map(t=><span key={t} style={{background:"#f1f5f9",padding:"1px 6px",borderRadius:4,fontSize:10,fontFamily:"monospace",marginRight:3}}>{t}</span>)}
                  </div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{m.date} at {m.time}{m.notes&&` • ${m.notes}`}</div>
                  <div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}>
                    <button onClick={()=>handleDelete(m.id)} style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:6,padding:"3px 10px",fontSize:11,cursor:"pointer"}}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drone health summary */}
            <div style={{marginTop:16,background:"#f8fafc",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
              <div style={{fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8}}>🚁 Fleet Health</div>
              {INIT_DRONES.map(d=>(
                <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontFamily:"monospace",fontWeight:600,fontSize:11,color:"#374151",minWidth:55}}>{d.id}</span>
                  <div style={{flex:1,background:"#e2e8f0",borderRadius:99,height:6,overflow:"hidden"}}>
                    <div style={{width:`${d.battery}%`,height:"100%",background:d.battery>=70?"#22c55e":d.battery>=40?"#f97316":"#ef4444",borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:10,minWidth:28,color:d.battery>=70?"#16a34a":d.battery>=40?"#b45309":"#dc2626",fontWeight:700}}>{d.battery}%</span>
                  <StatusDot s={d.status}/>
                  {d.issues.length>0&&<span style={{fontSize:10,color:"#ef4444"}} title={d.issues.join(", ")}>⚠️{d.issues.length}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INSPECTIONS TAB ──────────────────────────────────────────────────────────

function InspectionsTab() {
  const [inspections, setInspections] = useState(INIT_INSPECTIONS);
  const [turbines, setTurbines] = useState(INIT_TURBINES);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("All");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [page, setPage] = useState(1);
  const [toast, showToast] = useToast();
  const perPage = 4;

  const filtered = inspections.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.turbine_id.toLowerCase().includes(q)||r.severity.toLowerCase().includes(q)||r.defect_type.toLowerCase().includes(q)||r.status.toLowerCase().includes(q);
    return matchSearch && (sevFilter==="All"||r.severity===sevFilter);
  });

  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  const totalPages = Math.ceil(filtered.length/perPage);

  const handleUpdateInspection = (updated) => {
    setInspections(p=>p.map(i=>i.id===updated.id?updated:i));
    // If technician marks needs work, flag the turbine
    if (updated.needsWork) {
      setTurbines(p=>p.map(t=>t.id===updated.turbine_id?{...t,needsAttention:true,techNote:updated.techEval}:t));
    }
    showToast(`${updated.id} updated & logged`);
    setSelected(updated);
  };

  const kpis = [
    {label:"Total",val:inspections.length,color:"#2563eb"},
    {label:"Critical",val:inspections.filter(r=>r.severity==="CRITICAL").length,color:"#7c3aed"},
    {label:"High",val:inspections.filter(r=>r.severity==="HIGH").length,color:"#ef4444"},
    {label:"Open",val:inspections.filter(r=>r.status==="Open").length,color:"#f97316"},
  ];

  return (
    <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
      {toast&&<Toast {...toast}/>}

      {/* Left – dashboard */}
      <div style={{flex:"1 1 320px",minWidth:300}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {kpis.map(k=><div key={k.label} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 10px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:k.color}}>{k.val}</div><div style={{fontSize:10,fontWeight:700,color:"#64748b"}}>{k.label}</div></div>)}
        </div>

        <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
          <select value={dateRange} onChange={e=>setDateRange(e.target.value)} style={{...selStyle,flex:1,minWidth:130}}>
            {["Last 7 Days","Last 30 Days","Last 3 Months","Last 6 Months","Last 24 Months"].map(o=><option key={o}>{o}</option>)}
          </select>
          <select value={sevFilter} onChange={e=>{setSevFilter(e.target.value);setPage(1);}} style={{...selStyle,width:120}}>
            {["All","CRITICAL","HIGH","MEDIUM","LOW"].map(o=><option key={o}>{o}</option>)}
          </select>
          <button onClick={()=>exportCSV("inspections.csv","ID,Date,Turbine,Drone,Severity,Status,AI Confidence,Defect",inspections.map(r=>`${r.inspection_id},${r.date},${r.turbine_id},${r.drone_id},${r.severity},${r.status},${r.ai_confidence}%,${r.defect_type}`))} style={btnPrimary}>Export CSV ↓</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search turbine, defect, severity…" style={{...inp,flex:1}}/>
          <button onClick={()=>{setSearch("");setSevFilter("All");setPage(1);}} style={btnSecondary}>Reset</button>
        </div>

        <div style={{border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",background:"#fff"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:"#f8fafc"}}>
                {["","Date","Turbine","Defect","Severity","Status","Conf."].map(h=>(
                  <th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,color:"#475569",fontSize:10,borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(r=>(
                <tr key={r.id} onClick={()=>setSelected(r)} style={{borderBottom:"1px solid #f1f5f9",cursor:"pointer",background:selected?.id===r.id?"#eff6ff":"#fff"}} onMouseEnter={e=>selected?.id!==r.id&&(e.currentTarget.style.background="#f8fafc")} onMouseLeave={e=>selected?.id!==r.id&&(e.currentTarget.style.background="#fff")}>
                  <td style={{padding:"6px 10px"}}><div style={{width:32,height:24,borderRadius:4,overflow:"hidden"}}><img src={r.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div></td>
                  <td style={{padding:"6px 10px",fontSize:11}}>{r.date}</td>
                  <td style={{padding:"6px 10px",fontFamily:"monospace",fontWeight:700,fontSize:11,color:"#0f172a"}}>{r.turbine_id}</td>
                  <td style={{padding:"6px 10px",fontSize:11,color:"#374151"}}>{r.defect_type}</td>
                  <td style={{padding:"6px 10px"}}><Badge s={r.severity} sm/></td>
                  <td style={{padding:"6px 10px",fontSize:10}}><span style={{background:r.status==="Open"?"#eff6ff":"#f0fdf4",color:r.status==="Open"?"#2563eb":"#16a34a",padding:"1px 7px",borderRadius:10,fontWeight:600}}>{r.status}</span></td>
                  <td style={{padding:"6px 10px",fontWeight:700,fontSize:11,color:r.ai_confidence>=90?"#16a34a":r.ai_confidence>=70?"#b45309":"#dc2626"}}>{r.ai_confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:8}}>
          <span style={{fontSize:10,color:"#94a3b8"}}>Page</span>
          {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)} style={{width:22,height:22,borderRadius:4,border:page===p?"2px solid #2563eb":"1px solid #d1d5db",background:page===p?"#eff6ff":"#fff",color:page===p?"#2563eb":"#374151",fontSize:11,fontWeight:page===p?700:400,cursor:"pointer"}}>{p}</button>
          ))}
          <span style={{marginLeft:"auto",fontSize:10,color:"#94a3b8"}}>AES-256 encrypted • 10k record limit</span>
        </div>
      </div>

      {/* Right – defect review */}
      {selected ? (
        <DefectReviewPanel inspection={selected} onUpdate={handleUpdateInspection} onClose={()=>setSelected(null)} turbines={turbines}/>
      ) : (
        <div style={{flex:"1 1 300px",minWidth:280,background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,color:"#94a3b8",gap:8,minHeight:300}}>
          <div style={{fontSize:40}}>🔍</div>
          <div style={{fontSize:14,fontWeight:700,color:"#374151"}}>Select an inspection</div>
          <div style={{fontSize:12}}>Click any row to review defects</div>
        </div>
      )}
    </div>
  );
}

function DefectReviewPanel({ inspection, onUpdate, onClose, turbines }) {
  const [data, setData] = useState({...inspection});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onUpdate({...data});
    setTimeout(()=>setSaved(false),2500);
  };

  return (
    <div style={{flex:"1 1 300px",minWidth:280,background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#f8fafc"}}>
        <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>Defect Review</div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#94a3b8"}}>✕</button>
      </div>
      <div style={{padding:16}}>
        <div style={{position:"relative",height:180,borderRadius:8,overflow:"hidden",marginBottom:12}}>
          <img src={data.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",top:"30%",left:"55%",width:60,height:50,border:"2.5px solid #ef4444",borderRadius:3}}/>
          <div style={{position:"absolute",top:8,left:8,background:"rgba(15,23,42,0.75)",color:"#fff",fontSize:10,borderRadius:5,padding:"3px 8px",fontWeight:700}}>AI: {data.ai_confidence}% confidence</div>
          <div style={{position:"absolute",bottom:8,right:8,background:"rgba(15,23,42,0.6)",color:"#fff",fontSize:10,borderRadius:4,padding:"2px 7px"}}>{data.image_count} images stored</div>
        </div>

        <div style={{fontSize:12,lineHeight:1.9,marginBottom:12}}>
          <Row label="Inspection ID" val={data.inspection_id}/>
          <Row label="Date" val={data.date}/>
          <Row label="Turbine" val={data.turbine_id}/>
          <Row label="Drone" val={data.drone_id}/>
          <Row label="GPS" val={data.gps}/>
          <Row label="Defect" val={data.defect_type}/>
          <Row label="Classification" val={data.classification}/>
        </div>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,marginBottom:4,color:"#374151"}}>Severity (editable by authorized roles)</div>
          <select value={data.severity} onChange={e=>setData(p=>({...p,severity:e.target.value}))} style={{...selStyle,fontSize:12}}>
            {["LOW","MEDIUM","HIGH","CRITICAL"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{marginBottom:10}}>
          <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>AI Confidence</div>
          <div style={{background:"#e2e8f0",borderRadius:99,height:8,overflow:"hidden",marginBottom:3}}>
            <div style={{width:`${data.ai_confidence}%`,height:"100%",background:data.ai_confidence>=90?"#22c55e":data.ai_confidence>=70?"#f97316":"#ef4444",borderRadius:99}}/>
          </div>
          <div style={{fontSize:10,color:"#94a3b8"}}>≥99% accuracy required • Classification: {data.classification}</div>
        </div>

        <div style={{marginBottom:10}}>
          <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>Technician Evaluation</div>
          <textarea value={data.techEval} onChange={e=>setData(p=>({...p,techEval:e.target.value}))} placeholder="Enter post-mission evaluation…" style={{...inp,height:70,resize:"none"}}/>
        </div>

        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer",marginBottom:12,padding:"9px 12px",borderRadius:8,border:"1px solid #fecaca",background:"#fef2f2"}}>
          <input type="checkbox" checked={data.needsWork} onChange={e=>setData(p=>({...p,needsWork:e.target.checked}))} style={{width:16,height:16}}/>
          <span style={{fontWeight:700,color:"#dc2626"}}>⚑ Flag Turbine {data.turbine_id} as Needs Attention</span>
        </label>

        <button onClick={handleSave} style={{...btnPrimary,width:"100%",padding:"10px",background:saved?"#16a34a":"#0f172a",transition:"background 0.3s"}}>
          {saved?"✓ Updated & Logged":"Update Defect Inspection"}
        </button>
        <div style={{fontSize:10,color:"#94a3b8",textAlign:"center",marginTop:5}}>Edits logged with user + timestamp per audit policy</div>
      </div>
    </div>
  );
}

// ─── WORK ORDERS TAB ──────────────────────────────────────────────────────────

function WorkOrdersTab() {
  const [orders, setOrders] = useState(INIT_INSPECTIONS.filter(i=>i.severity==="HIGH"||i.severity==="CRITICAL").map((i,idx)=>({
    work_order_id:`WO-${2092341+idx}`, turbine_id:i.turbine_id, severity:i.severity, assigned_team:["Team A","Team B","Team C","Team D"][idx%4], status:["Open","Open","FAILED","Closed","Open","Open"][idx%6], last_sync_time:"04/12/2023 10:15AM"
  })));
  const [syncing, setSyncing] = useState(null);
  const [toast, showToast] = useToast();
  const [page, setPage] = useState(1);
  const [syncMode, setSyncMode] = useState("Manual");
  const perPage = 5;

  const handleSync = id => {
    setSyncing(id);
    setTimeout(()=>{
      setSyncing(null);
      setOrders(p=>p.map(o=>o.work_order_id===id?{...o,status:o.status==="FAILED"?"Open":o.status,last_sync_time:new Date().toLocaleString()}:o));
      showToast(`${id} synced — accuracy ≥99.9%`);
    },1400);
  };

  const handleDelete = id => { setOrders(p=>p.filter(o=>o.work_order_id!==id)); showToast(`${id} removed`,"warn"); };
  const paginated = orders.slice((page-1)*perPage,page*perPage);
  const totalPages = Math.ceil(orders.length/perPage);

  const stats=[
    {label:"Total",val:orders.length,color:"#2563eb"},
    {label:"Failed",val:orders.filter(o=>o.status==="FAILED").length,color:"#dc2626"},
    {label:"Open",val:orders.filter(o=>o.status==="Open").length,color:"#f97316"},
    {label:"Closed",val:orders.filter(o=>o.status==="Closed").length,color:"#16a34a"},
  ];

  return (
    <div>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {stats.map(s=><div key={s.label} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div><div style={{fontSize:11,fontWeight:700,color:"#64748b"}}>{s.label}</div></div>)}
      </div>

      <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
        <div style={{fontWeight:700,fontSize:13,color:"#374151"}}>DFMS – TMS Integration</div>
        <div style={{flex:1}}/>
        <select value={syncMode} onChange={e=>setSyncMode(e.target.value)} style={{...selStyle,width:160}}>
          {["Manual","Auto (5 min)","Auto (15 min)"].map(m=><option key={m}>{m}</option>)}
        </select>
        <button onClick={()=>exportCSV("work_orders.csv","WO ID,Turbine,Severity,Team,Status,Last Sync",orders.map(o=>`${o.work_order_id},${o.turbine_id},${o.severity},${o.assigned_team},${o.status},${o.last_sync_time}`))} style={btnPrimary}>Export CSV ↓</button>
      </div>

      <div style={{border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",background:"#fff"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:"#f8fafc"}}>
              {["Work Order ID","Turbine","Severity","Team","Status","Last Sync","Actions"].map(h=>(
                <th key={h} style={{padding:"9px 12px",textAlign:"left",fontWeight:700,color:"#475569",fontSize:11,borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(o=>(
              <tr key={o.work_order_id} style={{borderBottom:"1px solid #f1f5f9"}}>
                <td style={{padding:"8px 12px",color:"#2563eb",fontFamily:"monospace",fontSize:11,fontWeight:600}}>{o.work_order_id}</td>
                <td style={{padding:"8px 12px",fontFamily:"monospace",fontWeight:700,fontSize:12}}>{o.turbine_id}</td>
                <td style={{padding:"8px 12px"}}><Badge s={o.severity} sm/></td>
                <td style={{padding:"8px 12px",color:"#374151"}}>{o.assigned_team}</td>
                <td style={{padding:"8px 12px"}}>
                  {o.status==="FAILED"
                    ?<span style={{background:"#fef2f2",color:"#dc2626",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700}}>FAILED</span>
                    :<span style={{background:o.status==="Open"?"#eff6ff":"#f0fdf4",color:o.status==="Open"?"#2563eb":"#16a34a",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{o.status}</span>}
                </td>
                <td style={{padding:"8px 12px",color:"#94a3b8",fontSize:10}}>{o.last_sync_time}</td>
                <td style={{padding:"8px 12px"}}>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>handleSync(o.work_order_id)} style={{background:syncing===o.work_order_id?"#dbeafe":"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:6,width:28,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>
                      {syncing===o.work_order_id?"⟳":"🔄"}
                    </button>
                    <button onClick={()=>handleDelete(o.work_order_id)} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,width:28,height:26,cursor:"pointer",color:"#ef4444",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:10}}>
        <span style={{fontSize:10,color:"#94a3b8"}}>{orders.length} records • ≤5k export in 10s</span>
        <div style={{flex:1}}/>
        {Array.from({length:Math.min(totalPages,4)},(_,i)=>i+1).map(p=>(
          <button key={p} onClick={()=>setPage(p)} style={{width:22,height:22,borderRadius:4,border:page===p?"2px solid #2563eb":"1px solid #d1d5db",background:page===p?"#eff6ff":"#fff",color:page===p?"#2563eb":"#374151",fontSize:11,cursor:"pointer",fontWeight:page===p?700:400}}>{p}</button>
        ))}
      </div>

      <div style={{marginTop:14,background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0",padding:"12px 16px",fontSize:11,color:"#374151",lineHeight:1.9}}>
        <div>🔁 Auto-retry within <b>5 min</b> on failed sync • Failures red-flagged</div>
        <div>✅ Sync accuracy target: <b>≥99.9%</b> • Status updated within <b>60s</b></div>
        <div>🔒 <b>RBAC enforced</b> on all sync & export actions • TLS 1.2+</div>
        <div>📄 Export logged for compliance audit per AC policy</div>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

const NAV = [
  { key:"turbines",    icon:"🏗", label:"Turbines" },
  { key:"drones",      icon:"🚁", label:"Drones" },
  { key:"scheduling",  icon:"📅", label:"Scheduling" },
  { key:"inspections", icon:"🔍", label:"Inspections" },
  { key:"workorders",  icon:"🔧", label:"Work Orders" },
];

export default function App() {
  const [tab, setTab] = useState("turbines");

  return (
    <div style={{minHeight:"100vh",background:"#f1f5f9",fontFamily:"'IBM Plex Sans',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;600;700&display=swap'); *{box-sizing:border-box}`}</style>

      {/* Navbar */}
      <div style={{background:"#0f172a",height:54,display:"flex",alignItems:"center",padding:"0 24px",borderBottom:"1px solid #1e293b",gap:0}}>
        <div style={{color:"#fff",fontWeight:800,fontSize:15,letterSpacing:"-0.03em",marginRight:28}}>⟨ Wind<span style={{color:"#38bdf8"}}>Vision</span> <span style={{color:"#334155",fontWeight:400,fontSize:13}}>DFMS</span></div>
        {NAV.map(n=>(
          <button key={n.key} onClick={()=>setTab(n.key)} style={{background:"none",border:"none",height:54,padding:"0 14px",color:tab===n.key?"#fff":"#64748b",fontSize:12,fontWeight:tab===n.key?700:500,cursor:"pointer",borderBottom:tab===n.key?"2px solid #38bdf8":"2px solid transparent",display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
            <span style={{fontSize:15}}>{n.icon}</span> {n.label}
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e"}}/>
          <span style={{color:"#475569",fontSize:11}}>Live</span>
        </div>
      </div>

      {/* Page title bar */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"12px 24px"}}>
        <div style={{fontWeight:800,fontSize:18,color:"#0f172a",letterSpacing:"-0.02em"}}>
          {NAV.find(n=>n.key===tab)?.icon} {NAV.find(n=>n.key===tab)?.label}
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"20px 24px"}}>
        {tab==="turbines"    && <TurbinesTab/>}
        {tab==="drones"      && <DronesTab/>}
        {tab==="scheduling"  && <SchedulingTab/>}
        {tab==="inspections" && <InspectionsTab/>}
        {tab==="workorders"  && <WorkOrdersTab/>}
      </div>
    </div>
  );
}
