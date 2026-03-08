import Room from "../models/Room.js";
import { getQuestion } from "../models/questions.js";
import { evaluateTestCases } from "../controllers/battleController.js";

// Active battle state lives in memory (not Mongo) for speed.
// Mongo is updated at battle end for persistence.
const activeBattles = new Map(); // roomCode → BattleState

const BATTLE_DURATION = 30 * 60; // 30 min in seconds

// ─── Socket Registration ──────────────────────────────────────────────────────

export function registerSocketHandlers(io) {
	io.on("connection", (socket) => {
		console.log(`🔌 Socket connected: ${socket.id}`);

		// ── Join Room ─────────────────────────────────────────────────────────────
		socket.on("room:join", async ({ roomCode, playerName, userId, isHost }) => {
			try {
				const code = roomCode.toUpperCase();
				const room = await Room.findOne({ code });

				if (!room) {
					return socket.emit("room:error", { message: "Room not found. Check your code." });
				}
				if (!isHost && room.guestId && room.guestId !== userId) {
					return socket.emit("room:error", { message: "Room is already full." });
				}

				socket.join(code);

				if (isHost) {
					room.hostId = userId || room.hostId;
					room.hostName = playerName || room.hostName;
					// Tag socket for disconnect tracking
					socket.data.roomCode = code;
					socket.data.userId = userId;
					socket.data.isHost = true;
				} else {
					room.guestId = userId;
					room.guestName = playerName;
					room.status = "setup";
					socket.data.roomCode = code;
					socket.data.userId = userId;
					socket.data.isHost = false;
					// Notify host
					socket.to(code).emit("room:guest_joined", { guestName: playerName });
				}

				await room.save();

				socket.emit("room:joined", {
					roomCode: code,
					isHost,
					hostName: room.hostName,
					guestName: room.guestName,
					status: room.status,
				});

				console.log(`👤 ${playerName} joined room ${code} as ${isHost ? "host" : "guest"}`);
			} catch (err) {
				console.error("room:join error:", err);
				socket.emit("room:error", { message: "Failed to join room." });
			}
		});

		// ── Player Ready ──────────────────────────────────────────────────────────
		socket.on("battle:ready", async ({ roomCode, settings }) => {
			try {
				const code = roomCode.toUpperCase();

				// Initialise or update battle state
				if (!activeBattles.has(code)) {
					activeBattles.set(code, { readyPlayers: new Set(), settings: {}, submissions: {}, timers: [], resolved: false });
				}
				const battle = activeBattles.get(code);
				battle.settings = { ...battle.settings, ...settings };
				battle.readyPlayers.add(socket.id);

				socket.to(code).emit("battle:opponent_ready", {
					playerName: socket.data.isHost ? socket.data.userId : socket.data.userId,
				});

				console.log(`✅ Ready in ${code}: ${battle.readyPlayers.size}/2`);

				if (battle.readyPlayers.size >= 2) {
					await startCountdown(io, code);
				}
			} catch (err) {
				console.error("battle:ready error:", err);
			}
		});

		// ── Code Submission ───────────────────────────────────────────────────────
		socket.on("battle:submit", async ({ roomCode, results, submittedAt }) => {
			try {
				const code = roomCode.toUpperCase();
				const battle = activeBattles.get(code);
				if (!battle) return;

				const passed = results.filter((r) => r.passed).length;
				const total  = results.length;

				// Keep best submission only
				const prev = battle.submissions[socket.id]?.[0];
				if (!prev || passed > prev.passed) {
					battle.submissions[socket.id] = [{ passed, total, submittedAt, elapsedTime: submittedAt - battle.startTime, results }];
				}

				// Notify opponent
				socket.to(code).emit("battle:opponent_submitted", {
					passed,
					total,
					time: submittedAt - battle.startTime,
				});

				// If all sockets in the room have submitted perfect scores → resolve early
				const socketsInRoom = [...(io.sockets.adapter.rooms.get(code) || [])];
				const allPerfect = socketsInRoom.every((sid) => {
					const s = battle.submissions[sid]?.[0];
					return s && s.passed === s.total;
				});

				if (allPerfect) await resolveBattle(io, code);
			} catch (err) {
				console.error("battle:submit error:", err);
			}
		});

		// ── Typing Indicator ──────────────────────────────────────────────────────
		socket.on("battle:typing", ({ roomCode }) => {
			socket.to(roomCode.toUpperCase()).emit("battle:opponent_typing");
		});

		// ── Disconnect ────────────────────────────────────────────────────────────
		socket.on("disconnect", async () => {
			console.log(`❌ Disconnected: ${socket.id}`);
			const { roomCode, isHost } = socket.data || {};
			if (!roomCode) return;

			const code = roomCode.toUpperCase();
			const battle = activeBattles.get(code);

			io.to(code).emit("room:player_disconnected", {
				message: `${isHost ? "Host" : "Opponent"} disconnected.`,
			});

			// If battle was live, award win to remaining player
			if (battle && !battle.resolved) {
				await resolveBattle(io, code, { reason: "opponent_disconnected", disconnectedSocketId: socket.id });
			}
		});
	});
}

// ─── Countdown ────────────────────────────────────────────────────────────────

async function startCountdown(io, roomCode) {
	const room = await Room.findOne({ code: roomCode });
	if (!room) return;
	room.status = "countdown";
	await room.save();

	let count = 5;
	const interval = setInterval(async () => {
		io.to(roomCode).emit("battle:countdown", { seconds: count });
		count--;
		if (count < 0) {
			clearInterval(interval);
			await startBattle(io, roomCode);
		}
	}, 1000);
}

// ─── Battle Start ─────────────────────────────────────────────────────────────

async function startBattle(io, roomCode) {
	const battle = activeBattles.get(roomCode);
	if (!battle) return;

	const room = await Room.findOne({ code: roomCode });
	if (!room) return;

	const question = getQuestion({
		difficulty: battle.settings.difficulty,
		category:   battle.settings.category,
	});

	battle.question  = question;
	battle.startTime = Date.now();

	room.status     = "battle";
	room.questionId = question.id;
	await room.save();

	io.to(roomCode).emit("battle:start", {
		question,
		startTime: battle.startTime,
		duration:  BATTLE_DURATION,
		settings:  battle.settings,
	});

	console.log(`⚔️  Battle started in ${roomCode}: "${question.title}"`);

	// Tick every second
	let elapsed = 0;
	const tick = setInterval(async () => {
		elapsed++;
		const remaining = BATTLE_DURATION - elapsed;
		io.to(roomCode).emit("battle:tick", { elapsed, remaining });
		if (remaining <= 0) {
			clearInterval(tick);
			await resolveBattle(io, roomCode);
		}
	}, 1000);

	battle.timers.push(tick);
}

// ─── Resolve / Winner ─────────────────────────────────────────────────────────

async function resolveBattle(io, roomCode, meta = {}) {
	const battle = activeBattles.get(roomCode);
	if (!battle || battle.resolved) return;
	battle.resolved = true;
	battle.timers.forEach(clearInterval);

	const room = await Room.findOne({ code: roomCode });
	if (!room) return;

	room.status = "finished";

	const socketsInRoom = [...(io.sockets.adapter.rooms.get(roomCode) || [])];
	const scores = {};

	for (const sid of socketsInRoom) {
		const sub = battle.submissions[sid]?.[0];
		const socket = io.sockets.sockets.get(sid);
		const name = socket?.data?.isHost ? room.hostName : room.guestName;
		const total = battle.question?.testCases?.length || 1;

		scores[sid] = {
			name,
			passed:      sub?.passed ?? 0,
			total:       sub?.total  ?? total,
			elapsedTime: sub?.elapsedTime ?? BATTLE_DURATION * 1000,
			accuracy:    sub ? Math.round((sub.passed / sub.total) * 100) : 0,
		};
	}

	// Winner: most passed → faster time
	let winnerId = null;
	if (meta.reason === "opponent_disconnected") {
		// Win goes to the socket that is NOT the disconnected one
		winnerId = socketsInRoom.find((sid) => sid !== meta.disconnectedSocketId) || null;
	} else if (socketsInRoom.length === 2) {
		const [a, b] = socketsInRoom;
		const sa = scores[a], sb = scores[b];
		if (sa.passed > sb.passed)            winnerId = a;
		else if (sb.passed > sa.passed)       winnerId = b;
		else if (sa.elapsedTime < sb.elapsedTime) winnerId = a;
		else                                  winnerId = b;
	} else if (socketsInRoom.length === 1) {
		winnerId = socketsInRoom[0];
	}

	const result = {
		winner:   winnerId ? scores[winnerId]?.name : "Draw",
		winnerId,
		scores,
		question: battle.question ? { id: battle.question.id, title: battle.question.title } : null,
		reason:   meta.reason || null,
		endTime:  Date.now(),
	};

	// Persist result to Mongo
	room.result = {
		winner:   result.winner,
		winnerId,
		scores,
		endTime:  new Date(),
	};
	await room.save();

	io.to(roomCode).emit("battle:result", result);
	console.log(`🏆 Battle resolved in ${roomCode}. Winner: ${result.winner}`);

	// Cleanup memory after 5 min
	setTimeout(() => activeBattles.delete(roomCode), 5 * 60 * 1000);
}