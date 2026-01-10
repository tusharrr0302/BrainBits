const LandingHighlight = ({ children }) => {
	return (
		<span className="px-4 py-1 rounded-2xl bg-linear-to-b from-slate-900/75 via-slate-700/75 to-slate-500/75 backdrop-blur-xl">{children}</span>
	);
};

export default LandingHighlight;
