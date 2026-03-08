// src/components/ui/battle/BattleLobby.jsx

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBattle } from "../../contexts/BattleContext";
import { createRoom, validateRoom } from "../../api/battleAPI";
import styles from "./BattleLobby.module.css";

export default function BattleLobby() {
	const { user } = useAuth();
	const { state, actions, socket } = useBattle();

	const [view, setView] = useState("home"); // 'home' | 'create' | 'join'
	const [roomCode, setRoomCode] = useState("");
	const [joinCode, setJoinCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState("");

	const playerName = user?.nickname || user?.name || user?.email?.split("@")[0] || "Player";
	const userId = user?.sub;

	// ── Create Room ────────────────────────────────────────────────────────────
	const handleCreate = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await createRoom(userId, playerName);
			setRoomCode(data.roomCode);
			actions.setRoom({ roomCode: data.roomCode, playerName, isHost: true, phase: "lobby" });

			// Connect socket and join room
			const s = socket.current;
			s.connect();
			s.once("connect", () => {
				s.emit("room:join", { roomCode: data.roomCode, playerName, userId, isHost: true });
			});

			// Listen for guest joining
			s.on("room:guest_joined", ({ guestName }) => {
				actions.opponentJoined({ guestName });
				actions.setRoom({ opponentConnected: true, phase: "setup" });
			});

			s.on("room:error", ({ message }) => setError(message));
		} catch (err) {
			setError(err.error || "Failed to create room");
		} finally {
			setLoading(false);
		}
	};

	// ── Join Room ──────────────────────────────────────────────────────────────
	const handleJoin = async () => {
		if (joinCode.trim().length < 6) {
			setError("Enter a valid 6-character code.");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const data = await validateRoom(joinCode.toUpperCase());
			if (!data.success) {
				setError(data.error || "Room not found");
				setLoading(false);
				return;
			}

			const s = socket.current;
			s.connect();
			s.once("connect", () => {
				s.emit("room:join", { roomCode: joinCode.toUpperCase(), playerName, userId, isHost: false });
			});
			s.on("room:joined", (payload) => {
				actions.setRoom({
					roomCode: joinCode.toUpperCase(),
					playerName,
					isHost: false,
					opponentName: payload.hostName,
					opponentConnected: true,
					phase: "setup",
				});
			});
			s.on("room:error", ({ message }) => {
				setError(message);
				setLoading(false);
			});
		} catch (err) {
			setError(err.error || "Failed to join room");
			setLoading(false);
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(roomCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// ── Render ─────────────────────────────────────────────────────────────────
	return (
		<div className={styles.root}>
			<div className={styles.bg} />

			<div className={styles.card}>
				{/* Header */}
				<div className={styles.header}>
					<span className={styles.icon}>⚔</span>
					<h1 className={styles.title}>
						<span className={styles.titleCyan}>CODE</span> <span className={styles.titlePurple}>BATTLE</span>
					</h1>
					<p className={styles.subtitle}>Real-time competitive DSA coding</p>
					<p className={styles.greeting}>
						Welcome, <strong>{playerName}</strong>
					</p>
				</div>

				{/* Home view */}
				{view === "home" && (
					<div className={styles.actions}>
						<button className={`${styles.actionBtn} ${styles.createBtn}`} onClick={() => setView("create")}>
							<span className={styles.actionIcon}>＋</span>
							<div>
								<div className={styles.actionTitle}>Create Battle</div>
								<div className={styles.actionDesc}>Generate a room and invite a friend</div>
							</div>
						</button>
						<button className={`${styles.actionBtn} ${styles.joinBtn}`} onClick={() => setView("join")}>
							<span className={styles.actionIcon}>⌨</span>
							<div>
								<div className={styles.actionTitle}>Join Battle</div>
								<div className={styles.actionDesc}>Enter a code to jump in</div>
							</div>
						</button>
					</div>
				)}

				{/* Create view */}
				{view === "create" && (
					<div className={styles.flow}>
						<button
							className={styles.backBtn}
							onClick={() => {
								setView("home");
								setRoomCode("");
								setError("");
							}}
						>
							← Back
						</button>

						{!roomCode ? (
							<>
								<p className={styles.flowDesc}>A unique 6-character room code will be generated for you.</p>
								{error && <p className={styles.error}>{error}</p>}
								<button className={`${styles.btn} ${styles.btnCyan}`} onClick={handleCreate} disabled={loading}>
									{loading ? "Generating…" : "Generate Room Code"}
								</button>
							</>
						) : (
							<div className={styles.codeBox}>
								<div className={styles.codeLabel}>ROOM CODE</div>
								<div className={styles.codeValue}>{roomCode}</div>
								<button className={styles.copyBtn} onClick={handleCopy}>
									{copied ? "✓ Copied!" : "Copy Code"}
								</button>

								<div className={styles.waitingRow}>
									<div className={styles.waitDots}>
										<span />
										<span />
										<span />
									</div>
									<span>Waiting for opponent to join…</span>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Join view */}
				{view === "join" && (
					<div className={styles.flow}>
						<button
							className={styles.backBtn}
							onClick={() => {
								setView("home");
								setError("");
							}}
						>
							← Back
						</button>
						<p className={styles.flowDesc}>Enter the 6-character room code your friend shared.</p>
						<input
							className={styles.codeInput}
							placeholder="ABC123"
							value={joinCode}
							onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
							onKeyDown={(e) => e.key === "Enter" && handleJoin()}
							maxLength={6}
							autoFocus
						/>
						{error && <p className={styles.error}>{error}</p>}
						<button className={`${styles.btn} ${styles.btnPurple}`} onClick={handleJoin} disabled={loading || joinCode.length < 6}>
							{loading ? "Joining…" : "Enter Battle →"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
