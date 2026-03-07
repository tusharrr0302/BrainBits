import { useState } from "react";
import TTMCQModal from "./TTMCQModal";
import { markBlockComplete } from "../api/ttAPI";

function StudyCard({ block, day, blockIndex, planId, onPlanUpdated, subjectColor, subjectBadgeColor, onDaySelect }) {
	const [showMCQ, setShowMCQ] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleProveClick = () => {
		if (block.completed) return;
		onDaySelect(day);
		setShowMCQ(true);
	};

	const handleMCQComplete = async (passed) => {
		try {
			setLoading(true);
			const response = await markBlockComplete(planId, day, blockIndex, passed);
			if (response.success && response.plan) {
				onPlanUpdated(response.plan);
			}
			setShowMCQ(false);
		} catch {
			alert("Failed to update");
		} finally {
			setLoading(false);
		}
	};

	const formatDuration = (minutes) => {
		if (minutes < 60) return `${minutes}m`;
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return m ? `${h}h ${m}m` : `${h}h`;
	};

	return (
		<>
			<div
				onClick={handleProveClick}
				className={`relative rounded-xl p-5 bg-[#0b1220] border border-slate-700 
        hover:border-blue-500 transition cursor-pointer
        ${block.completed ? "opacity-50" : ""}`}
			>
				{/* Left color bar */}
				<div className={`absolute left-0 top-0 bottom-0 w-[5px] rounded-l-xl bg-gradient-to-b ${subjectColor}`} />

				<div className="pl-4 space-y-4">
					{/* Header */}
					<div className="flex justify-between items-center">
						<span className={`text-sm px-3 py-1 rounded border font-medium ${subjectBadgeColor}`}>{block.subject}</span>
						{block.completed && <span className="text-green-400 text-lg font-bold">✓</span>}
					</div>

					{/* Topic */}
					<h4 className="text-white text-base font-semibold leading-snug line-clamp-2">{block.topic}</h4>

					{/* Footer */}
					<div className="flex items-center justify-between pt-3 border-t border-slate-700 text-sm text-slate-400">
						<span>{formatDuration(block.duration)}</span>

						{!block.completed && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleProveClick();
								}}
								className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
							>
								Practice
							</button>
						)}
					</div>
				</div>
			</div>

			{showMCQ && (
				<TTMCQModal
					topic={block.topic}
					subject={block.subject}
					onComplete={handleMCQComplete}
					onClose={() => setShowMCQ(false)}
					loading={loading}
				/>
			)}
		</>
	);
}

export default StudyCard;
