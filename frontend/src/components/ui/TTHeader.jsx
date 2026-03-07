import { useState } from "react";
import { generateNextPeriod } from "../api/ttAPI";

function Header({ plan, onCreateNew, onPlanUpdated }) {
	const [generating, setGenerating] = useState(false);

	const totalMinutes =
		plan?.schedule?.reduce((sum, day) => {
			return sum + (day.totalMinutes || day.studyBlocks?.reduce((s, b) => s + b.duration, 0) || 0);
		}, 0) || 0;

	const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
	const completedBlocks =
		plan?.schedule?.reduce((count, day) => {
			return count + (day.studyBlocks?.filter((b) => b.completed).length || 0);
		}, 0) || 0;

	const totalBlocks =
		plan?.schedule?.reduce((count, day) => {
			return count + (day.studyBlocks?.length || 0);
		}, 0) || 0;

	const progress = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

	const handleGenerateNext = async () => {
		if (!plan || !plan._id) return;

		setGenerating(true);
		try {
			const response = await generateNextPeriod(plan._id, "week");
			if (response.success && response.plan) {
				onPlanUpdated(response.plan);
				alert(`New week generated! Completion rate from last week: ${response.analysis.completionRate}%`);
			}
		} catch (error) {
			alert(error.error || "Failed to generate next week");
		} finally {
			setGenerating(false);
		}
	};

	return (
		<header className="glass border-b border-dark-700 sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div>
						<h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
							BrainBits AI
						</h1>
						<p className="text-sm text-dark-400 mt-1">{plan?.learningPath || "Learning Planner"}</p>
					</div>

					<div className="flex items-center gap-4 flex-wrap">
						<div className="text-center">
							<p className="text-xs text-dark-400 mb-1">Total Hours</p>
							<p className="text-xl font-bold text-primary-400">{totalHours}h</p>
						</div>
						<div className="text-center">
							<p className="text-xs text-dark-400 mb-1">Progress</p>
							<p className="text-xl font-bold text-primary-400">{progress}%</p>
						</div>
						<div className="text-center">
							<p className="text-xs text-dark-400 mb-1">Completed</p>
							<p className="text-xl font-bold text-primary-400">
								{completedBlocks}/{totalBlocks}
							</p>
						</div>

						{/* NEW BUTTON */}
						<button
							onClick={handleGenerateNext}
							disabled={generating}
							className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg transition-all text-sm font-semibold disabled:opacity-50"
						>
							{generating ? "Generating..." : "🚀 Next Week"}
						</button>

						<button
							onClick={onCreateNew}
							className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-200 rounded-lg transition-all text-sm"
						>
							New Schedule
						</button>
					</div>
				</div>

				<div className="mt-4">
					<div className="h-2 bg-dark-800 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-500"
							style={{ width: `${progress}%` }}
						></div>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
