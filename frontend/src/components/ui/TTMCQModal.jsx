import { useState, useEffect } from "react";
import { getMCQs } from "../api/ttAPI";

function MCQModal({ topic, subject, onComplete, onClose }) {
	const [mcqs, setMcqs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState(null);
	const [answers, setAnswers] = useState({});
	const [showResults, setShowResults] = useState(false);
	const [score, setScore] = useState(0);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadMCQs();
	}, []);

	const loadMCQs = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await getMCQs(topic, subject);

			if (response.success && response.mcqs && response.mcqs.length > 0) {
				setMcqs(response.mcqs.slice(0, 4));
			} else {
				setError("No questions available");
			}
		} catch (err) {
			setError(err.error || "Failed to load questions");
			console.error("Error loading MCQs:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleNext = () => {
		if (selectedAnswer !== null) {
			setAnswers({ ...answers, [currentIndex]: selectedAnswer });

			if (currentIndex < mcqs.length - 1) {
				setCurrentIndex(currentIndex + 1);
				setSelectedAnswer(answers[currentIndex + 1] ?? null);
			} else {
				calculateResults();
			}
		}
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
			setSelectedAnswer(answers[currentIndex - 1] ?? null);
		}
	};

	const calculateResults = () => {
		const finalAnswers = { ...answers, [currentIndex]: selectedAnswer };
		let correct = 0;

		mcqs.forEach((mcq, idx) => {
			if (finalAnswers[idx] === mcq.correctAnswer) {
				correct++;
			}
		});

		const percentage = (correct / mcqs.length) * 100;
		setScore(Math.round(percentage));
		setShowResults(true);
	};

	const handleFinish = () => {
		const passed = score >= 60;
		onComplete(passed);
	};

	if (loading) {
		return (
			<div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-fadeIn">
				<div className="glass rounded-3xl p-12 max-w-lg w-full text-center border-2 border-primary-500/30 shadow-glow-lg">
					<div className="relative w-24 h-24 mx-auto mb-6">
						<div className="absolute inset-0 border-4 border-primary-500/30 rounded-full"></div>
						<div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
					</div>
					<h3 className="text-2xl font-bold text-white mb-3">Generating Questions</h3>
					<p className="text-dark-300 text-lg">Using AI to create personalized questions...</p>
					<div className="mt-6 flex gap-2 justify-center">
						<div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
						<div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
						<div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[99999] p-4">
				<div className="glass rounded-3xl p-12 max-w-lg w-full text-center border-2 border-red-500/30">
					<div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-lg">
						<span className="text-5xl">⚠️</span>
					</div>
					<h3 className="text-2xl font-bold text-white mb-3">Oops!</h3>
					<p className="text-red-400 mb-6 text-lg">{error}</p>
					<div className="flex gap-4 justify-center">
						<button
							onClick={loadMCQs}
							className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl transition-all font-semibold text-lg shadow-glow"
						>
							🔄 Retry
						</button>
						<button
							onClick={onClose}
							className="px-8 py-3 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-xl transition-all font-semibold text-lg"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (showResults) {
		const passed = score >= 60;
		return (
			<div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[99999] p-4">
				<div className="glass rounded-3xl p-12 max-w-2xl w-full text-center border-2 border-primary-500/30">
					<div
						className={`w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center relative ${
							passed ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-red-500 to-red-600"
						} shadow-glow-lg`}
					>
						{passed ? (
							<svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
							</svg>
						) : (
							<svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
							</svg>
						)}
					</div>

					<h3 className="text-4xl font-bold text-white mb-4">{passed ? "🎉 Excellent Work!" : "📚 Keep Practicing"}</h3>

					<div className="mb-6">
						<p className="text-dark-300 mb-3 text-xl">Your Score</p>
						<div className="text-6xl font-bold mb-2">
							<span className={passed ? "text-green-400" : "text-red-400"}>{score}%</span>
						</div>
						<p className="text-dark-400 text-lg">
							{mcqs.filter((_, idx) => answers[idx] === mcqs[idx].correctAnswer).length} out of {mcqs.length} correct
						</p>
					</div>

					<div
						className={`p-6 rounded-2xl mb-8 ${
							passed ? "bg-green-500/10 border-2 border-green-500/30" : "bg-red-500/10 border-2 border-red-500/30"
						}`}
					>
						<p className="text-lg text-dark-200">
							{passed
								? "🌟 Great job! You've demonstrated strong understanding of this topic. You can now mark this block as complete."
								: "💪 You need at least 60% to pass. Review the material and try again. Practice makes perfect!"}
						</p>
					</div>

					<div className="flex gap-4 justify-center">
						{passed ? (
							<button
								onClick={handleFinish}
								className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl transition-all font-bold text-lg shadow-glow-lg"
							>
								✓ Mark Complete
							</button>
						) : (
							<>
								<button
									onClick={() => {
										setShowResults(false);
										setCurrentIndex(0);
										setAnswers({});
										setSelectedAnswer(null);
										loadMCQs();
									}}
									className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl transition-all font-bold text-lg shadow-glow"
								>
									🔄 Try Again
								</button>
								<button
									onClick={onClose}
									className="px-8 py-4 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-xl transition-all font-bold text-lg"
								>
									Close
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		);
	}

	const currentMCQ = mcqs[currentIndex];
	const progress = ((currentIndex + 1) / mcqs.length) * 100;

	return (
		<div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[99999] p-4 sm:p-6">
			<div className="glass rounded-3xl p-6 sm:p-10 max-w-4xl w-full max-h-[95vh] overflow-y-auto border-2 border-primary-500/30 shadow-glow-lg">
				{/* Header */}
				<div className="flex items-start justify-between mb-8">
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-3">
							<div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
								<span className="text-2xl">🎯</span>
							</div>
							<div>
								<h3 className="text-2xl sm:text-3xl font-bold text-white">Practice Quiz</h3>
								<p className="text-dark-400 text-sm sm:text-base">{subject}</p>
							</div>
						</div>
						<p className="text-primary-400 font-semibold text-lg">{topic}</p>
					</div>
					<button
						onClick={onClose}
						className="text-dark-400 hover:text-white transition-colors text-3xl leading-none ml-4 w-10 h-10 flex items-center justify-center hover:bg-dark-800 rounded-lg"
					>
						×
					</button>
				</div>

				{/* Progress Bar */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-3">
						<span className="text-base sm:text-lg font-bold text-white">
							Question {currentIndex + 1} of {mcqs.length}
						</span>
						<span className="text-base sm:text-lg font-bold text-primary-400">{Math.round(progress)}% Complete</span>
					</div>
					<div className="h-3 bg-dark-800 rounded-full overflow-hidden border border-dark-700">
						<div
							className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 transition-all duration-500 shadow-glow"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Question */}
				<div className="mb-10">
					<div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-8 border-2 border-dark-700 mb-8">
						<h4 className="text-2xl sm:text-3xl font-bold text-white leading-relaxed">{currentMCQ.question}</h4>
					</div>

					{/* Options */}
					<div className="space-y-4">
						{currentMCQ.options.map((option, idx) => {
							const letters = ["A", "B", "C", "D"];
							const isSelected = selectedAnswer === idx;

							return (
								<button
									key={idx}
									onClick={() => setSelectedAnswer(idx)}
									className={`w-full p-6 rounded-2xl border-2 text-left transition-all transform hover:scale-[1.02] ${
										isSelected
											? "border-primary-500 bg-gradient-to-r from-primary-500/20 to-primary-600/20 shadow-glow scale-[1.02]"
											: "border-dark-700 bg-dark-800/50 hover:border-dark-600 hover:bg-dark-800"
									}`}
								>
									<div className="flex items-center gap-5">
										<div
											className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 font-bold text-lg transition-all ${
												isSelected
													? "border-primary-500 bg-primary-500 text-white shadow-glow"
													: "border-dark-600 text-dark-400"
											}`}
										>
											{letters[idx]}
										</div>
										<span
											className={`text-lg sm:text-xl transition-all ${
												isSelected ? "text-white font-semibold" : "text-dark-200"
											}`}
										>
											{option}
										</span>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* Navigation */}
				<div className="flex items-center justify-between pt-8 border-t-2 border-dark-700">
					<button
						onClick={handlePrevious}
						disabled={currentIndex === 0}
						className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-lg flex items-center gap-2"
					>
						<span>←</span> Previous
					</button>

					<div className="text-center">
						<p className="text-dark-400 text-sm mb-1">Select an answer to continue</p>
						<div className="flex gap-2">
							{mcqs.map((_, idx) => (
								<div
									key={idx}
									className={`w-3 h-3 rounded-full transition-all ${
										idx === currentIndex ? "bg-primary-500 w-8" : answers[idx] !== undefined ? "bg-green-500" : "bg-dark-700"
									}`}
								/>
							))}
						</div>
					</div>

					<button
						onClick={handleNext}
						disabled={selectedAnswer === null}
						className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-lg shadow-glow flex items-center gap-2"
					>
						{currentIndex === mcqs.length - 1 ? "Finish" : "Next"} <span>→</span>
					</button>
				</div>
			</div>
		</div>
	);
}

export default MCQModal;
