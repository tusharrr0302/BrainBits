// ─────────────────────────────────────────────────────
//  Code execution — tries Piston first, falls back to
//  glot.io (both free, no API key required)
// ─────────────────────────────────────────────────────

// Exact versions from: GET https://emkc.org/api/v2/piston/runtimes
const PISTON_LANGS = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3"   },
  python:     { language: "python",     version: "3.10.0"  },
  java:       { language: "java",       version: "15.0.2"  },
  c:          { language: "c",          version: "10.2.0"  },
  cpp:        { language: "c++",        version: "10.2.0"  },
  go:         { language: "go",         version: "1.16.2"  },
  rust:       { language: "rust",       version: "1.50.0"  },
  php:        { language: "php",        version: "8.2.3"   },
  ruby:       { language: "ruby",       version: "3.0.1"   },
  csharp:     { language: "csharp",     version: "6.12.0"  },
  swift:      { language: "swift",      version: "5.3.3"   },
};

// glot.io language names (fallback)
const GLOT_LANGS = {
  javascript: "javascript",
  python:     "python",
  java:       "java",
  c:          "c",
  cpp:        "cpp",
  go:         "go",
  rust:       "rust",
  php:        "php",
  ruby:       "ruby",
  csharp:     "csharp",
  swift:      "swift",
};

// ── Piston ───────────────────────────────────────────
async function runWithPiston(language, code, stdin) {
  const lang = PISTON_LANGS[language];
  if (!lang) return null; // signal: not supported, try fallback

  const res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: lang.language,
      version:  lang.version,
      files:    [{ name: "main", content: code }],
      stdin:    stdin || "",
      run_timeout: 5000,
    }),
  });

  if (!res.ok) throw new Error(`Piston HTTP ${res.status}`);

  const data = await res.json();

  // data.run.stdout / data.run.stderr / data.run.output (combined)
  const run = data?.run;
  if (!run) throw new Error("Piston: no run object in response");

  const out = (run.stdout || "") + (run.stderr || "");
  return out.trim().length > 0 ? out : "(no output)";
}

// ── glot.io ──────────────────────────────────────────
async function runWithGlot(language, code, stdin) {
  const lang = GLOT_LANGS[language];
  if (!lang) return null;

  // glot.io open API — no key needed for basic use
  const res = await fetch(`https://glot.io/api/run/${lang}/latest`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      files: [{ name: getFilename(language), content: code }],
      stdin: stdin || "",
    }),
  });

  if (!res.ok) throw new Error(`glot.io HTTP ${res.status}`);

  const data = await res.json();
  const out  = (data.stdout || "") + (data.stderr || "") + (data.error || "");
  return out.trim().length > 0 ? out : "(no output)";
}

function getFilename(language) {
  const map = {
    javascript: "main.js",
    typescript: "main.ts",
    python:     "main.py",
    java:       "Main.java",
    c:          "main.c",
    cpp:        "main.cpp",
    go:         "main.go",
    rust:       "main.rs",
    php:        "main.php",
    ruby:       "main.rb",
    csharp:     "Main.cs",
    swift:      "main.swift",
  };
  return map[language] || "main.txt";
}

// ── Main export ──────────────────────────────────────
export async function runCode(language, code, stdin = "") {
  const unsupported = !PISTON_LANGS[language] && !GLOT_LANGS[language];
  if (unsupported) {
    return {
      output: `Execution not supported for "${language}".\nSupported: ${[...new Set([...Object.keys(PISTON_LANGS), ...Object.keys(GLOT_LANGS)])].join(", ")}`,
    };
  }

  // Try Piston first
  try {
    const out = await runWithPiston(language, code, stdin);
    if (out !== null) return { output: out };
  } catch (pistonErr) {
    console.warn("Piston failed, trying glot.io:", pistonErr.message);
  }

  // Fallback to glot.io
  try {
    const out = await runWithGlot(language, code, stdin);
    if (out !== null) return { output: out };
  } catch (glotErr) {
    console.warn("glot.io also failed:", glotErr.message);
    return { output: `Both execution providers failed.\n\nPiston: check network\nglot.io: ${glotErr.message}` };
  }

  return { output: "Execution failed — no providers available." };
}