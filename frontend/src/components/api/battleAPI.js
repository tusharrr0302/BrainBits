// src/components/api/battleAPI.js
// Matches the axios + interceptor pattern from your existing api.js

import axios from "axios";

// Strip any /api/... suffix from VITE_API_URL to get the raw server origin
const SERVER_ORIGIN = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8000").replace(/\/api\/.*$/, "").replace(/\/$/, "");
const BATTLE_API_BASE = `${SERVER_ORIGIN}/api/battle`;

const battleApi = axios.create({
	baseURL: BATTLE_API_BASE,
	headers: { "Content-Type": "application/json" },
	timeout: 30000,
});

battleApi.interceptors.request.use(
	(config) => {
		console.log(`🚀 Battle API: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
		return config;
	},
	(error) => {
		console.error("❌ Battle Request Error:", error);
		return Promise.reject(error);
	},
);

battleApi.interceptors.response.use(
	(response) => {
		console.log(`✅ Battle API Response: ${response.status}`);
		return response;
	},
	(error) => {
		if (error.response) {
			console.error("❌ Battle API Error:", error.response.status, error.response.data);
		} else {
			console.error("❌ Battle No Response:", error.message);
		}
		return Promise.reject(error);
	},
);

// ─── Room ─────────────────────────────────────────────────────────────────────

export const createRoom = async (hostId, hostName) => {
	try {
		const response = await battleApi.post("/rooms/create", { hostId, hostName });
		return response.data;
	} catch (error) {
		throw error.response?.data || { error: "Failed to create room" };
	}
};

export const validateRoom = async (roomCode) => {
	try {
		const response = await battleApi.get(`/rooms/${roomCode}`);
		return response.data;
	} catch (error) {
		throw error.response?.data || { error: "Room not found" };
	}
};

export const getRoomHistory = async (userId) => {
	try {
		const response = await battleApi.get(`/rooms/history/${userId}`);
		return response.data;
	} catch (error) {
		throw error.response?.data || { error: "Failed to fetch history" };
	}
};

// ─── Code Execution ───────────────────────────────────────────────────────────

export const runCode = async (language, code, testCases) => {
	try {
		const response = await battleApi.post("/run", { language, code, testCases });
		return response.data;
	} catch (error) {
		throw error.response?.data || { error: "Code execution failed" };
	}
};

export const submitCode = async (language, code, testCases, submittedAt) => {
	try {
		const response = await battleApi.post("/submit", { language, code, testCases, submittedAt });
		return response.data;
	} catch (error) {
		throw error.response?.data || { error: "Code submission failed" };
	}
};
