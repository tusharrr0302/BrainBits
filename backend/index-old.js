import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import planRoutes from "./routes/planRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
	.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/sata_planner")
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

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📡 API available at http://localhost:${PORT}/api`);
}).on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		console.error(`❌ Port ${PORT} is already in use. Please stop the process using this port or change the PORT in .env file.`);
		console.error(`   To find the process: lsof -ti:${PORT}`);
		console.error(`   To kill it: kill -9 $(lsof -ti:${PORT})`);
	} else {
		console.error("❌ Server error:", err);
	}
	process.exit(1);
});
