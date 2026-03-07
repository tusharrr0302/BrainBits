// client/src/api/api.js - FIXED VERSION
import axios from "axios";

// ✅ FIX: Use absolute URL to backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/plan" || "http://127.0.0.1:8080/api/plan";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 60000, // 60 seconds for AI operations
});

// Add request interceptor for debugging
api.interceptors.request.use(
	(config) => {
		console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
		return config;
	},
	(error) => {
		console.error("❌ Request Error:", error);
		return Promise.reject(error);
	}
);

// Add response interceptor for better error handling
api.interceptors.response.use(
	(response) => {
		console.log(`✅ API Response: ${response.status}`);
		return response;
	},
	(error) => {
		if (error.response) {
			console.error("❌ API Error:", error.response.status, error.response.data);
		} else if (error.request) {
			console.error("❌ No response from server:", error.message);
		} else {
			console.error("❌ Request setup error:", error.message);
		}
		return Promise.reject(error);
	}
);

export const createPlan = async (userId, learningPath, weeklyHours, preferredDays) => {
	try {
		console.log("📋 Creating plan:", {
			userId,
			learningPath,
			weeklyHours,
			preferredDays,
		});

		const response = await api.post("/create", {
			userId,
			learningPath,
			weeklyHours,
			preferredDays,
		});

		return response.data;
	} catch (error) {
		console.error("Error creating plan:", error);
		throw error.response?.data || { error: "Failed to create plan" };
	}
};

export const modifyPlan = async (planId, modificationRequest) => {
	try {
		console.log("🔄 Modifying plan:", planId, modificationRequest);

		const response = await api.post("/modify", {
			planId,
			modificationRequest,
		});

		return response.data;
	} catch (error) {
		console.error("Error modifying plan:", error);
		throw error.response?.data || { error: "Failed to modify plan" };
	}
};

export const getPlan = async (planId) => {
	try {
		console.log("📥 Fetching plan:", planId);

		const response = await api.get(`/${planId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching plan:", error);
		throw error.response?.data || { error: "Failed to fetch plan" };
	}
};

export const getMCQs = async (topic, subject) => {
	try {
		console.log("📝 Generating MCQs for:", topic, subject);

		const response = await api.post("/mcqs", {
			topic,
			subject,
		});

		return response.data;
	} catch (error) {
		console.error("Error generating MCQs:", error);
		throw error.response?.data || { error: "Failed to generate MCQs" };
	}
};

export const markBlockComplete = async (planId, day, blockIndex, passed) => {
	try {
		console.log("✅ Marking block complete:", {
			planId,
			day,
			blockIndex,
			passed,
		});

		const response = await api.post("/complete", {
			planId,
			day,
			blockIndex,
			passed,
		});

		return response.data;
	} catch (error) {
		console.error("Error marking block complete:", error);
		throw error.response?.data || { error: "Failed to update block" };
	}
};

export const generateNextPeriod = async (planId, period = "week") => {
	try {
		console.log("🔄 Generating next period:", planId, period);

		const response = await api.post("/generate-next", {
			planId,
			period,
		});

		return response.data;
	} catch (error) {
		console.error("Error generating next period:", error);
		throw error.response?.data || { error: "Failed to generate next period" };
	}
};
