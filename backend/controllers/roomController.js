import Room from "../models/Room.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous I/O/0/1

async function generateUniqueCode() {
	let code;
	let attempts = 0;
	do {
		code = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
		const exists = await Room.findOne({ code });
		if (!exists) return code;
		attempts++;
	} while (attempts < 10);
	throw new Error("Could not generate a unique room code");
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/battle/rooms/create
 * Body: { hostId, hostName }
 */
export const createRoom = async (req, res) => {
	try {
		const { hostId, hostName } = req.body;
		if (!hostId || !hostName) {
			return res.status(400).json({ error: "Missing hostId or hostName" });
		}

		const code = await generateUniqueCode();
		const room = await Room.create({ code, hostId, hostName });

		res.status(201).json({ success: true, roomCode: room.code, roomId: room._id });
	} catch (error) {
		console.error("Error creating room:", error);
		res.status(500).json({ error: error.message || "Failed to create room" });
	}
};

/**
 * GET /api/battle/rooms/:code
 * Validates a room code and returns its current status.
 */
export const getRoomByCode = async (req, res) => {
	try {
		const { code } = req.params;
		const room = await Room.findOne({ code: code.toUpperCase() });

		if (!room) {
			return res.status(404).json({ error: "Room not found. Check your code." });
		}
		if (room.status !== "waiting" && room.guestId) {
			return res.status(409).json({ error: "Room is full." });
		}

		res.json({
			success: true,
			room: {
				code: room.code,
				hostName: room.hostName,
				status: room.status,
				guestJoined: !!room.guestId,
			},
		});
	} catch (error) {
		console.error("Error fetching room:", error);
		res.status(500).json({ error: error.message || "Failed to fetch room" });
	}
};

/**
 * GET /api/battle/rooms/history/:userId
 * Returns finished rooms the user participated in (for battle history).
 */
export const getRoomHistory = async (req, res) => {
	try {
		const { userId } = req.params;
		const rooms = await Room.find({
			$or: [{ hostId: userId }, { guestId: userId }],
			status: "finished",
		})
			.sort({ updatedAt: -1 })
			.limit(20)
			.select("code hostName guestName result settings createdAt updatedAt");

		res.json({ success: true, rooms });
	} catch (error) {
		console.error("Error fetching history:", error);
		res.status(500).json({ error: error.message || "Failed to fetch history" });
	}
};
