import { useState } from "react";
import { createPlan } from "../api/ttAPI";
import Sidebar from "../ui/Sidebar";

const learningPaths = ["DSA only", "DSA + Web Development", "DSA + Android Development", "DSA + AI/ML"];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function PathSelection({ onPlanCreated }) {
	const [selectedPath, setSelectedPath] = useState("");
	const [weeklyHours, setWeeklyHours] = useState(20);
	const [preferredDays, setPreferredDays] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	// const [open, setOpen] = useState(true);

	const handleDayToggle = (day) => {
		setPreferredDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!selectedPath) {
			setError("Please select a learning path");
			return;
		}

		if (preferredDays.length === 0) {
			setError("Please select at least one preferred study day");
			return;
		}

		if (weeklyHours < 5 || weeklyHours > 60) {
			setError("Weekly hours should be between 5 and 60");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const userId = `user_${Date.now()}`;
			const response = await createPlan(userId, selectedPath, weeklyHours, preferredDays);

			if (response.success && response.plan) {
				onPlanCreated(response.plan);
			} else {
				setError(response.error || "Failed to create plan");
			}
		} catch (err) {
			setError(err.error || "Failed to create plan. Please try again.");
			console.error("Error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* <Sidebar open={open} setOpen={setOpen} /> */}
			<div className={`min-h-dvh flex items-center justify-center p-4`}>
				<div className="w-full max-w-2xl glass bg-slate-800 rounded-2xl p-8 shadow-glow-lg border border-dark-700">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold mb-4 bg-clip-text">Study Planner</h1>
						<p className="text-dark-300 text-lg">Learning Planner</p>
						<p className="text-dark-400 mt-2">Create your personalized AI-powered study schedule</p>
					</div>

					{error && <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200">{error}</div>}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Learning Path Selection */}
						<div>
							<label className="block text-sm font-semibold text-dark-200 mb-3">
								Select Learning Path <span className="text-red-400">*</span>
							</label>
							<div className="grid grid-cols-1 gap-3">
								{learningPaths.map((path) => (
									<button
										key={path}
										type="button"
										onClick={() => setSelectedPath(path)}
										className={`p-4 rounded-lg border-2 transition-all text-left ${
											selectedPath === path
												? "border-primary-500 bg-primary-500/10 shadow-glow"
												: "border-dark-700 bg-dark-800/50 hover:border-dark-600"
										}`}
									>
										<div className="flex items-center">
											<div
												className={`w-4 h-4 rounded-full border-2 mr-3 ${
													selectedPath === path ? "border-primary-500 bg-primary-500" : "border-dark-600"
												}`}
											>
												{selectedPath === path && <div className="w-full h-full rounded-full bg-primary-500 scale-50"></div>}
											</div>
											<span className={`font-medium ${selectedPath === path ? "text-primary-300" : "text-dark-200"}`}>
												{path}
											</span>
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Weekly Hours */}
						<div>
							<label className="block text-sm font-semibold text-dark-200 mb-3">
								Weekly Available Hours <span className="text-red-400">*</span>
							</label>
							<div className="flex items-center space-x-4">
								<input
									type="range"
									min="5"
									max="60"
									value={weeklyHours}
									onChange={(e) => setWeeklyHours(Number(e.target.value))}
									className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
								/>
								<div className="w-20 text-center">
									<span className="text-2xl font-bold text-primary-400">{weeklyHours}</span>
									<span className="text-sm text-dark-400 ml-1">hrs</span>
								</div>
							</div>
							<p className="text-xs text-dark-400 mt-2">Selected: {weeklyHours} hours per week</p>
						</div>

						{/* Preferred Days */}
						<div>
							<label className="block text-sm font-semibold text-dark-200 mb-3">
								Preferred Study Days <span className="text-red-400">*</span>
							</label>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{daysOfWeek.map((day) => (
									<button
										key={day}
										type="button"
										onClick={() => handleDayToggle(day)}
										className={`p-3 rounded-lg border-2 transition-all ${
											preferredDays.includes(day)
												? "border-primary-500 bg-primary-500/10 text-primary-300 shadow-glow"
												: "border-dark-700 bg-dark-800/50 text-dark-300 hover:border-dark-600"
										}`}
									>
										{day.slice(0, 3)}
									</button>
								))}
							</div>
							<p className="text-xs text-dark-400 mt-2">
								Selected: {preferredDays.length} day{preferredDays.length !== 1 ? "s" : ""}
							</p>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-lg transition-all shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						>
							{loading ? (
								<>
									<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
									Generating your schedule...
								</>
							) : (
								"Generate Schedule"
							)}
						</button>
					</form>
				</div>
			</div>
		</>
	);
}

export default PathSelection;
