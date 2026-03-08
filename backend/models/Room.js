import mongoose from "mongoose";

// ─── Room Schema ──────────────────────────────────────────────────────────────
// Stores battle room state. In-memory Maps are used for active socket tracking;
// Mongo persists room metadata and battle results.

const roomSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		hostId: {
			type: String, // Auth0 sub (e.g. "auth0|abc123")
			required: true,
		},
		hostName: {
			type: String,
			required: true,
		},
		guestId: {
			type: String,
			default: null,
		},
		guestName: {
			type: String,
			default: null,
		},
		status: {
			type: String,
			enum: ["waiting", "setup", "countdown", "battle", "finished"],
			default: "waiting",
		},
		settings: {
			category:   { type: String, default: "Array" },
			difficulty: { type: String, default: "Easy" },
			language:   { type: String, default: "python" },
		},
		questionId: {
			type: String,
			default: null,
		},
		result: {
			winner:    { type: String, default: null },
			winnerId:  { type: String, default: null },
			scores:    { type: mongoose.Schema.Types.Mixed, default: {} },
			endTime:   { type: Date, default: null },
		},
	},
	{ timestamps: true }
);

// Auto-expire rooms after 2 hours (TTL index)
roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

const Room = mongoose.model("Room", roomSchema);
export default Room;