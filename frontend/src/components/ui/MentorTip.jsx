// import { useState, useEffect } from "react";

export default function MentorTip() {
	// const motivationalQuoteAPI = `https://quotes-api-self.vercel.app/quote`;
	// const [quote, setQuote] = useState("Loading...");
	// const [quoteAuthor, setQuoteAuthor] = useState("Loading...");

	// useEffect(() => {
	// 	(async () => {
	// 		try {
	// 			const response = await fetch(motivationalQuoteAPI);
	// 			const data = await response.json();
	// 			console.log("Fetched quote data:", data);
	// 			if (data && data?.quote.length > 0) {
	// 				setQuote(data?.quote);
	// 				setQuoteAuthor(data?.author);
	// 			}
	// 		} catch (error) {
	// 			console.error("Error fetching quote:", error);
	// 		}
	// 	})();
	// }, []);

	return (
		<div className="bg-card rounded-xl p-6 border border-borderDark glass !shadow-xl">
			<h3 className="text-lg font-semibold">AI Mentor Tip</h3>
			<p className="text-sm text-textSecondary mb-4">Personalized insight from your AI study assistant</p>

			<div className="bg-cardLight rounded-lg py-4 text-base text-textSecondary">
				Small daily wins beat big random efforts. So, stay consistent !!
			</div>
			{/* <div className="bg-cardLight rounded-lg p-4 text-sm text-textSecondary">{quote}</div>
			<div className="bg-cardLight rounded-lg p-4 text-sm text-textSecondary">~{quoteAuthor}</div> */}
		</div>
	);
}
