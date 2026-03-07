import { useState } from "react";

// ── API keys — replace with your own ────────────────────────────────────────
const GEMINI_API_KEY     = "AIzaSyAC9E7039GiSuEi1ZfYrkJyGwhbkPazVyg";
const ELEVENLABS_API_KEY = "sk_3ace21219faac73c10a80f7e687f13d6904b860bc02b18b4";

// ── Free premade ElevenLabs English voices (available on all plans) ──────────
const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel",  desc: "calm · female"   },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni",  desc: "clear · male"    },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh",    desc: "deep · male"     },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli",    desc: "soft · female"   },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam",    desc: "strong · male"   },
];

// ── Gemini: fetch tip ────────────────────────────────────────────────────────
async function fetchGeminiTip(ghData, lcData, ghUserName, lcUserName) {
  const year  = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const noData = !ghData && !lcData;

  // ── compute stats ──────────────────────────────────────────────────────────
  const ghMonthData  = ghData?.contributions?.[year]?.[month] ?? {};
  const ghMonthTotal = Object.values(ghMonthData).reduce((s, d) => s + (d?.count || 0), 0);
  const ghYearTotal  = ghData?.total?.[year] ?? 0;
  const lcEntries    = lcData ? Object.values(lcData) : [];
  const lcTotal      = lcEntries.reduce((s, v) => s + Number(v), 0);
  const lcRecent     = lcEntries.slice(-30).reduce((s, v) => s + Number(v), 0);

  // ── build prompt based on data availability ────────────────────────────────
  let prompt;

  if (noData) {
    // No profiles linked — pure motivation
    prompt = `You are an energetic coding mentor. Give a short, punchy motivational message (2-3 sentences) to a developer who is just getting started or hasn't linked their profiles yet. Be direct, warm, and inspiring. No emojis. No bullet points. Use "you".`;
  } else {
    // Build a plain-English situation for Gemini to reason about
    const gh  = `GitHub: ${ghYearTotal} contributions this year (${ghMonthTotal} this month)`;
    const lc  = `LeetCode: ${lcTotal} total submissions (${lcRecent} in the last 30 days)`;

    let situation;
    if (ghYearTotal === 0 && lcTotal === 0) {
      situation = `Both GitHub and LeetCode show zero activity. ${gh}. ${lc}.`;
    } else if (ghYearTotal > lcTotal * 3) {
      situation = `Dev activity is much higher than DSA. ${gh}. ${lc}. They are skewed heavily toward building and not enough toward problem-solving.`;
    } else if (lcTotal > ghYearTotal * 3) {
      situation = `DSA activity is much higher than Dev. ${gh}. ${lc}. They are grinding LeetCode but not shipping real projects.`;
    } else if (ghMonthTotal === 0 && lcRecent === 0) {
      situation = `They have been inactive recently. ${gh}. ${lc}. No commits or problem-solving in the last month.`;
    } else {
      situation = `Activity is fairly balanced. ${gh}. ${lc}.`;
    }

    prompt = `You are a direct, honest coding mentor. Here is a developer's activity summary:

${situation}

Write exactly 2-3 sentences of advice:
1. Tell them specifically what the numbers reveal about their focus — name the imbalance if there is one.
2. Give one clear, actionable recommendation based on the imbalance (e.g. focus more on DSA, or start building projects).
3. End with one short motivational sentence that feels personal, not generic.

Rules: No bullet points. No emojis. No headers. Speak directly using "you". Reference the actual numbers.`;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.9 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    ?? "Keep pushing. Consistency compounds.";
}

// ── ElevenLabs TTS ───────────────────────────────────────────────────────────
async function fetchElevenLabsAudio(text, voiceId) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.80 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || `ElevenLabs error ${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  const blob   = new Blob([buffer], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}

// ── Component ────────────────────────────────────────────────────────────────
export default function MentorTip({ ghData, lcData, ghUserName, lcUserName }) {
  const [tip, setTip]                   = useState("");
  const [loading, setLoading]           = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying]           = useState(false);
  const [revealed, setRevealed]         = useState(false);
  const [audioObj, setAudioObj]         = useState(null);
  const [tipError, setTipError]         = useState("");
  const [audioError, setAudioError]     = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  const stopAudio = (a) => {
    if (a) { try { a.pause(); a.currentTime = 0; } catch {} }
    setPlaying(false);
  };

  const handleGetTip = async () => {
    if (loading) return;

    stopAudio(audioObj);
    setAudioObj(null);
    setTipError("");
    setAudioError("");
    setLoading(true);
    setRevealed(false);
    setTip("");
    setShowVoicePicker(false);

    try {
      // 1. Gemini tip
      const text = await fetchGeminiTip(ghData, lcData, ghUserName, lcUserName);
      setTip(text);
      setRevealed(true);
      setLoading(false);

      // 2. ElevenLabs audio in background
      setAudioLoading(true);
      try {
        const audioUrl = await fetchElevenLabsAudio(text, selectedVoice.id);
        const newAudio = new Audio(audioUrl);

        newAudio.onended = () => setPlaying(false);
        newAudio.onerror = () => { setPlaying(false); setAudioError("Audio playback failed."); };

        setAudioObj(newAudio);
        setAudioLoading(false);

        newAudio.play()
          .then(() => setPlaying(true))
          .catch(() => setAudioError("Click play to hear the tip."));
      } catch (e) {
        setAudioLoading(false);
        setAudioError(`Audio: ${e.message}`);
      }
    } catch (e) {
      setLoading(false);
      setTipError(`Could not fetch tip: ${e.message}`);
    }
  };

  const toggleAudio = () => {
    if (!audioObj) return;
    if (playing) {
      audioObj.pause();
      setPlaying(false);
    } else {
      audioObj.currentTime = 0;
      audioObj.play()
        .then(() => setPlaying(true))
        .catch(() => setAudioError("Playback blocked by browser."));
    }
  };

  return (
    <div className="mentor-block">

      {/* Header */}
      <div className="mentor-header">
        <div className="mentor-header-left">
          <span className="mentor-eyebrow">AI MENTOR</span>
          <span className="mentor-powered">Gemini · ElevenLabs</span>
        </div>

        <div className="mentor-header-right">
          {/* Voice picker toggle */}
          <div className="voice-picker-wrap">
            <button
              className="voice-picker-btn"
              onClick={() => setShowVoicePicker(v => !v)}
              title="Change voice"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              </svg>
              {selectedVoice.name}
            </button>

            {showVoicePicker && (
              <div className="voice-dropdown">
                {VOICES.map(v => (
                  <button
                    key={v.id}
                    className={`voice-option ${selectedVoice.id === v.id ? "selected" : ""}`}
                    onClick={() => { setSelectedVoice(v); setShowVoicePicker(false); }}
                  >
                    <span className="voice-option-name">{v.name}</span>
                    <span className="voice-option-desc">{v.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio controls */}
          {revealed && (
            <>
              {audioLoading && (
                <span className="mentor-audio-loading">
                  <span className="mentor-spinner small" />
                  rendering...
                </span>
              )}
              {!audioLoading && audioObj && (
                <button
                  className={`mentor-audio-btn ${playing ? "active" : ""}`}
                  onClick={toggleAudio}
                >
                  {playing ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="5" y="3" width="4" height="18" rx="1"/>
                        <rect x="15" y="3" width="4" height="18" rx="1"/>
                      </svg>
                      pause
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      play
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Waveform */}
      {playing && (
        <div className="mentor-waveform">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.065}s` }} />
          ))}
        </div>
      )}

      {/* States */}
      {!revealed && !loading && (
        <p className="mentor-prompt-text">
          Want a tip based on your code activity?
        </p>
      )}

      {loading && (
        <div className="mentor-loading">
          <span className="mentor-spinner" />
          Analysing your activity...
        </div>
      )}

      {revealed && tip && (
        <blockquote className="mentor-tip-text">{tip}</blockquote>
      )}

      {tipError   && <p className="mentor-error">{tipError}</p>}
      {audioError && <p className="mentor-error audio">{audioError}</p>}

      {/* CTA */}
      <button
        className={`mentor-cta ${loading ? "disabled" : ""}`}
        onClick={handleGetTip}
        disabled={loading}
      >
        {loading ? "Thinking..." : revealed ? "Get another tip" : "Get tip"}
      </button>

    </div>
  );
}