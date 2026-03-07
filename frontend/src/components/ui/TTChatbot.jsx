import { useState, useRef, useEffect } from "react";
import { modifyPlan } from "../api/ttAPI";

function Chatbot({ plan, onPlanUpdated }) {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (messages.length === 0 && plan && isOpen) {
			setMessages([
				{
					type: "bot",
					text: `Hi! 👋 I'm your AI assistant. I can help you modify your ${
						plan.learningPath
					} schedule.\n\n💡 Try saying:\n• "Add more DSA practice on Monday"\n• "Make Wednesday lighter"\n• "Focus more on ${
						plan.learningPath.split(" + ")[1] || "DSA"
					}"\n• "Increase study time on weekends"\n\nWhat would you like to change?`,
				},
			]);
		}
	}, [plan, isOpen]);

	const handleSend = async (e) => {
		e.preventDefault();

		if (!input.trim() || loading || !plan) return;

		const userMessage = { type: "user", text: input.trim() };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setLoading(true);

		// Add typing indicator
		setMessages((prev) => [...prev, { type: "bot", text: "...", isTyping: true }]);

		try {
			const response = await modifyPlan(plan._id || plan.id, input.trim());

			// Remove typing indicator
			setMessages((prev) => prev.filter((m) => !m.isTyping));

			if (response.success && response.plan) {
				setMessages((prev) => [
					...prev,
					{
						type: "bot",
						text: "✅ Perfect! I've updated your schedule based on your request. Check the calendar below to see the changes! 📅",
					},
				]);
				onPlanUpdated(response.plan);
			} else {
				throw new Error(response.error || "Failed to update schedule");
			}
		} catch (error) {
			console.error("Chatbot error:", error);
			setMessages((prev) => prev.filter((m) => !m.isTyping));

			// Better error messages
			let errorMessage = "❌ Oops! Something went wrong. ";

			if (error.error === "gemini_error" || error.message?.includes("gemini")) {
				errorMessage += "The AI service is temporarily unavailable. Please try again in a moment, or try rephrasing your request. 🔄";
			} else if (error.error === "gemini_rate_limited") {
				errorMessage += "Too many requests right now. Please wait a minute and try again. ⏰";
			} else if (error.message?.includes("network") || error.message?.includes("fetch")) {
				errorMessage += "Connection issue. Make sure the backend server is running. 🔌";
			} else {
				errorMessage += "Please try rephrasing your request or try again later. 💭";
			}

			setMessages((prev) => [
				...prev,
				{
					type: "bot",
					text: errorMessage,
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	if (!plan) return null;

	return (
		<>
			{!isOpen && (
				<button
					onClick={() => setIsOpen(true)}
					className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-full shadow-glow-lg flex items-center justify-center transition-all z-40 hover:scale-110 group"
					title="Open AI Assistant"
				>
					<span className="text-3xl group-hover:scale-110 transition-transform">💬</span>
				</button>
			)}

			{isOpen && (
				<div className="fixed bottom-6 right-6 w-96 h-[600px] glass rounded-2xl shadow-glow-lg border-2 border-primary-500/30 flex flex-col z-50 animate-slideUp">
					<div className="flex items-center justify-between p-5 border-b-2 border-dark-700 bg-gradient-to-r from-primary-600/10 to-primary-700/10">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-glow">
								<span className="text-2xl">🤖</span>
							</div>
							<div>
								<h3 className="font-bold text-white text-lg">AI Assistant</h3>
								<p className="text-xs text-green-400 flex items-center gap-1">
									<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
									Online & Ready
								</p>
							</div>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="text-dark-400 hover:text-white transition-colors text-3xl leading-none w-10 h-10 flex items-center justify-center hover:bg-dark-800 rounded-lg"
						>
							×
						</button>
					</div>

					<div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
						{messages.map((message, index) => (
							<div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
								<div
									className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg ${
										message.type === "user"
											? "bg-gradient-to-r from-primary-600 to-primary-700 text-white"
											: "bg-dark-800 text-dark-200 border-2 border-dark-700"
									}`}
								>
									{message.isTyping ? (
										<div className="flex gap-1.5 py-1">
											<div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce"></div>
											<div
												className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce"
												style={{ animationDelay: "0.2s" }}
											></div>
											<div
												className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce"
												style={{ animationDelay: "0.4s" }}
											></div>
										</div>
									) : (
										<p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
									)}
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>

					<form onSubmit={handleSend} className="p-4 border-t-2 border-dark-700 bg-dark-900/50">
						<div className="flex gap-2">
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Type your request..."
								disabled={loading}
								className="flex-1 px-4 py-3 bg-dark-800 border-2 border-dark-700 rounded-xl text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-all disabled:opacity-50 text-sm"
							/>
							<button
								type="submit"
								disabled={!input.trim() || loading}
								className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow font-semibold"
								title="Send message"
							>
								{loading ? "⏳" : "➤"}
							</button>
						</div>
					</form>
				</div>
			)}

			<style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: #1f2937;
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #3b82f6;
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #2563eb;
				}
				@keyframes slideUp {
					from {
						transform: translateY(20px);
						opacity: 0;
					}
					to {
						transform: translateY(0);
						opacity: 1;
					}
				}
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-slideUp {
					animation: slideUp 0.3s ease-out;
				}
				.animate-fadeIn {
					animation: fadeIn 0.3s ease-out;
				}
			`}</style>
		</>
	);
}

export default Chatbot;
