import axios from "axios";

const PISTON_API = "https://emkc.org/api/v2/piston";

const LANGUAGE_MAP = {
	python:     { language: "python",     version: "3.10.0" },
	javascript: { language: "javascript", version: "18.15.0" },
	java:       { language: "java",       version: "15.0.2" },
	cpp:        { language: "c++",        version: "10.2.0" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function runOnPiston(language, code, stdin) {
	const lang = LANGUAGE_MAP[language];
	if (!lang) throw new Error(`Unsupported language: ${language}`);

	const { data } = await axios.post(
		`${PISTON_API}/execute`,
		{
			language: lang.language,
			version: lang.version,
			files: [{ name: "main", content: code }],
			stdin,
			run_timeout: 10000,
			compile_timeout: 30000,
		},
		{ timeout: 15000 }
	);

	const { run, compile } = data;

	if (compile && compile.code !== 0) {
		return { stdout: "", stderr: compile.stderr || compile.output, exitCode: compile.code, compilationError: true };
	}

	return { stdout: (run.stdout || "").trim(), stderr: run.stderr || "", exitCode: run.code, time: run.time || 0 };
}

const normalize = (s) => String(s).trim().replace(/\s+/g, " ").toLowerCase();

async function evaluateTestCases(language, code, testCases) {
	const results = [];
	for (let i = 0; i < testCases.length; i++) {
		const tc = testCases[i];
		const start = Date.now();
		try {
			const result = await runOnPiston(language, code, tc.input);
			results.push({
				index: i + 1,
				input: tc.input,
				expected: tc.expected,
				output: result.stdout,
				passed: normalize(result.stdout) === normalize(tc.expected),
				error: result.stderr || null,
				compilationError: result.compilationError || false,
				executionTime: Date.now() - start,
			});
		} catch (err) {
			results.push({
				index: i + 1,
				input: tc.input,
				expected: tc.expected,
				output: "",
				passed: false,
				error: err.message,
				executionTime: Date.now() - start,
			});
		}
	}
	return results;
}

export { evaluateTestCases };

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/battle/run
 * Runs code against the first 2 sample test cases only.
 * Body: { language, code, testCases }
 */
export const runCode = async (req, res) => {
	try {
		const { language, code, testCases } = req.body;
		if (!language || !code || !testCases?.length) {
			return res.status(400).json({ error: "Missing language, code, or testCases" });
		}

		const results = await evaluateTestCases(language, code, testCases.slice(0, 2));
		res.json({ success: true, results, passed: results.filter((r) => r.passed).length, total: results.length });
	} catch (error) {
		console.error("Error running code:", error);
		res.status(500).json({ error: error.message || "Code execution failed" });
	}
};

/**
 * POST /api/battle/submit
 * Runs code against ALL test cases and returns a scored result.
 * Body: { language, code, testCases, submittedAt }
 */
export const submitCode = async (req, res) => {
	try {
		const { language, code, testCases, submittedAt } = req.body;
		if (!language || !code || !testCases?.length) {
			return res.status(400).json({ error: "Missing language, code, or testCases" });
		}

		const results = await evaluateTestCases(language, code, testCases);
		const passed = results.filter((r) => r.passed).length;
		const total = results.length;

		res.json({
			success: true,
			results,
			passed,
			total,
			score: Math.round((passed / total) * 100),
			submittedAt: submittedAt || Date.now(),
		});
	} catch (error) {
		console.error("Error submitting code:", error);
		res.status(500).json({ error: error.message || "Code submission failed" });
	}
};