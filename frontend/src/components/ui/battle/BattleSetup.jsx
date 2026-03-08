// src/components/ui/battle/BattleSetup.jsx

import { useState, useEffect } from "react";
import { useBattle } from "../../contexts/BattleContext";
import styles from "./BattleSetup.module.css";

const CATEGORIES = ["Array", "String", "DP", "Graph", "Linked List", "Any"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const LANGUAGES = [
	{ id: "python", label: "Python", icon: "🐍" },
	{ id: "javascript", label: "JavaScript", icon: "⚡" },
	{ id: "java", label: "Java", icon: "☕" },
	{ id: "cpp", label: "C++", icon: "⚙" },
];

export default function BattleSetup() {
	const { state, actions, socket } = useBattle();
	const [settings, setSettings] = useState(state.settings);
	const [ready, setReady] = useState(false);

	// Register socket listeners for this phase
	useEffect(() => {
		const s = socket.current;
		if (!s) return;

		const onOpponentReady = () => actions.setOpponentReady();
		const onCountdown = (d) => actions.setCountdown(d.seconds);
		const onBattleStart = (d) => actions.battleStart(d);
		const onTick = (d) => actions.tick(d);
		const onResult = (d) => actions.battleResult(d);
		const onOppSubmission = (d) => actions.setOppSubmission(d);
		const onOppTyping = () => actions.setOppTyping();

		s.on("battle:opponent_ready", onOpponentReady);
		s.on("battle:countdown", onCountdown);
		s.on("battle:start", onBattleStart);
		s.on("battle:tick", onTick);
		s.on("battle:result", onResult);
		s.on("battle:opponent_submitted", onOppSubmission);
		s.on("battle:opponent_typing", onOppTyping);

		return () => {
			s.off("battle:opponent_ready", onOpponentReady);
			s.off("battle:countdown", onCountdown);
			s.off("battle:start", onBattleStart);
			s.off("battle:tick", onTick);
			s.off("battle:result", onResult);
			s.off("battle:opponent_submitted", onOppSubmission);
			s.off("battle:opponent_typing", onOppTyping);
		};
	}, [actions, socket]);

	const handleReady = () => {
		if (ready) return;
		setReady(true);
		actions.setSelfReady();
		actions.setSettings(settings);
		socket.current?.emit("battle:ready", { roomCode: state.roomCode, settings });
	};

	return (
		<div className={styles.root}>
			{/* Countdown overlay */}
			{state.phase === "countdown" && (
				<div className={styles.countdownOverlay}>
					<div className={styles.countdownRing}>
						<svg viewBox="0 0 100 100" width="130" height="130">
							<circle cx="50" cy="50" r="44" fill="none" stroke="#1a2840" strokeWidth="5" />
							<circle
								cx="50"
								cy="50"
								r="44"
								fill="none"
								stroke="#00e5ff"
								strokeWidth="5"
								strokeLinecap="round"
								strokeDasharray="276"
								strokeDashoffset={276 - 276 * (state.countdown / 5)}
								transform="rotate(-90 50 50)"
								style={{ transition: "stroke-dashoffset 0.9s linear" }}
							/>
						</svg>
						<span className={styles.countdownNum}>{state.countdown}</span>
					</div>
					<p className={styles.countdownLabel}>Get ready…</p>
				</div>
			)}

			<div className={styles.header}>
				<span className={styles.roomBadge}>ROOM · {state.roomCode}</span>
				<h1 className={styles.title}>Battle Setup</h1>
				<div className={styles.players}>
					<PlayerPill name={state.playerName} ready={ready} you />
					<span className={styles.vs}>VS</span>
					<PlayerPill name={state.opponentName || "Waiting…"} ready={state.opponentReady} />
				</div>
			</div>

			<div className={styles.sections}>
				{/* Category */}
				<Section title="DSA Category">
					<div className={styles.chipRow}>
						{CATEGORIES.map((c) => (
							<Chip
								key={c}
								label={c}
								selected={settings.category === c}
								disabled={ready}
								onClick={() => !ready && setSettings((s) => ({ ...s, category: c }))}
							/>
						))}
					</div>
				</Section>

				{/* Difficulty */}
				<Section title="Difficulty">
					<div className={styles.chipRow}>
						{DIFFICULTIES.map((d) => (
							<Chip
								key={d}
								label={d}
								selected={settings.difficulty === d}
								disabled={ready}
								variant={d.toLowerCase()}
								onClick={() => !ready && setSettings((s) => ({ ...s, difficulty: d }))}
							/>
						))}
					</div>
				</Section>

				{/* Language */}
				<Section title="Language">
					<div className={styles.langRow}>
						{LANGUAGES.map((l) => (
							<button
								key={l.id}
								className={`${styles.langChip} ${settings.language === l.id ? styles.langSelected : ""}`}
								onClick={() => !ready && setSettings((s) => ({ ...s, language: l.id }))}
								disabled={ready}
							>
								<span>{l.icon}</span>
								<span>{l.label}</span>
							</button>
						))}
					</div>
				</Section>
			</div>

			{/* Ready footer */}
			<div className={styles.footer}>
				<div className={styles.readyRow}>
					<ReadyDot label="You" ready={ready} />
					<ReadyDot label={state.opponentName || "Opponent"} ready={state.opponentReady} />
				</div>

				{!ready ? (
					<button className={styles.readyBtn} onClick={handleReady}>
						⚡ I'm Ready!
					</button>
				) : !state.opponentReady ? (
					<div className={styles.waiting}>
						<span className={styles.waitDot} />
						Waiting for {state.opponentName || "opponent"}…
					</div>
				) : null}
			</div>
		</div>
	);
}

function Section({ title, children }) {
	return (
		<div className={styles.section}>
			<h3 className={styles.sectionTitle}>{title}</h3>
			{children}
		</div>
	);
}

function Chip({ label, selected, disabled, onClick, variant }) {
	return (
		<button
			className={`${styles.chip} ${selected ? styles.chipSelected : ""} ${variant ? styles[`chip_${variant}`] : ""}`}
			onClick={onClick}
			disabled={disabled}
		>
			{label}
		</button>
	);
}

function PlayerPill({ name, ready, you }) {
	return (
		<div className={`${styles.playerPill} ${ready ? styles.playerReady : ""}`}>
			<span className={`${styles.dot} ${ready ? styles.dotGreen : styles.dotWait}`} />
			<span>{name}</span>
			{you && <span className={styles.youTag}>(you)</span>}
			{ready && <span className={styles.readyTag}>READY</span>}
		</div>
	);
}

function ReadyDot({ label, ready }) {
	return (
		<div className={`${styles.readyDot} ${ready ? styles.readyDotOn : ""}`}>
			<span className={styles.readyDotIcon}>{ready ? "✓" : "○"}</span>
			<div>
				<div className={styles.readyDotName}>{label}</div>
				<div className={styles.readyDotStatus}>{ready ? "Ready!" : "Not ready"}</div>
			</div>
		</div>
	);
}
