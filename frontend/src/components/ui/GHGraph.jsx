import { useEffect, useState } from "react";

const GHGraph = ({ userName }) => {
	const [ghData, setGHData] = useState(null);
	const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	const curDate = new Date();
	// const [curDay, setCurDay] = useState(curDate.getDay());
	const [curMonth, setCurMonth] = useState(curDate.getMonth());
	const [curYear, setCurYear] = useState(curDate.getFullYear());

	const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
	const firstDayOfMonth = new Date(curYear, curMonth, 1).getDay();

	useEffect(() => {
		const getGHData = async () => {
			// const userName = "Aditya-Pandey-GH";
			const url = `https://github-contributions-api.jogruber.de/v4/${userName}?format=nested&y=${curYear}`;
			const res = await fetch(url);
			const data = await res.json();
			setGHData(data);
		};
		getGHData();
	}, [curYear]);

	const prevMonth = () => {
		if (curYear > 2008 || curMonth > 3) {
			// if (curYear != 2008 || curMonth != 3) {
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
			// if (curYear != curDate.getFullYear() || curMonth != curDate.getMonth()) {
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
						const ghCtrLvl = ghData?.contributions?.[curYear]?.[parseInt(curMonth) + 1]?.[i + 1];
						return (
							<div key={`day-${i}`} className="text-center flex items-center justify-center">
								<div
									title={`${i + 1} ${monthsOfYear[curMonth]} ${curYear} - ${ghCtrLvl?.count || 0} contributions`}
									className={`w-8 h-8 rounded overflow-hidden cursor-pointer flex justify-center items-center ${(() => {
										const level = ghCtrLvl?.level;
										if (level === 4) return "bg-green-300";
										if (level === 3) return "bg-green-500";
										if (level === 2) return "bg-green-700";
										if (level === 1) return "bg-green-900";
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

export default GHGraph;
