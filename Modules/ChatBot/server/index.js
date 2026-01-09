import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// =========================
// Path & Env Setup (ESM)
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from root and src (fallback)
dotenv.config({ path: join(__dirname, "..", ".env") });
dotenv.config({ path: join(__dirname, "..", "src", ".env") });

// =========================
// App Setup
// =========================
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// =========================
// Gemini Init
// =========================
let genAI = null;

if (
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
) {
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
    const validMessages = messages.filter(
      (m) => m?.content && m.content.trim()
    );

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
