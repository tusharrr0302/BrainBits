import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import planRoutes from "./routes/planRoutes.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "./models/User.js";

dotenv.config();

// =========================
// App Setup
// =========================
const app = express();
const PORT = process.env.PORT || 8000;

app.use(
	cors({
		origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// Database Connection
// =========================
mongoose
	.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/brainbits")
	.then(() => {
		console.log("✅ MongoDB connected successfully");
	})
	.catch((error) => {
		console.error("❌ MongoDB connection error:", error);
	});

// Routes
app.use("/api/plan", planRoutes);

// Health check
app.get("/health", (req, res) => {
	res.json({ status: "OK", message: "Backend is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({ error: err.message || "Internal server error" });
});

// =========================
// Gemini Init
// =========================
let genAI = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
	genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
	console.warn("⚠️ GEMINI_API_KEY not set in .env");
}

// =========================
// Chat Endpoint (Streaming)
// =========================
app.post("/api/chat", async (req, res) => {
	try {
		const { messages } = req.body;

		if (!Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ error: "Messages array is required" });
		}

		if (!genAI) {
			return res.status(500).json({
				error: "Gemini API key not configured",
			});
		}

		// ✅ CORRECT MODEL (v1beta handled by SDK)
		const model = genAI.getGenerativeModel({
			model: "models/gemini-2.5-flash",
		});

		// =========================
		// Build Chat History
		// =========================
		const history = [];
		const validMessages = messages.filter((m) => m?.content && m.content.trim());

		for (let i = 0; i < validMessages.length - 1; i++) {
			const msg = validMessages[i];
			history.push({
				role: msg.role === "assistant" ? "model" : "user",
				parts: [{ text: msg.content }],
			});
		}

		const lastMessage = validMessages.at(-1);

		if (!lastMessage || lastMessage.role !== "user") {
			return res.status(400).json({ error: "Last message must be from user" });
		}

		// =========================
		// SSE Headers
		// =========================
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.flushHeaders?.();

		// =========================
		// Start Chat + Stream
		// =========================
		const chat = model.startChat({
			history,
		});

		const result = await chat.sendMessageStream(lastMessage.content);

		for await (const chunk of result.stream) {
			const text = chunk.text();
			if (text) {
				res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
			}
		}

		res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
		res.end();
	} catch (error) {
		console.error("❌ Gemini Error:", error);

		if (!res.headersSent) {
			res.status(500).json({
				error: "Failed to generate response",
				message: error.message,
			});
		} else {
			res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
			res.end();
		}
	}
});

// =========================
// Health Check
// =========================
app.get("/api/health", (req, res) => {
	res.json({
		status: "ok",
		message: "BrainBits API is running",
	});
});

// User Manipulation
app.post("/api/user/createUser", async (req, res) => {
	const { sub, name, email, picture } = req.body;

	try {
		let existingUser = await User.findOne({ auth0Id: sub });

		if (!existingUser) {
			const newUser = new User({
				// auth0Id: sub,
				name,
				email,
				picture,
				nickname: req.body.nickname || name.split(" ")[0],
			});

			await newUser.save();
		}

		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.patch("/api/user/updateProfile", async (req, res) => {
	const { email, gitHub, leetCode } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		user.gitHub = gitHub;
		user.leetCode = leetCode;

		await user.save();
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
	console.log(`🚀 BrainBits server running on http://localhost:${PORT}`);

	if (!genAI) {
		console.warn("⚠️ Gemini API not configured");
	} else {
		console.log("✅ Gemini API ready (Streaming enabled)");
	}
});
