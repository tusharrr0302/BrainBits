import { useEffect, useState, useRef } from "react";
import "./ActivityGraph.css";

// ─── helpers ────────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["S","M","T","W","T","F","S"];

function getMonthLabel(ts) {
  const d = new Date(ts * 1000);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Build a weeks×7 grid from a unix-timestamp keyed calendar object
function buildWeekGrid(calendarObj, year) {
  // collect all days of the year
  const start = new Date(year, 0, 1);
  const end   = new Date(year, 11, 31);
  const cells = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    cells.push(new Date(d));
  }

  // pad front to Sunday
  const pad = cells[0].getDay();
  const rows = [];
  let week = Array(pad).fill(null);
  for (const d of cells) {
    week.push(d);
    if (week.length === 7) { rows.push(week); week = []; }
  }
  if (week.length) rows.push(week);

  return rows;
}

// Get LC count for a Date from unix-keyed calendar
function getLCCount(calendarObj, date) {
  if (!calendarObj || !date) return 0;
  // LC uses IST offset (+5:30 = 19800s) adjustment in the original code
  const ts = Math.floor(date.getTime() / 1000) + 19800;
  // try a small window around midnight
  for (let delta of [0, -86400, 86400, 19800, -19800]) {
    const v = calendarObj[String(ts + delta)];
    if (v !== undefined) return v;
  }
  return 0;
}

// Get GH level for a Date
function getGHLevel(ghData, date, year) {
  if (!ghData || !date) return 0;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return ghData?.contributions?.[year]?.[m]?.[d]?.level ?? 0;
}

// Color scales — no gradients, flat solid blocks
const GH_COLORS = ["#1a2332", "#1e3a1e", "#2d6a2d", "#3da03d", "#5cde5c"];
const LC_COLORS = ["#1a2332", "#1a2e3a", "#1a4a5e", "#1a6e8e", "#20a0c0"];

function levelColor(level, colors) {
  return colors[Math.min(level, 4)] ?? colors[0];
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

function Heatmap({ title, accent, weekGrid, getLevel, year, colorScale }) {
  const [tooltip, setTooltip] = useState(null);

  // month label positions
  const monthLabels = [];
  weekGrid.forEach((week, wi) => {
    week.forEach(d => {
      if (d && d.getDate() === 1) {
        monthLabels.push({ wi, label: MONTHS[d.getMonth()] });
      }
    });
  });

  return (
    <div className="heatmap-block">
      <div className="heatmap-header">
        <span className="heatmap-title" style={{ color: accent }}>{title}</span>
        <div className="heatmap-legend">
          {colorScale.map((c, i) => (
            <span key={i} className="legend-cell" style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="heatmap-scroll">
        {/* month row */}
        <div className="month-row">
          <div className="day-col-spacer" />
          {weekGrid.map((_, wi) => {
            const lbl = monthLabels.find(m => m.wi === wi);
            return (
              <div key={wi} className="month-cell">
                {lbl ? lbl.label : ""}
              </div>
            );
          })}
        </div>

        {/* day labels + grid */}
        <div className="grid-row">
          <div className="day-col">
            {DAYS.map((d, i) => (
              <span key={i} className="day-label">{i % 2 === 1 ? d : ""}</span>
            ))}
          </div>
          <div className="week-grid">
            {weekGrid.map((week, wi) => (
              <div key={wi} className="week-col">
                {week.map((d, di) => {
                  if (!d) return <div key={di} className="heat-cell empty" />;
                  const lvl = getLevel(d);
                  const bg  = levelColor(lvl, colorScale);
                  const label = `${d.toDateString()} · level ${lvl}`;
                  return (
                    <div
                      key={di}
                      className="heat-cell"
                      style={{ background: bg }}
                      title={label}
                      onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, text: label })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip && (
        <div className="heatmap-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 32 }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

// ─── Life Graph (monthly bar comparison) ─────────────────────────────────────

function LifeGraph({ ghData, lcData, year }) {
  const [hovered, setHovered] = useState(null);

  const monthlyData = MONTHS.map((label, mi) => {
    const monthNum = mi + 1;
    // GH: sum counts
    const ghMonth = ghData?.contributions?.[year]?.[monthNum] ?? {};
    const ghTotal = Object.values(ghMonth).reduce((s, d) => s + (d.count || 0), 0);

    // LC: sum from unix calendar — iterate each day of the month
    let lcTotal = 0;
    if (lcData) {
      const days = new Date(year, mi + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const date = new Date(year, mi, d);
        lcTotal += getLCCount(lcData, date);
      }
    }

    return { label, ghTotal, lcTotal };
  });

  const maxVal = Math.max(...monthlyData.flatMap(m => [m.ghTotal, m.lcTotal]), 1);

  return (
    <div className="lifegraph-block">
      <div className="lifegraph-header">
        <span className="lifegraph-title">Activity — {year}</span>
        <div className="lifegraph-legend">
          <span className="lg-dot" style={{ background: "#5cde5c" }} /> GitHub (Dev)
          <span className="lg-dot" style={{ background: "#20a0c0" }} /> LeetCode (DSA)
        </div>
      </div>

      <div className="lifegraph-chart">
        {/* Y axis */}
        <div className="y-axis">
          {[maxVal, Math.round(maxVal / 2), 0].map((v, i) => (
            <span key={i} className="y-label">{v}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="bars-area">
          <div className="grid-lines">
            {[0, 1, 2].map(i => <div key={i} className="grid-line" />)}
          </div>
          {monthlyData.map((m, i) => {
            const ghH = (m.ghTotal / maxVal) * 100;
            const lcH = (m.lcTotal / maxVal) * 100;
            const isHov = hovered === i;
            return (
              <div
                key={i}
                className={`bar-group ${isHov ? "hov" : ""}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {isHov && (
                  <div className="bar-tooltip">
                    <strong>{m.label}</strong>
                    <div style={{ color: "#5cde5c" }}>Dev  {m.ghTotal}</div>
                    <div style={{ color: "#20a0c0" }}>DSA  {m.lcTotal}</div>
                  </div>
                )}
                <div className="bars-pair">
                  <div
                    className="bar gh-bar"
                    style={{ height: `${ghH}%` }}
                    title={`GitHub: ${m.ghTotal}`}
                  />
                  <div
                    className="bar lc-bar"
                    style={{ height: `${lcH}%` }}
                    title={`LeetCode: ${m.lcTotal}`}
                  />
                </div>
                <span className="x-label">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ActivityGraph({ ghUserName = "Aditya-Pandey-GH", lcUserName = "your-lc-username" }) {
  const [ghData, setGHData] = useState(null);
  const [lcData, setLCData] = useState(null);
  const [year, setYear]     = useState(new Date().getFullYear());
  const [tab, setTab]       = useState("both"); // "gh" | "lc" | "both"
  const [loading, setLoading] = useState(true);

  const curYear = new Date().getFullYear();

  useEffect(() => {
    setLoading(true);
    const promises = [
      fetch(`https://github-contributions-api.jogruber.de/v4/${ghUserName}?format=nested&y=${year}`)
        .then(r => r.json()).catch(() => null),
      fetch(`https://alfa-leetcode-api-adi.vercel.app/${lcUserName}/calendar?year=${year}`)
        .then(r => r.json())
        .then(d => {
          try { return JSON.parse(d?.submissionCalendar); } catch { return null; }
        }).catch(() => null),
    ];
    Promise.all(promises).then(([gh, lc]) => {
      setGHData(gh);
      setLCData(lc);
      setLoading(false);
    });
  }, [year, ghUserName, lcUserName]);

  const weekGrid = buildWeekGrid({}, year);

  const ghGetLevel = (d) => getGHLevel(ghData, d, year);
  const lcGetLevel = (d) => {
    const count = getLCCount(lcData, d);
    if (count >= 8) return 4;
    if (count >= 5) return 3;
    if (count >= 2) return 2;
    if (count >= 1) return 1;
    return 0;
  };

  return (
    <div className="ag-root">
      {/* Header */}
      <div className="ag-topbar">
        <div className="ag-title-row">
          <h2 className="ag-title">Code Activity</h2>
          <div className="ag-year-nav">
            <button
              className="ag-yr-btn"
              onClick={() => setYear(y => y - 1)}
              disabled={year <= 2020}
            >‹</button>
            <span className="ag-year">{year}</span>
            <button
              className="ag-yr-btn"
              onClick={() => setYear(y => y + 1)}
              disabled={year >= curYear}
            >›</button>
          </div>
        </div>

        <div className="ag-tabs">
          {["both","gh","lc"].map(t => (
            <button
              key={t}
              className={`ag-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "both" ? "Both" : t === "gh" ? "GitHub" : "LeetCode"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ag-loading">
          <span className="ag-spinner" />
          Loading activity…
        </div>
      ) : (
        <div className="ag-body">
          {/* Life Graph — always visible */}
          <LifeGraph ghData={ghData} lcData={lcData} year={year} />

          {/* Heatmaps */}
          <div className="ag-heatmaps">
            {(tab === "both" || tab === "gh") && (
              <Heatmap
                title="GitHub · Dev"
                accent="#5cde5c"
                weekGrid={weekGrid}
                getLevel={ghGetLevel}
                year={year}
                colorScale={GH_COLORS}
              />
            )}
            {(tab === "both" || tab === "lc") && (
              <Heatmap
                title="LeetCode · DSA"
                accent="#20a0c0"
                weekGrid={weekGrid}
                getLevel={lcGetLevel}
                year={year}
                colorScale={LC_COLORS}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}