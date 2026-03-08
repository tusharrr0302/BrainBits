import { useState } from "react";

// ── Design tokens — exact match to dashboard CSS ──────────────────────────────
const T = {
  // bg:          "#0b1118",
  bgCard:      "#0b1118",
  bgHover:     "#0f1923",
  bgInput:     "#0b1118",
  border:      "#1e2d3d",
  borderHover: "#3a5472",
  accent:      "#20a0c0",
  accentDim:   "rgba(32,160,192,0.12)",
  textPrimary: "#e2eaf4",
  textMid:     "#c8d6e5",
  textMuted:   "#8aaac8",
  textDim:     "#3a5472",
  textGhost:   "#2a3d52",
  fontMono:    "'DM Mono', monospace",
  fontSans:    "'DM Sans', sans-serif",
  dsa:     { bg:"rgba(126,231,135,0.07)", border:"rgba(126,231,135,0.22)", text:"#7ee787" },
  web:     { bg:"rgba(32,160,192,0.09)",  border:"rgba(32,160,192,0.28)",  text:"#20a0c0" },
  android: { bg:"rgba(138,170,200,0.07)", border:"rgba(138,170,200,0.18)", text:"#8aaac8" },
  ml:      { bg:"rgba(255,161,22,0.07)",  border:"rgba(255,161,22,0.22)",  text:"#ffa116" },
  diff:    { easy:"#7ee787", medium:"#ffa116", hard:"#f87171" },
};

const learningPaths = ["DSA only", "DSA + Web Development", "DSA + Android Development", "DSA + AI/ML"];
const daysOfWeek    = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const mockSchedule = {
  Monday:    [{ time:"09:00", duration:90,  topic:"Arrays & Strings",   type:"dsa", difficulty:"medium" },
              { time:"19:00", duration:60,  topic:"React Hooks",         type:"web", difficulty:"easy"   }],
  Tuesday:   [{ time:"10:00", duration:120, topic:"Dynamic Programming", type:"dsa", difficulty:"hard"   }],
  Wednesday: [{ time:"09:00", duration:90,  topic:"Binary Trees",        type:"dsa", difficulty:"medium" },
              { time:"20:00", duration:60,  topic:"REST APIs",           type:"web", difficulty:"easy"   }],
  Thursday:  [{ time:"11:00", duration:90,  topic:"Graph Algorithms",    type:"dsa", difficulty:"hard"   }],
  Friday:    [{ time:"09:00", duration:60,  topic:"Sorting Algorithms",  type:"dsa", difficulty:"easy"   },
              { time:"18:00", duration:90,  topic:"Node.js Basics",      type:"web", difficulty:"medium" }],
  Saturday:  [{ time:"10:00", duration:180, topic:"Full Stack Project",  type:"web", difficulty:"hard"   }],
  Sunday:    [],
};

function Breadcrumb({ extra }) {
  return (
    <div style={{ fontFamily:T.fontMono, fontSize:11, color:T.textGhost, letterSpacing:"0.04em", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
      <span>Home Page</span><span>/</span>
      <span style={{ color:T.textDim }}>Study Planner</span>
      {extra}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily:T.fontMono, fontSize:10, fontWeight:600, letterSpacing:"0.1em", color:T.textGhost, marginBottom:12, textTransform:"uppercase", display:"flex", alignItems:"center" }}>
      {children}
    </div>
  );
}

// ── PathSelectionView ─────────────────────────────────────────────────────────
function PathSelectionView({ onPlanCreated }) {
  const [selectedPath, setSelectedPath]   = useState("");
  const [weeklyHours, setWeeklyHours]     = useState(20);
  const [preferredDays, setPreferredDays] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const toggleDay = (d) => setPreferredDays(p => p.includes(d) ? p.filter(x=>x!==d) : [...p,d]);

  const handleSubmit = async () => {
    if (!selectedPath)         { setError("Please select a learning path"); return; }
    if (!preferredDays.length) { setError("Please select at least one preferred study day"); return; }
    setLoading(true); setError(null);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    onPlanCreated({ path:selectedPath, hours:weeklyHours, days:preferredDays });
  };

  return (
    <div className="sp-page" style={S.page}>
      <Breadcrumb />

      {/* Welcome block */}
      <div style={S.welcomeBlock}>
        <div>
          <div style={S.eyebrow}>YOUR STUDY PLANNER</div>
          <div style={S.welcomeName}>Plan Your Path</div>
          <div style={S.welcomeDesc}>Configure your personalized AI-powered study schedule</div>
        </div>
        <div style={S.wStats}>
          {[["∞","PATHS"],["AI","POWERED"],["24/7","ACCESS"]].map(([v,l],i,arr) => (
            <div key={l} style={{ display:"flex", alignItems:"center" }}>
              <div style={S.wStat}>
                <span style={S.wStatVal}>{v}</span>
                <span style={S.wStatLbl}>{l}</span>
              </div>
              {i < arr.length-1 && <div style={S.wDivider}/>}
            </div>
          ))}
        </div>
      </div>

      {error && <div style={S.errorBox}>{error}</div>}

      <SectionLabel>Configuration</SectionLabel>
      <div style={S.card}>
        <div className="sp-form-grid" style={S.formGrid}>

          {/* LEFT */}
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
            <div>
              <div style={S.fieldLabel}>Select Learning Path <span style={{ color:"#f87171" }}>*</span></div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {learningPaths.map(path => {
                  const active = selectedPath === path;
                  return (
                    <button key={path} onClick={() => setSelectedPath(path)} style={{
                      ...S.pathBtn,
                      borderColor: active ? T.accent   : T.border,
                      background:  active ? T.accentDim: T.bgHover,
                    }}>
                      <div style={{
                        width:16, height:16, borderRadius:"50%",
                        border:`2px solid ${active ? T.accent : T.borderHover}`,
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        {active && <div style={{ width:7, height:7, borderRadius:"50%", background:T.accent }}/>}
                      </div>
                      <span style={{ fontFamily:T.fontMono, fontSize:12, color: active ? T.textPrimary : T.textMuted }}>
                        {path}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={S.fieldLabel}>Preferred Study Days <span style={{ color:"#f87171" }}>*</span></div>
              <div className="sp-days-grid" style={{ gap:8 }}>
                {daysOfWeek.map(day => {
                  const active = preferredDays.includes(day);
                  return (
                    <button key={day} onClick={() => toggleDay(day)} style={{
                      ...S.dayBtn,
                      borderColor: active ? T.accent   : T.border,
                      background:  active ? T.accentDim: T.bgHover,
                      color:       active ? T.textPrimary : T.textDim,
                    }}>
                      {day.slice(0,3)}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontFamily:T.fontMono, fontSize:10, color:T.textGhost, marginTop:8 }}>
                {preferredDays.length} day{preferredDays.length!==1?"s":""} selected
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
            <div>
              <div style={S.fieldLabel}>Weekly Available Hours <span style={{ color:"#f87171" }}>*</span></div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:14 }}>
                <span style={{ fontFamily:T.fontMono, fontSize:46, fontWeight:600, color:T.textPrimary, lineHeight:1 }}>{weeklyHours}</span>
                <span style={{ fontFamily:T.fontMono, fontSize:13, color:T.textDim }}>hrs / week</span>
              </div>
              <input type="range" min="5" max="60" value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                style={{ width:"100%" ,background:"#1e2d3d", borderRadius:2, height:8 }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:T.fontMono, fontSize:10, color:T.textGhost, marginBottom:20 }}>
                <span>5 hrs</span><span>60 hrs</span>
              </div>

              <div style={{ background:T.bgHover, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                <div style={{ fontFamily:T.fontMono, fontSize:9, color:T.textGhost, letterSpacing:"0.08em", marginBottom:12 }}>DAILY AVERAGE</div>
                <div style={{ display:"flex", gap:8, height:60, alignItems:"flex-end" }}>
                  {daysOfWeek.slice(0,5).map(d => {
                    const h   = preferredDays.includes(d) ? weeklyHours / Math.max(preferredDays.length,1) : 0;
                    const pct = Math.min((h/12)*100, 100);
                    return (
                      <div key={d} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%", justifyContent:"flex-end" }}>
                        <div style={{
                          width:"100%", borderRadius:"3px 3px 0 0", transition:"height 0.3s ease",
                          height:`${Math.max(pct,4)}%`, minHeight:3,
                          background: preferredDays.includes(d) ? T.accent : T.border,
                          opacity: preferredDays.includes(d) ? 1 : 0.5,
                        }}/>
                        <span style={{ fontFamily:T.fontMono, fontSize:9, color:T.textGhost }}>{d.slice(0,1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedPath && preferredDays.length > 0 && (
              <div style={{ background:T.bgHover, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
                <div style={{ fontFamily:T.fontMono, fontSize:9, color:T.textGhost, letterSpacing:"0.12em", marginBottom:14 }}>PLAN SUMMARY</div>
                {[
                  ["Path",       selectedPath,                                           T.textMid],
                  ["Hours/Week", `${weeklyHours} hrs`,                                   T.accent],
                  ["Study Days", preferredDays.map(d=>d.slice(0,3)).join(", "),          T.textMid],
                  ["Daily Avg",  `${(weeklyHours/preferredDays.length).toFixed(1)} hrs`, T.textMuted],
                ].map(([k,v,col]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textGhost }}>{k}</span>
                    <span style={{ fontFamily:T.fontMono, fontSize:12, color:col, textAlign:"right", maxWidth:200 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              ...S.submitBtn,
              opacity: loading ? 0.5 : 1,
              cursor:  loading ? "not-allowed" : "pointer",
            }}>
              {loading ? (
                <span style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
                  <span style={S.spinner}/>Generating your schedule...
                </span>
              ) : "Generate Schedule →"}
            </button>
          </div>
        </div>
      </div>

      <style>{cssBlock}</style>
    </div>
  );
}

// ── PlanView ──────────────────────────────────────────────────────────────────
function PlanView({ plan, onReset }) {
  const [activeDay, setActiveDay] = useState(plan.days[0] || "Monday");
  const todaySessions = mockSchedule[activeDay] || [];
  const totalSessions = Object.values(mockSchedule).flat().length;

  return (
    <div className="sp-page" style={S.page}>
      <Breadcrumb extra={
        <button onClick={onReset} style={S.relinkBtn}>Change Plan</button>
      }/>

      <div style={S.welcomeBlock}>
        <div>
          <div style={S.eyebrow}>YOUR LEARNING HUB</div>
          <div style={S.welcomeName}>Study Schedule</div>
          <div style={S.welcomeDesc}>{plan.path} · {plan.hours} hrs / week</div>
        </div>
        <div style={S.wStats}>
          {[[plan.days.length,"STUDY DAYS"],[plan.hours,"WEEKLY HRS"],[totalSessions,"SESSIONS"]].map(([v,l],i,arr) => (
            <div key={l} style={{ display:"flex", alignItems:"center" }}>
              <div style={S.wStat}>
                <span style={S.wStatVal}>{v}</span>
                <span style={S.wStatLbl}>{l}</span>
              </div>
              {i < arr.length-1 && <div style={S.wDivider}/>}
            </div>
          ))}
        </div>
      </div>

      <SectionLabel>Weekly Schedule</SectionLabel>
      <div className="sp-week-grid">
        {daysOfWeek.map(day => {
          const sessions   = mockSchedule[day] || [];
          const isStudyDay = plan.days.includes(day);
          const isActive   = activeDay === day;
          const totalMins  = sessions.reduce((a,s)=>a+s.duration,0);
          return (
            <button key={day} onClick={() => setActiveDay(day)} style={{
              padding:"14px 10px", borderRadius:12, border:"1px solid",
              borderColor: isActive ? T.accent : isStudyDay ? T.borderHover : T.border,
              background:  isActive ? T.accentDim : isStudyDay ? T.bgHover : T.bgCard,
              cursor:"pointer", transition:"all 0.2s", display:"flex", flexDirection:"column",
            }}>
              <div style={{ fontFamily:T.fontMono, fontSize:10, fontWeight:600, letterSpacing:"0.06em", color: isActive ? T.accent : T.textGhost, marginBottom:8 }}>
                {day.slice(0,3).toUpperCase()}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:3, marginBottom:8, flex:1 }}>
                {sessions.slice(0,3).map((s,i) => (
                  <div key={i} style={{ height:3, borderRadius:2, background:(T[s.type]||T.dsa).text, width:`${Math.min((s.duration/120)*100,100)}%`, opacity:0.6 }}/>
                ))}
                {!sessions.length && <div style={{ height:3, borderRadius:2, background:T.border, width:"100%" }}/>}
              </div>
              <div style={{ fontFamily:T.fontMono, fontSize:10, color: totalMins>0 ? T.textMuted : T.textGhost }}>
                {totalMins>0 ? `${(totalMins/60).toFixed(1)}h` : "—"}
              </div>
            </button>
          );
        })}
      </div>

      <SectionLabel>
        {activeDay}'s Sessions
        <span style={{ color:T.textGhost, fontWeight:400, marginLeft:10, textTransform:"none" }}>
          — {todaySessions.length} session{todaySessions.length!==1?"s":""}
        </span>
      </SectionLabel>

      {todaySessions.length === 0 ? (
        <div style={{ textAlign:"center", padding:"56px 0", marginBottom:24, background:T.bgHover, borderRadius:14, border:`1px dashed ${T.border}` }}>
          <div style={{ fontSize:28, marginBottom:10 }}>🌙</div>
          <div style={{ fontFamily:T.fontMono, fontSize:12, color:T.textGhost }}>Rest day — no sessions scheduled</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
          {todaySessions.map((session,i) => {
            const tc = T[session.type] || T.dsa;
            return (
              <div key={i} style={{
                display:"flex", alignItems:"stretch", gap:20,
                padding:"18px 22px", borderRadius:14,
                border:`1px solid ${tc.border}`, background:tc.bg,
                animation:`fadeUp 0.25s ease ${i*0.07}s both`,
              }}>
                <div style={{ display:"flex", flexDirection:"column", minWidth:56, justifyContent:"center" }}>
                  <span style={{ fontFamily:T.fontMono, fontSize:15, color:T.textPrimary }}>{session.time}</span>
                  <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textGhost, marginTop:3 }}>{session.duration} min</span>
                </div>
                <div style={{ width:1, background:T.border }}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                    <span style={{ fontFamily:T.fontMono, fontSize:9, fontWeight:600, letterSpacing:"0.08em", border:`1px solid ${tc.border}`, padding:"2px 8px", borderRadius:4, color:tc.text }}>
                      {session.type.toUpperCase()}
                    </span>
                    <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.diff[session.difficulty] }}>● {session.difficulty}</span>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:T.textPrimary, fontFamily:T.fontSans }}>{session.topic}</div>
                </div>
                <div style={{ width:4, background:T.border, borderRadius:3, overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end", minHeight:50 }}>
                  <div style={{ width:"100%", height:`${Math.min((session.duration/180)*100,100)}%`, background:tc.text, opacity:0.4, borderRadius:3 }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SectionLabel>Weekly Load Distribution</SectionLabel>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,minmax(0,1fr))", gap:10,
        background:T.bgHover, border:`1px solid ${T.border}`, borderRadius:14,
        padding:20, marginBottom:32, width:"100%", boxSizing:"border-box" }}>
        {daysOfWeek.map(day => {
          const sessions  = mockSchedule[day] || [];
          const totalMins = sessions.reduce((a,s)=>a+s.duration,0);
          const pct       = Math.min(totalMins/180,1);
          return (
            <div key={day} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <div style={{ width:"100%", height:72, background:T.border, borderRadius:6, overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                <div style={{ width:"100%", height:`${Math.max(pct*100, sessions.length>0?8:0)}%`,
                  background: pct>0.6 ? T.accent : T.borderHover,
                  borderRadius:"4px 4px 0 0", transition:"height 0.4s ease" }}/>
              </div>
              <span style={{ fontFamily:T.fontMono, fontSize:9, color:T.textGhost }}>{day.slice(0,3)}</span>
            </div>
          );
        })}
      </div>

      <style>{cssBlock}</style>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function StudyPlanner() {
  const [plan, setPlan] = useState(null);
  return (
    <div style={{ width:"100%", minHeight:"100vh", background:T.bg, boxSizing:"border-box" }}>
      {plan
        ? <PlanView plan={plan} onReset={() => setPlan(null)}/>
        : <PathSelectionView onPlanCreated={setPlan}/>}
    </div>
  );
}

// ── Shared CSS ────────────────────────────────────────────────────────────────
const cssBlock = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');
  input[type=range]{-webkit-appearance:none;width:100%;background:transparent;}
  input[type=range]::-webkit-slider-track{height:3px;background:#1e2d3d;border-radius:2px;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#20a0c0;margin-top:-6.5px;cursor:pointer;border:2px solid #0b1118;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}

  .sp-page {
    width: 80%;
    margin-left: 230px;
    min-height: 100vh;
    padding: 32px;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  .sp-form-grid {
    display: grid;
    grid-template-columns: minmax(0,1fr) minmax(0,1fr);
    gap: 40px;
  }
  .sp-week-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0,1fr));
    gap: 10px;
    margin-bottom: 24px;
    width: 100%;
  }
  .sp-days-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  @media (max-width: 900px) {
    .sp-page {
      width: 100% !important;
      margin-left: 0 !important;
      padding: 20px 16px !important;
    }
    .sp-form-grid {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
    }
    .sp-week-grid {
      grid-template-columns: repeat(4, minmax(0,1fr)) !important;
    }
    .sp-days-grid {
      grid-template-columns: repeat(4, 1fr) !important;
    }
  }
  @media (max-width: 480px) {
    .sp-week-grid {
      grid-template-columns: repeat(3, minmax(0,1fr)) !important;
    }
  }
`;

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily:T.fontSans, color:T.textMid,
  },
  welcomeBlock: {
    background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:16,
    padding:"24px 28px", display:"flex", alignItems:"center",
    justifyContent:"space-between", gap:32, flexWrap:"wrap", marginBottom:24,
    width:"100%", boxSizing:"border-box",
  },
  eyebrow:     { fontFamily:T.fontMono, fontSize:10, fontWeight:600, letterSpacing:"0.1em", color:T.textGhost, marginBottom:5 },
  welcomeName: { fontSize:22, fontWeight:800, color:T.textPrimary, letterSpacing:"-0.01em", lineHeight:1.2, marginBottom:4 },
  welcomeDesc: { fontSize:12, color:T.textDim, lineHeight:1.5, maxWidth:360 },
  wStats:  { display:"flex", alignItems:"center", flexShrink:0 },
  wStat:   { display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"0 24px" },
  wStatVal:{ fontFamily:T.fontMono, fontSize:20, fontWeight:600, color:T.textPrimary, lineHeight:1 },
  wStatLbl:{ fontFamily:T.fontMono, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.08em", color:T.textGhost },
  wDivider:{ width:1, height:36, background:T.border, flexShrink:0 },
  card: {
    background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:16,
    padding:"28px 32px", marginBottom:28, width:"100%", boxSizing:"border-box",
  },
  formGrid:   { /* layout via .sp-form-grid */ },
  fieldLabel: { fontFamily:T.fontMono, fontSize:10, fontWeight:600, letterSpacing:"0.08em", color:T.textGhost, textTransform:"uppercase", marginBottom:12 },
  pathBtn: {
    display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
    borderRadius:10, border:"1px solid", cursor:"pointer", transition:"border-color 0.15s, background 0.15s",
    textAlign:"left", width:"100%",
  },
  dayBtn: {
    padding:"9px 6px", borderRadius:8, border:"1px solid",
    cursor:"pointer", fontFamily:T.fontMono, fontSize:11, fontWeight:600,
    transition:"border-color 0.15s, background 0.15s, color 0.15s", letterSpacing:"0.02em",
  },
  submitBtn: {
    width:"100%", padding:"13px 20px",
    background:T.bgHover, border:`1px solid ${T.border}`, borderRadius:10,
    color:T.textMuted, fontFamily:T.fontMono, fontSize:12, fontWeight:600,
    letterSpacing:"0.04em", transition:"background 0.15s, color 0.15s, border-color 0.15s",
  },
  spinner: {
    display:"inline-block", width:14, height:14,
    border:`2px solid ${T.border}`, borderTopColor:T.accent,
    borderRadius:"50%", animation:"spin 0.7s linear infinite",
  },
  errorBox: {
    background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.22)",
    borderRadius:10, padding:"11px 16px", color:"#f87171",
    fontFamily:T.fontMono, fontSize:11, marginBottom:20,
  },
  relinkBtn: {
    marginLeft:"auto", background:"none", border:`1px solid ${T.border}`,
    borderRadius:6, color:T.textDim, fontFamily:T.fontMono,
    fontSize:10, padding:"4px 12px", cursor:"pointer", letterSpacing:"0.03em",
    transition:"border-color 0.15s, color 0.15s",
  },
};