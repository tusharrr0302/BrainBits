import { use } from "react";
import { useEffect, useState } from "react";

const GHGraph = () => {
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
			const userName = "Aditya-Pandey-GH";
			const url = `https://github-contributions-api.jogruber.de/v4/${userName}?format=nested&y=${curYear}`;
			const res = await fetch(url);
			const data = await res.json();
			setGHData(data);
		};
		getGHData();
	}, [curYear]);

	return (
		<>
			<div className="w-fit h-fit p-4">
				{/* Row 1: Dropdowns */}
				<div className="grid grid-cols-2 gap-2 mb-4">
					{/* Months Dropdown */}
					<div className="w-full max-w-sm">
						<div className="relative">
							<select
								name="month"
								id="selectMonth"
								defaultValue={curMonth}
								onChange={(event) => {
									setCurMonth(event.target.value);
								}}
								className="w-full bg-transparent text-sm border rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
							>
								{monthsOfYear.map((month, index) => (
									<option key={index} value={index} className="bg-slate-200 dark:bg-slate-700">
										{month}
									</option>
								))}
							</select>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.2"
								stroke="currentColor"
								className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 -z-1"
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
							</svg>
						</div>
					</div>

					{/* Years Dropdown */}
					<div className="w-full max-w-sm">
						<div className="relative">
							<select
								name="year"
								id="selectYear"
								defaultValue={curYear}
								onChange={(event) => {
									setCurYear(event.target.value);
								}}
								className="w-full bg-transparent text-sm border rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
							>
								{Array.from({ length: 100 }, (_, i) => (
									<option key={i} value={2008 + i} className="bg-slate-200 dark:bg-slate-700">
										{2008 + i}
									</option>
								))}
							</select>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.2"
								stroke="currentColor"
								className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 -z-1"
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
							</svg>
						</div>
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
					{Array.from({ length: daysInMonth }, (_, i) => (
						<div key={`day-${i}`} className="text-center flex items-center justify-center">
							<div
								title={`${i + 1} ${monthsOfYear[curMonth]} ${curYear} - ${
									ghData?.contributions?.[curYear]?.[parseInt(curMonth) + 1]?.[i + 1]?.count || 0
								} contributions`}
								className={`w-6 h-6 rounded overflow-hidden cursor-pointer ${
									ghData?.contributions?.[curYear]?.[parseInt(curMonth) + 1]?.[i + 1]?.level === 4
										? "bg-green-600 dark:bg-green-500"
										: ghData?.contributions?.[curYear]?.[parseInt(curMonth) + 1]?.[i + 1]?.level === 3
										? "bg-green-400 dark:bg-green-700"
										: ghData?.contributions?.[curYear]?.[parseInt(curMonth) + 1]?.[i + 1]?.level === 2
										? "bg-green-300 dark:bg-green-900"
										: ghData?.contributions?.[curYear]?.[parseInt(curMonth) + 1]?.[i + 1]?.level === 1
										? "bg-green-200 dark:bg-green-950"
										: "bg-slate-200 dark:bg-slate-800"
								}`}
							/>
						</div>
					))}
				</div>
			</div>
			{/* {console.log(ghData?.contributions?.[curYear]?.[parseInt(curMonth) + 1])} */}
		</>
	);
};

export default GHGraph;
