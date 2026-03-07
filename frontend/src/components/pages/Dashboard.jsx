import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import Sidebar from "../ui/Sidebar.jsx";
import MentorTip from "../ui/MentorTip.jsx";
import Spacebackground from "../ui/Spacebackground.jsx";
import ActivityGraph from "../ui/Activitygraph.jsx";
import "./Dashboard.css";

// ── helpers (same as ActivityGraph) ─────────────────────────────────────────
// function getLCCount(calendarObj, date) {
// 	if (!calendarObj || !date) return 0;
// 	const ts = Math.floor(date.getTime() / 1000) + 19800;
// 	for (const delta of [0, -86400, 86400, 19800, -19800]) {
// 		const v = calendarObj[String(ts + delta)];
// 		if (v !== undefined) return v;
// 	}
// 	return 0;
// }

// ── Username modal ────────────────────────────────────────────────────────────
function UsernameModal({ onSubmit, isModalOpen, ghUser, lcUser }) {
	const { user } = useAuth();
	const [gh, setGh] = useState(ghUser || "");
	const [lc, setLc] = useState(lcUser || "");
	const [error, setError] = useState("");

	const handleSubmit = async () => {
		if (!gh.trim() || !lc.trim()) {
			setError("Please enter your usernames.");
			return;
		}
		try {
			await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/updateGHLC`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: user.email, gitHub: gh.trim(), leetCode: lc.trim() }),
			});
			onSubmit(gh.trim(), lc.trim());
			setError("");
		} catch (err) {
			setError("Failed to update profile. Please try again.");
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleSubmit();
	};

	return (
		<>
			{isModalOpen && (
				<div className="modal-overlay">
					<div className="modal-card">
						<div className="modal-icon">⚡</div>
						<h2 className="modal-title">Connect Your Profiles</h2>
						<p className="modal-sub">Enter your GitHub and LeetCode usernames to load your activity graph.</p>

						<div className="modal-fields">
							<div className="modal-field">
								<label className="modal-label">
									<span className="modal-label-icon gh-icon">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
											<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
										</svg>
									</span>
									GitHub Username
								</label>
								<input
									className="modal-input"
									type="text"
									placeholder="e.g. Aditya-Pandey-GH"
									value={gh}
									onChange={(e) => setGh(e.target.value)}
									onKeyDown={handleKeyDown}
								/>
							</div>

							<div className="modal-field">
								<label className="modal-label">
									<span className="modal-label-icon lc-icon">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
											<path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H19.68a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
										</svg>
									</span>
									LeetCode Username
								</label>
								<input
									className="modal-input"
									type="text"
									placeholder="e.g. Aditya-Pandey-LC"
									value={lc}
									onChange={(e) => setLc(e.target.value)}
									onKeyDown={handleKeyDown}
								/>
							</div>
						</div>

						{error && <p className="modal-error">{error}</p>}

						<button className="modal-btn" onClick={handleSubmit}>
							Load Activity Graph →
						</button>

						<p className="modal-skip" onClick={() => onSubmit("", "")}>
							Skip for now
						</p>
					</div>
				</div>
			)}
		</>
	);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
	const [open, setOpen] = useState(true);
	const { user, dbUser } = useAuth();

	const [showModal, setShowModal] = useState(false);
	const [ghUser, setGhUser] = useState(dbUser?.gitHub || "");
	const [lcUser, setLcUser] = useState(dbUser?.leetCode || "");
	const [graphReady, setGraphReady] = useState(true);

	// Raw data for MentorTip (fetched separately so it can pass to MentorTip)
	const [ghData, setGhData] = useState(null);
	const [lcData, setLcData] = useState(null);

	const year = new Date().getFullYear();

	// Fetch raw data once usernames are set
	// useEffect(() => {
	// 	if (!ghUser && !lcUser) return;

	// 	if (ghUser) {
	// 		fetch(`https://github-contributions-api.jogruber.de/v4/${ghUser}?format=nested&y=${year}`)
	// 			.then((r) => r.json())
	// 			.then(setGhData)
	// 			.catch(() => {});
	// 	}
	// 	if (lcUser) {
	// 		fetch(`https://alfa-leetcode-api-adi.vercel.app/${lcUser}/calendar?year=${year}`)
	// 			.then((r) => r.json())
	// 			.then((d) => {
	// 				try {
	// 					setLcData(JSON.parse(d?.submissionCalendar));
	// 				} catch {}
	// 			})
	// 			.catch(() => {});
	// 	}
	// }, [ghUser, lcUser]);

	const handleUsernameSubmit = (gh, lc) => {
		setGhUser(gh);
		setLcUser(lc);
		setShowModal(false);
		if (gh || lc) setGraphReady(true);
	};

	useEffect(() => {
		if (!dbUser?.gitHub && !dbUser?.leetCode) {
			setGraphReady(false);
			setShowModal(true);
		}
	}, [dbUser]);

	return (
		<div className="dashboard">
			<Spacebackground />
			{showModal && <UsernameModal onSubmit={handleUsernameSubmit} isModalOpen={showModal} ghUser={ghUser} lcUser={lcUser} />}
			<Sidebar open={open} setOpen={setOpen} />

			<main className="dashboard-main transition-all duration-300" style={{ marginLeft: open ? "16rem" : "5rem" }}>
				<div className="dashboard-inner">
					{/* Breadcrumb */}
					<p className="breadcrumb">Home Page / Dashboard</p>

					{/* Welcome Block */}
					<div className="welcome-block">
						<div className="welcome-block-left">
							<p className="welcome-eyebrow">YOUR LEARNING HUB</p>
							<h1 className="welcome-name">Welcome, {user?.displayName?.split(" ")[0] || "User"}</h1>
							<p className="welcome-desc">Learning progress and today's personalized study plan</p>
						</div>

						<div className="welcome-stats">
							<div className="wstat">
								<span className="wstat-value">12</span>
								<span className="wstat-label">Day Streak</span>
							</div>
							<div className="wstat-divider" />
							<div className="wstat">
								<span className="wstat-value">47.5</span>
								<span className="wstat-label">Study Hrs</span>
							</div>
							<div className="wstat-divider" />
							<div className="wstat">
								<span className="wstat-value">10/30</span>
								<span className="wstat-label">Tasks</span>
							</div>
							<div className="wstat-divider" />
							<div className="wstat">
								<span className="wstat-value">18</span>
								<span className="wstat-label">Badges</span>
							</div>
						</div>
					</div>

					{/* Activity Graph */}
					{graphReady ? (
						<div className="ag-wrapper">
							<div className="ag-wrapper-header">
								<span>Code Activity</span>
								<button className="ag-relink-btn" onClick={() => setShowModal(true)}>
									Change profiles
								</button>
							</div>
							<ActivityGraph ghUserName={ghUser} lcUserName={lcUser} />
						</div>
					) : (
						!showModal && (
							<div className="ag-empty-state">
								<p>No profiles linked.</p>
								<button className="ag-relink-btn" onClick={() => setShowModal(true)}>
									Connect GitHub &amp; LeetCode
								</button>
							</div>
						)
					)}

					{/* AI Mentor Tip */}
					<MentorTip ghData={ghData} lcData={lcData} ghUserName={ghUser} lcUserName={lcUser} />
				</div>
			</main>
		</div>
	);
}
