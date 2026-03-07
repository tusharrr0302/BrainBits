import { useEffect, useState } from "react";

const LCGraph = ({ userName }) => {
	const [lcData, setLCData] = useState(null);
	const [lcCreateYear, setLCCreateYear] = useState(0);
	const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	const curDate = new Date();
	// const [curDay, setCurDay] = useState(curDate.getDay());
	const [curMonth, setCurMonth] = useState(curDate.getMonth());
	const [curYear, setCurYear] = useState(curDate.getFullYear());

	const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
	const firstDayOfMonth = new Date(curYear, curMonth, 1).getDay();

	useEffect(() => {
		const getLCData = async () => {
			// const url = `https://alfa-leetcode-api.onrender.com/${userName}/calendar?year=${curYear}`;
			const url = `https://alfa-leetcode-api-adi.vercel.app/${userName}/calendar?year=${curYear}`;
			try {
				const res = await fetch(url);
				const data = await res.json();
				setLCData(JSON.parse(data?.submissionCalendar));
				setLCCreateYear(JSON.parse(data?.activeYears?.[0]));
			} catch (error) {
				console.log("Error fetching LeetCode data:", error);
			}
		};
		getLCData();
	}, [curYear]);

	const prevMonth = () => {
		if (curYear > lcCreateYear || curMonth > 0) {
			if (curMonth === 0) {
				setCurMonth(11);
				setCurYear(curYear - 1);
			} else {
				setCurMonth(curMonth - 1);
			}
		}
	};
	const nextMonth = () => {
		if (curYear < curDate.getFullYear() || curMonth < curDate.getMonth()) {
			if (curMonth === 11) {
				setCurMonth(0);
				setCurYear(curYear + 1);
			} else {
				setCurMonth(curMonth + 1);
			}
		}
	};

	return (
		<>
			<div className="w-fit h-fit p-4">
				{/* Row 1: Dropdowns */}
				<div className="flex justify-between items-center mb-4">
					<div className="flex gap-2 text-lg font-bold">
						<span className="">{monthsOfYear[curMonth]}</span>
						<span className="">{curYear}</span>
					</div>
					<div className="flex gap-4">
						<button onClick={prevMonth} className="cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 256 256" fill="none">
								<circle cx="128" cy="128" r="112" strokeWidth="20" fill="none" className="stroke-black dark:stroke-white" />
								<path
									d="M140 76 L88 128 L140 180"
									strokeWidth="20"
									strokeLinecap="round"
									strokeLinejoin="round"
									fill="none"
									className="stroke-black dark:stroke-white"
								/>
							</svg>
						</button>
						<button onClick={nextMonth} className="cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 256 256" fill="none">
								<circle cx="128" cy="128" r="112" strokeWidth="20" fill="none" className="stroke-black dark:stroke-white" />
								<path
									d="M116 76 L168 128 L116 180"
									strokeWidth="20"
									strokeLinecap="round"
									strokeLinejoin="round"
									fill="none"
									className="stroke-black dark:stroke-white"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Row 2: Calendar Grid */}
				<div className="grid grid-cols-7 gap-x-4 gap-y-6">
					{daysOfWeek.map((day) => (
						<div key={day} className="text-center font-semibold">
							{day}
						</div>
					))}
					{Array.from({ length: firstDayOfMonth }, (_, i) => (
						<div key={`empty-${i}`} className="text-center"></div>
					))}
					{Array.from({ length: daysInMonth }, (_, i) => {
						const dateKey = new Date(curYear, curMonth, i + 1).getTime() / 1000 + 19800;
						const commits = lcData?.[dateKey] || 0;
						return (
							<div key={`day-${i}`} className="text-center flex justify-center items-center">
								<div
									title={`${i + 1} ${monthsOfYear[curMonth]} ${curYear} - ${commits} contributions`}
									className={`w-8 h-8 rounded overflow-hidden cursor-pointer flex justify-center items-center ${(() => {
										if (commits >= 8) return "bg-cyan-300";
										if (commits >= 5) return "bg-cyan-500";
										if (commits >= 2) return "bg-cyan-700";
										if (commits >= 1) return "bg-cyan-900";
										return "bg-slate-700";
									})()}`}
								></div>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
};

export default LCGraph;
