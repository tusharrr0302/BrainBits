import { useState } from "react";
import Sidebar from "../ui/Sidebar.jsx";
import StatCard from "../ui/StatCard.jsx";
import WeeklyProgress from "../ui/WeeklyProgress.jsx";
import MentorTip from "../ui/MentorTip.jsx";

import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
	const [open, setOpen] = useState(true);

	const { user } = useAuth();

	return (
		<div className="min-h-screen bg-bg text-textPrimary">
			<Sidebar open={open} setOpen={setOpen} />

			<main className="px-8 py-10 transition-all duration-300" style={{ marginLeft: open ? "16rem" : "5rem" }}>
				<div className="max-w-7xl mx-auto">
					<p className="text-sm text-textSecondary mb-4">Home Page / Dashboard</p>

					<h1 className="text-4xl font-bold flex items-center gap-3">
						Welcome, {user?.displayName?.split(" ")[0] || "User"} <span>👋</span>
					</h1>

					<p className="text-textSecondary mt-2 mb-10">Here’s your learning progress and today’s personalized study plan</p>

					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
						<StatCard title="Current streak" value="12" sub="Days in a row" />
						<StatCard title="Study Hours" value="47.5" sub="This week" />
						<StatCard title="Task Completed" value="10/30" sub="This week" />
						<StatCard title="Achievement" value="18" sub="Badges earned" />
					</div>

					<div className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
						<div className="xl:col-span-2">
							<WeeklyProgress />
						</div>
						<MentorTip />
					</div>
				</div>
			</main>
		</div>
	);
}
