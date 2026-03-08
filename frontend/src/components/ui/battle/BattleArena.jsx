// src/components/ui/battle/BattleArena.jsx

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useBattle } from "../../contexts/BattleContext";
import { runCode, submitCode } from "../../api/battleAPI";
import styles from "./BattleArena.module.css";

const MONACO_LANG = { python: "python", javascript: "javascript", java: "java", cpp: "cpp" };

export default function BattleArena() {
	const { state, actions, socket } = useBattle();
	const { question, settings, remaining, opponentSubmission, opponentTyping } = state;

	const [activeTab, setActiveTab] = useState("desc");
	const [code, setCode] = useState("");
	const [running, setRunning] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [runResults, setRunResults] = useState(null);
	const typingTimer = useRef(null);

	// Set starter code when question loads
	useEffect(() => {
		if (question) {
			setCode(question.starterCode?.[settings.language] || "// Write your solution here");
		}
	}, [question?.id, settings.language]);

	const handleCodeChange = (val) => {
		setCode(val || "");
		// Debounce typing indicator
		clearTimeout(typingTimer.current);
		typingTimer.current = setTimeout(() => {
			socket.current?.emit("battle:typing", { roomCode: state.roomCode });
		}, 400);
	};

	const handleRun = async () => {
		if (running || !code.trim()) return;
		setRunning(true);
		setRunResults(null);
		try {
			const data = await runCode(settings.language, code, question.testCases.slice(0, 2));
			setRunResults({ ...data, mode: "run" });
		} catch (err) {
			setRunResults({ error: err.error || "Execution failed", mode: "run" });
		} finally {
			setRunning(false);
		}
	};

	const handleSubmit = async () => {
		if (submitting || submitted || !code.trim()) return;
		setSubmitting(true);
		const submittedAt = Date.now();
		try {
			const data = await submitCode(settings.language, code, question.testCases, submittedAt);
			setRunResults({ ...data, mode: "submit" });
			setSubmitted(true);
			actions.setSubmission(data);
			socket.current?.emit("battle:submit", {
				roomCode: state.roomCode,
				results: data.results,
				submittedAt,
			});
		} catch (err) {
			setRunResults({ error: err.error || "Submission failed", mode: "submit" });
		} finally {
			setSubmitting(false);
		}
	};

	if (!question)
		return (
			<div className={styles.loading}>
				<div className={styles.spinner} />
				<p>Loading question…</p>
			</div>
		);

	const mins = Math.floor(remaining / 60);
	const secs = remaining % 60;
	const pct = Math.max(0, (remaining / state.duration) * 100);
	const timerWarn = remaining <= 300;
	const timerCrit = remaining <= 60;

	return (
		<div className={styles.root}>
			{/* ── Top bar ───────────────────────────────────────────────────────── */}
			<div className={styles.topbar}>
				<div className={styles.roomInfo}>
					<span className={styles.roomLabel}>ROOM</span>
					<span className={styles.roomCode}>{state.roomCode}</span>
				</div>

				<div className={styles.center}>
					<span className={styles.qTitle}>{question.title}</span>
					<div className={styles.badges}>
						<span className={`${styles.badge} ${styles[`badge_${question.difficulty.toLowerCase()}`]}`}>{question.difficulty}</span>
						<span className={`${styles.badge} ${styles.badgeCyan}`}>{question.category}</span>
					</div>
				</div>

				<div className={`${styles.timer} ${timerCrit ? styles.timerCrit : timerWarn ? styles.timerWarn : ""}`}>
					<span className={styles.timerIcon}>⏱</span>
					<span className={styles.timerVal}>
						{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
					</span>
					<div className={styles.timerBar}>
						<div className={styles.timerFill} style={{ width: `${pct}%` }} />
					</div>
				</div>
			</div>

			{/* ── Opponent bar ──────────────────────────────────────────────────── */}
			<div className={styles.oppBar}>
				<div className={styles.oppInfo}>
					<span className={styles.dotOnline} />
					<span className={styles.oppLabel}>Opponent:</span>
					<span className={styles.oppName}>{state.opponentName}</span>
					{opponentTyping && <span className={styles.typing}>typing…</span>}
				</div>
				{opponentSubmission ? (
					<span className={`${styles.oppResult} ${opponentSubmission.passed === opponentSubmission.total ? styles.oppResultPerfect : ""}`}>
						Submitted {opponentSubmission.passed}/{opponentSubmission.total} · {fmtMs(opponentSubmission.time)}
					</span>
				) : (
					<span className={styles.oppWorking}>
						<span className={styles.oppDot} /> Working…
					</span>
				)}
				<div className={styles.oppBar2}>
					<div
						className={styles.oppBarFill}
						style={{ width: opponentSubmission ? `${(opponentSubmission.passed / question.testCases.length) * 100}%` : "0%" }}
					/>
				</div>
			</div>

			{/* ── Main split ────────────────────────────────────────────────────── */}
			<div className={styles.main}>
				{/* Problem panel */}
				<div className={styles.problem}>
					<div className={styles.tabs}>
						<button className={`${styles.tab} ${activeTab === "desc" ? styles.tabActive : ""}`} onClick={() => setActiveTab("desc")}>
							Description
						</button>
						<button className={`${styles.tab} ${activeTab === "ex" ? styles.tabActive : ""}`} onClick={() => setActiveTab("ex")}>
							Examples
						</button>
					</div>
					<div className={styles.problemBody}>{activeTab === "desc" ? <DescTab q={question} /> : <ExTab q={question} />}</div>
				</div>

				{/* Editor panel */}
				<div className={styles.editorPanel}>
					<div className={styles.editorBar}>
						<span className={styles.langBadge}>
							<span className={styles.langDot} />
							{settings.language}
						</span>
						<div className={styles.editorBtns}>
							<button className={`${styles.eBtn} ${styles.eBtnRun}`} onClick={handleRun} disabled={running || submitting}>
								{running ? "Running…" : "▶ Run"}
							</button>
							<button
								className={`${styles.eBtn} ${submitted ? styles.eBtnDone : styles.eBtnSubmit}`}
								onClick={handleSubmit}
								disabled={submitting || submitted}
							>
								{submitting ? "Submitting…" : submitted ? "✓ Submitted" : "⚡ Submit"}
							</button>
						</div>
					</div>

					<div className={styles.monacoWrap}>
						<Editor
							height="100%"
							language={MONACO_LANG[settings.language] || "plaintext"}
							value={code}
							onChange={handleCodeChange}
							theme="vs-dark"
							options={{
								fontSize: 14,
								fontFamily: '"JetBrains Mono","Fira Code",monospace',
								fontLigatures: true,
								minimap: { enabled: false },
								scrollBeyondLastLine: false,
								automaticLayout: true,
								tabSize: 4,
								padding: { top: 12, bottom: 12 },
								contextmenu: false,
							}}
						/>
					</div>

					{runResults && (
						<div className={styles.results}>
							<ResultsView r={runResults} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DescTab({ q }) {
	return (
		<div className={styles.descTab}>
			<p className={styles.desc}>{q.description}</p>
			<hr className={styles.sep} />
			<label className={styles.metaLabel}>Input Format</label>
			<p className={styles.metaVal}>{q.inputFormat}</p>
			<label className={styles.metaLabel}>Output Format</label>
			<p className={styles.metaVal}>{q.outputFormat}</p>
			<hr className={styles.sep} />
			<label className={styles.metaLabel}>Constraints</label>
			<ul className={styles.constraints}>
				{q.constraints.map((c, i) => (
					<li key={i}>
						<code>{c}</code>
					</li>
				))}
			</ul>
		</div>
	);
}

function ExTab({ q }) {
	return (
		<div className={styles.exTab}>
			{q.examples.map((ex, i) => (
				<div key={i} className={styles.exBlock}>
					<div className={styles.exLabel}>Example {i + 1}</div>
					<Row k="Input" v={ex.input} />
					<Row k="Output" v={ex.output} highlight />
					{ex.explanation && <Row k="Why" v={ex.explanation} plain />}
				</div>
			))}
		</div>
	);
}

function Row({ k, v, highlight, plain }) {
	return (
		<div className={styles.exRow}>
			<span className={styles.exKey}>{k}:</span>
			{plain ? <span className={styles.exPlain}>{v}</span> : <pre className={`${styles.exVal} ${highlight ? styles.exValGreen : ""}`}>{v}</pre>}
		</div>
	);
}

function ResultsView({ r }) {
	if (r.error) return <div className={styles.resError}>✗ {r.error}</div>;
	const all = r.passed === r.total;
	return (
		<div className={styles.resWrap}>
			<div className={`${styles.resSummary} ${all ? styles.resSumPass : styles.resSumFail}`}>
				<span>{all ? "✓" : "✗"}</span>
				<span>
					{r.mode === "submit" ? "Submit" : "Run"}:{" "}
					<strong>
						{r.passed}/{r.total}
					</strong>{" "}
					passed
				</span>
				{r.mode === "submit" && <span className={`${styles.badge} ${all ? styles.badge_easy : styles.badge_hard}`}>{r.score}%</span>}
			</div>
			{(r.results || []).map((tc, i) => (
				<div key={i} className={`${styles.tc} ${tc.passed ? styles.tcPass : styles.tcFail}`}>
					<span className={tc.passed ? styles.tcIconPass : styles.tcIconFail}>{tc.passed ? "✓" : "✗"}</span>
					<span className={styles.tcLabel}>Test {tc.index}</span>
					<span className={styles.tcTime}>{tc.executionTime}ms</span>
					{!tc.passed && (
						<div className={styles.tcDetail}>
							{tc.compilationError ? (
								<pre className={styles.tcErr}>{tc.error}</pre>
							) : (
								<>
									<TcRow k="Input" v={tc.input} />
									<TcRow k="Expected" v={tc.expected} green />
									<TcRow k="Got" v={tc.output || "(empty)"} red />
									{tc.error && <TcRow k="Error" v={tc.error} red />}
								</>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

function TcRow({ k, v, green, red }) {
	return (
		<div className={styles.tcRow}>
			<span className={styles.tcKey}>{k}:</span>
			<pre className={`${styles.tcVal} ${green ? styles.tcValGreen : ""} ${red ? styles.tcValRed : ""}`}>{v}</pre>
		</div>
	);
}

function fmtMs(ms) {
	const s = Math.floor(ms / 1000);
	const m = Math.floor(s / 60);
	return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
