import { useEffect, useState } from "react";
import { SquareChevronRight } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../helpers/Firebase";
import { useAuth } from "../contexts/AuthContext";
import GHGraph from "./GHGraph";
import LCGraph from "./LCGraph";

export default function WeeklyProgress() {
	const [gitHub, setGitHub] = useState(null);
	const [leetCode, setLeetCode] = useState(null);

	const { user, dbUser } = useAuth();

	useEffect(() => {
		if (dbUser) {
			setGitHub(dbUser.github || null);
			setLeetCode(dbUser.leetcode || null);
		}
	}, [dbUser]);

	const fetchGitHubChart = async (e) => {
		e.preventDefault();
		const gh = e.target[0].value;
		try {
			await updateDoc(doc(db, "users", user.uid), { github: gh });
		} catch (error) {
			console.error(error);
		}
		setGitHub(gh);
	};
	const fetchLeetCodeChart = async (e) => {
		e.preventDefault();
		const lc = e.target[0].value;
		try {
			await updateDoc(doc(db, "users", user.uid), { leetcode: lc });
		} catch (error) {
			console.error(error);
		}
		setLeetCode(lc);
	};

	return (
		<div className="bg-card rounded-xl p-6 space-y-8 border border-borderDark h-full glass !shadow-xl">
			<h3 className="text-2xl font-semibold">Your Stats</h3>
			{/* <p className="text-sm text-textSecondary mb-6">Your learning journey this week</p> */}

			<div className="grid grid-cols-2 gap-8">
				{!gitHub ? (
					<form onSubmit={fetchGitHubChart} className="flex flex-col gap-2 w-full">
						<label htmlFor="github_input">GitHub</label>
						<div className="flex gap-2">
							<input
								type="text"
								id="github_input"
								placeholder="Enter your GitHub Username"
								// onChange={(e) => setGitHub(e.target.value)}
								className="!bg-dark-800/50"
							/>
							<button type="submit" className="cursor-pointer">
								<SquareChevronRight className="size-12" />
							</button>
						</div>
					</form>
				) : (
					<div className="flex flex-col justify-center items-center gap-4">
						<GHGraph userName={gitHub} />
						<div className="">GitHub Stats</div>
					</div>
				)}
				{!leetCode ? (
					<form onSubmit={fetchLeetCodeChart} className="flex flex-col gap-2 w-full">
						<label htmlFor="leetcode_input">LeetCode</label>
						<div className="flex gap-2">
							<input
								type="text"
								id="leetcode_input"
								placeholder="Enter your LeetCode Username"
								// onChange={(e) => setLeetCode(e.target.value)}
								className="!bg-dark-800/50"
							/>
							<button type="submit" className="cursor-pointer">
								<SquareChevronRight className="size-12" />
							</button>
						</div>
					</form>
				) : (
					<div className="flex flex-col justify-center items-center gap-4">
						<LCGraph userName={leetCode} />
						<div className="">LeetCode Stats</div>
					</div>
				)}
			</div>
			{/* <div className="flex justify-between items-end h-48 text-xs text-textSecondary">
				{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
					<div key={day} className="flex flex-col items-center gap-2">
						<div className="w-1 h-32 bg-borderDark rounded"></div>
						{day}
					</div>
				))}
			</div> */}
		</div>
	);
}
