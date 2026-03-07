import TTStudyCard from "./TTStudyCard";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function WeeklySchedule({ plan, onPlanUpdated, selectedDay, onDaySelect }) {
	const schedule = plan?.schedule || [];
	const scheduleMap = new Map(schedule.map((d) => [d.day, d]));

	return (
		<div className="px-12 py-8 max-w-[1400px] mx-auto">
			{/* Header */}
			<div className="flex justify-between items-center mb-10">
				<h2 className="text-3xl font-semibold text-white">Weekly Schedule</h2>
				<span className="text-slate-400">{plan?.weeklyHours || 0} hrs / week</span>
			</div>

			{/* Vertical days */}
			<div className="grid grid-cols-3 gap-8">
				{daysOfWeek.map((day) => {
					const d = scheduleMap.get(day) || { studyBlocks: [], totalMinutes: 0 };

					const mins = d.totalMinutes || d.studyBlocks.reduce((s, b) => s + b.duration, 0);

					const hours = Math.round((mins / 60) * 10) / 10;

					return (
						<div
							key={day}
							onClick={() => onDaySelect(day)}
							className={`inline-block bg-[#0f172a] rounded-xl border p-6 transition
              ${selectedDay === day ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.25)]" : "border-slate-700 hover:border-slate-600"}`}
						>
							{/* Day Header */}
							<div className="flex justify-between items-center mb-4">
								<div>
									<h3 className="text-white font-semibold text-lg">{day}</h3>
									<div className="h-1 w-36 bg-slate-800 mt-2 rounded">
										<div
											className="h-full bg-blue-500 rounded"
											style={{
												width: `${Math.min((mins / (plan?.weeklyHours * 60 || 1)) * 100, 100)}%`,
											}}
										/>
									</div>
								</div>
								<span className="text-slate-400">{hours}h</span>
							</div>

							{/* Study cards */}
							<div className="flex gap-6 flex-wrap justify-center">
								{d.studyBlocks.length ? (
									d.studyBlocks.map((b, i) => (
										<div key={i} className="w-[340px]">
											<TTStudyCard
												block={b}
												day={day}
												blockIndex={i}
												planId={plan._id || plan.id}
												onPlanUpdated={onPlanUpdated}
												onDaySelect={onDaySelect}
												subjectColor="from-blue-600 to-blue-500"
												subjectBadgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
											/>
										</div>
									))
								) : (
									<div className="text-slate-500 text-sm">No study blocks</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default WeeklySchedule;
