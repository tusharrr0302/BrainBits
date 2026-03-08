import express from "express";
import { runCode, submitCode } from "../controllers/battleController.js";
import { createRoom, getRoomByCode, getRoomHistory } from "../controllers/roomController.js";

const router = express.Router();

// ── Room routes ───────────────────────────────────────────────────────────────
router.post("/rooms/create",          createRoom);
router.get("/rooms/history/:userId",  getRoomHistory);
router.get("/rooms/:code",            getRoomByCode);

// ── Code execution routes ─────────────────────────────────────────────────────
router.post("/run",    runCode);
router.post("/submit", submitCode);

export default router;