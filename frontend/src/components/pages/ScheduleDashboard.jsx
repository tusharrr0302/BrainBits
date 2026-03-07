import { useState } from "react";
import TTWeeklySchedule from "../ui/TTWeeklySchedule";
import TTHeader from "../ui/TTHeader";

function ScheduleDashboard({ plan, onPlanUpdated, onCreateNew }) {
	const [selectedDay, setSelectedDay] = useState(null);

	if (!plan || !plan.schedule) {
		return (
			<div className="min-h-screen bg-dark-950 flex items-center justify-center">
				<div className="text-center">
					<p className="text-dark-300 mb-4">No schedule available</p>
					<button onClick={onCreateNew} className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-all">
						Create New Schedule
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-dark-950">
			<TTHeader plan={plan} onCreateNew={onCreateNew} onPlanUpdated={onPlanUpdated} />
			<div className="container mx-auto px-4 py-8">
				<TTWeeklySchedule plan={plan} onPlanUpdated={onPlanUpdated} selectedDay={selectedDay} onDaySelect={setSelectedDay} />
			</div>
		</div>
	);
}

export default ScheduleDashboard;
