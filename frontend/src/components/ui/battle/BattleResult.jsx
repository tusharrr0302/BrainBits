// src/components/ui/battle/BattleResult.jsx

import { useBattle } from "../../contexts/BattleContext";
import styles from "./BattleResult.module.css";

export default function BattleResult() {
	const { state, actions, socket } = useBattle();
	const { battleResult, playerName } = state;

	const isWin = battleResult?.winner === playerName;
	const isDraw = !battleResult?.winner || battleResult?.winner === "Draw";
	const disconnected = battleResult?.reason === "opponent_disconnected";

	const myScore = Object.values(battleResult?.scores || {}).find((s) => s.name === playerName);
	const oppScore = Object.values(battleResult?.scores || {}).find((s) => s.name !== playerName);

	const handlePlayAgain = () => {
		socket.current?.disconnect();
		actions.reset();
	};

	return (
		<div className={styles.root}>
			{isWin && <Confetti />}

			<div className={styles.card}>
				<div className={`${styles.header} ${isWin ? styles.headerWin : isDraw ? styles.headerDraw : styles.headerLose}`}>
					<span className={styles.emblem}>{isWin ? "🏆" : isDraw ? "🤝" : "💀"}</span>
					<h1 className={styles.verdict}>{disconnected ? "Opponent Left" : isWin ? "Victory!" : isDraw ? "Draw!" : "Defeat"}</h1>
					<p className={styles.sub}>
						{disconnected
							? "Your opponent disconnected."
							: isWin
								? `You outperformed ${state.opponentName}!`
								: isDraw
									? "A well-matched battle."
									: `${battleResult?.winner} wins this round.`}
					</p>
				</div>

				{myScore && oppScore && (
					<div className={styles.scores}>
						<ScoreCard score={myScore} you winner={isWin} />
						<span className={styles.vs}>VS</span>
						<ScoreCard score={oppScore} winner={!isWin && !isDraw} />
					</div>
				)}

				{battleResult?.question && (
					<div className={styles.qRow}>
						<span className={styles.qLabel}>Problem:</span>
						<span className={styles.qName}>{battleResult.question.title}</span>
					</div>
				)}

				<div className={styles.footer}>
					<button className={styles.playAgain} onClick={handlePlayAgain}>
						⚔ Play Again
					</button>
				</div>
			</div>
		</div>
	);
}

function ScoreCard({ score, you, winner }) {
	const timeStr = score.elapsedTime && isFinite(score.elapsedTime) ? fmtMs(score.elapsedTime) : "--";
	return (
		<div className={`${styles.scoreCard} ${winner ? styles.scoreCardWin : ""}`}>
			{winner && <span className={styles.crown}>👑</span>}
			<div className={styles.scLabel}>{you ? "Your Score" : "Opponent"}</div>
			<div className={styles.scName}>{score.name}</div>
			<div className={styles.metrics}>
				<Metric val={`${score.passed}/${score.total}`} label="Tests" />
				<Metric val={`${score.accuracy}%`} label="Score" />
				<Metric val={timeStr} label="Time" />
			</div>
			<div className={styles.accBar}>
				<div className={`${styles.accFill} ${winner ? styles.accFillWin : ""}`} style={{ width: `${score.accuracy}%` }} />
			</div>
		</div>
	);
}

function Metric({ val, label }) {
	return (
		<div className={styles.metric}>
			<div className={styles.metricVal}>{val}</div>
			<div className={styles.metricLabel}>{label}</div>
		</div>
	);
}

function Confetti() {
	return (
		<div className={styles.confetti}>
			{Array.from({ length: 24 }).map((_, i) => (
				<div
					key={i}
					className={styles.confettiPiece}
					style={{
						left: `${Math.random() * 100}%`,
						animationDelay: `${Math.random() * 1.5}s`,
						animationDuration: `${1.5 + Math.random() * 1.5}s`,
						background: ["#00e5ff", "#00ff88", "#a855f7", "#ffd60a"][i % 4],
						width: `${4 + Math.random() * 7}px`,
						height: `${4 + Math.random() * 7}px`,
					}}
				/>
			))}
		</div>
	);
}

function fmtMs(ms) {
	const s = Math.floor(ms / 1000);
	const m = Math.floor(s / 60);
	return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
