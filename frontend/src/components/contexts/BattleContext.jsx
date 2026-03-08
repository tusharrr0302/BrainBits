// src/components/contexts/BattleContext.jsx
// Follows the same createContext / useReducer / Provider pattern as AuthContext.jsx

import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from "react";
import { io } from "socket.io-client";

const BattleContext = createContext();

const SERVER_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8000").replace(/\/api\/.*$/, "").replace(/\/$/, "");

// ─── State ────────────────────────────────────────────────────────────────────
const initialState = {
	// Room info
	roomCode: null,
	isHost: false,
	playerName: "",
	opponentName: "",

	// Phase: 'lobby' | 'setup' | 'countdown' | 'battle' | 'result'
	phase: "lobby",

	// Battle settings
	settings: {
		category: "Array",
		difficulty: "Easy",
		language: "python",
	},

	// Ready state
	selfReady: false,
	opponentReady: false,
	countdown: null,

	// Question + timer
	question: null,
	startTime: null,
	duration: 1800,
	elapsed: 0,
	remaining: 1800,

	// Results
	submissionResult: null,
	opponentSubmission: null,
	battleResult: null,

	// Opponent presence
	opponentConnected: false,
	opponentTyping: false,

	error: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
	switch (action.type) {
		case "SET_ROOM":
			return { ...state, ...action.payload, error: null };
		case "OPPONENT_JOINED":
			return { ...state, opponentName: action.payload.guestName, opponentConnected: true };
		case "SET_SETTINGS":
			return { ...state, settings: { ...state.settings, ...action.payload } };
		case "SET_SELF_READY":
			return { ...state, selfReady: true };
		case "SET_OPPONENT_READY":
			return { ...state, opponentReady: true };
		case "SET_COUNTDOWN":
			return { ...state, phase: "countdown", countdown: action.payload };
		case "BATTLE_START":
			return {
				...state,
				phase: "battle",
				question: action.payload.question,
				startTime: action.payload.startTime,
				duration: action.payload.duration,
				countdown: null,
			};
		case "TICK":
			return { ...state, elapsed: action.payload.elapsed, remaining: action.payload.remaining };
		case "SET_SUBMISSION":
			return { ...state, submissionResult: action.payload };
		case "SET_OPP_SUBMISSION":
			return { ...state, opponentSubmission: action.payload };
		case "SET_OPP_TYPING":
			return { ...state, opponentTyping: true };
		case "BATTLE_RESULT":
			return { ...state, phase: "result", battleResult: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload };
		case "RESET":
			return { ...initialState };
		default:
			return state;
	}
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function BattleProvider({ children }) {
	const [state, dispatch] = useReducer(reducer, initialState);
	const socketRef = useRef(null);

	// Initialise socket once
	useEffect(() => {
		const socket = io(SERVER_URL, { transports: ["websocket"], autoConnect: false });
		socketRef.current = socket;

		socket.on("connect", () => console.log("⚔️  Battle socket connected:", socket.id));
		socket.on("disconnect", () => console.log("❌ Battle socket disconnected"));

		return () => socket.disconnect();
	}, []);

	// ── Dispatch helpers (stable references) ─────────────────────────────────
	const actions = {
		setRoom: useCallback((p) => dispatch({ type: "SET_ROOM", payload: p }), []),
		opponentJoined: useCallback((p) => dispatch({ type: "OPPONENT_JOINED", payload: p }), []),
		setSettings: useCallback((p) => dispatch({ type: "SET_SETTINGS", payload: p }), []),
		setSelfReady: useCallback(() => dispatch({ type: "SET_SELF_READY" }), []),
		setOpponentReady: useCallback(() => dispatch({ type: "SET_OPPONENT_READY" }), []),
		setCountdown: useCallback((n) => dispatch({ type: "SET_COUNTDOWN", payload: n }), []),
		battleStart: useCallback((p) => dispatch({ type: "BATTLE_START", payload: p }), []),
		tick: useCallback((p) => dispatch({ type: "TICK", payload: p }), []),
		setSubmission: useCallback((p) => dispatch({ type: "SET_SUBMISSION", payload: p }), []),
		setOppSubmission: useCallback((p) => dispatch({ type: "SET_OPP_SUBMISSION", payload: p }), []),
		setOppTyping: useCallback(() => dispatch({ type: "SET_OPP_TYPING" }), []),
		battleResult: useCallback((p) => dispatch({ type: "BATTLE_RESULT", payload: p }), []),
		setError: useCallback((e) => dispatch({ type: "SET_ERROR", payload: e }), []),
		reset: useCallback(() => dispatch({ type: "RESET" }), []),
	};

	return <BattleContext.Provider value={{ state, actions, socket: socketRef }}>{children}</BattleContext.Provider>;
}

export function useBattle() {
	return useContext(BattleContext);
}
